"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Wand2, TestTube, Loader2, Trash2 } from "lucide-react";
import clsx from "clsx";

// --- REGEX ENGINE (Functionality unchanged) ---
function escapeForRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inferCapturePattern(text) {
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(text))
    return `\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}`;
  if (text.startsWith("'") && text.endsWith("'")) return `'[^']+'`;
  if (text.startsWith('"') && text.endsWith('"')) return `"[^"]+"`;
  if (/^-?\d+(\.\d+)?$/.test(text)) return `-?\\d+(?:\\.\\d+)?`;
  if (text.startsWith("/")) return `\\S+`;
  if (!/\s/.test(text)) return `\\S+`;
  return `.+?`;
}

function buildRegexFromFields(logString, fields) {
  if (fields.length === 0) throw new Error("No fields defined.");
  const sortedFields = [...fields]
    .map((f) => ({ ...f, index: logString.indexOf(f.text) }))
    .filter((f) => f.index !== -1)
    .sort((a, b) => a.index - b.index);
  if (sortedFields.length === 0)
    throw new Error("Defined fields were not found in the sample log.");
  let regexParts = ["^"];
  let lastIndex = 0;
  for (const field of sortedFields) {
    const delimiter = logString.substring(lastIndex, field.index);
    regexParts.push(escapeForRegex(delimiter).replace(/\s+/g, "\\s+"));
    const pattern = inferCapturePattern(field.text);
    regexParts.push(`(?<${field.name}>${pattern})`);
    lastIndex = field.index + field.text.length;
  }
  const suffix = logString.substring(lastIndex);
  regexParts.push(escapeForRegex(suffix).replace(/\s+/g, "\\s+"));
  return new RegExp(regexParts.join(""));
}

// --- NEW HELPER FUNCTION ---
function parseFieldsFromRegex(regexString) {
  if (!regexString) return [];
  const namedCaptureGroupRegex = /\(\?<([a-zA-Z0-9_]+)>/g;
  const fields = [];
  let match;
  while ((match = namedCaptureGroupRegex.exec(regexString)) !== null) {
    fields.push({
      name: match[1],
      text: "From Regex", // Placeholder text for fields parsed from existing regex
    });
  }
  return fields;
}

// --- MAIN COMPONENT ---
export default function EditDecoderPanel({
  service,
  decoder,
  isOpen,
  onClose,
  onUpdate,
}) {
  const isCreateMode = !decoder;

  // State functionality is unchanged
  const [name, setName] = useState("");
  const [logExample, setLogExample] = useState("");
  const [regexPattern, setRegexPattern] = useState("");
  const [activeTab, setActiveTab] = useState("config");
  const [highlightedText, setHighlightedText] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [currentFields, setCurrentFields] = useState([]);
  const [batchTestLogs, setBatchTestLogs] = useState("");
  const [batchTestResults, setBatchTestResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const logInputRef = useRef(null);

  // Logic updated to pre-populate fields in edit mode
  useEffect(() => {
    if (isOpen) {
      setActiveTab("config");
      if (decoder) {
        // Edit mode
        setName(decoder.name);
        setLogExample(decoder.log_example || "");
        setRegexPattern(decoder.regex);
        // Pre-populate fields from the existing regex
        setCurrentFields(parseFieldsFromRegex(decoder.regex));
      } else {
        // Create mode
        setName("");
        setLogExample("");
        setRegexPattern("");
        setCurrentFields([]);
      }
      setHighlightedText("");
      setFieldName("");
      setBatchTestLogs("");
      setBatchTestResults([]);
      setError(null);
      setIsSubmitting(false);
    }
  }, [decoder, isOpen]);

  const handleMainSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      name,
      log_example: logExample,
      regex_pattern: regexPattern,
    };
    const url = isCreateMode
      ? `/api/services/${service.id}/decoders`
      : `/api/decoders/${decoder.id}`;
    const method = isCreateMode ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isCreateMode ? payload : { ...payload, is_active: decoder.isActive }
        ),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to ${isCreateMode ? "create" : "save"} decoder`
        );
      }
      onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleLogHighlight = () => {
    const textarea = logInputRef.current;
    if (textarea) {
      const selection = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
      );
      if (selection) setHighlightedText(selection);
    }
  };

  const handleAddField = () => {
    if (!highlightedText || !fieldName) return;
    setCurrentFields([
      ...currentFields,
      { text: highlightedText, name: fieldName.trim().replace(/\s+/g, "_") },
    ]);
    setHighlightedText("");
    setFieldName("");
  };

  const handleGenerateRegex = () => {
    // Filter out fields that were just placeholders from an existing regex
    const fieldsToBuild = currentFields.filter((f) => f.text !== "From Regex");
    if (fieldsToBuild.length === 0) return;
    try {
      const regex = buildRegexFromFields(logExample, fieldsToBuild);
      setRegexPattern(regex.source);
      setActiveTab("config");
    } catch (error) {
      setError(`Regex Generation Error: ${error.message}`);
    }
  };

  const handleRunTestBench = () => {
    if (!regexPattern || !batchTestLogs) return;
    const regex = new RegExp(regexPattern);
    const logLines = batchTestLogs.split("\n").filter((line) => line.trim());
    const results = logLines.map((line) => {
      const match = line.match(regex);
      return {
        log: line,
        success: !!match,
        groups: match?.groups || null,
      };
    });
    setBatchTestResults(results);
  };

  const handleRemoveField = (indexToRemove) => {
    setCurrentFields(
      currentFields.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full">
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <form
                    onSubmit={handleMainSubmit}
                    className="flex h-full flex-col bg-white shadow-xl">
                    <div className="p-6 border-b border-slate-200 bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <Dialog.Title className="text-base font-semibold leading-6 text-slate-900">
                            {isCreateMode
                              ? "Create New Decoder"
                              : `Edit Decoder: ${decoder?.name}`}
                          </Dialog.Title>
                          <p className="mt-1 text-sm text-slate-500">
                            for the '{service?.name}' service.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="relative rounded-md text-slate-500 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={onClose}>
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    <div className="border-b border-slate-200">
                      <nav className="-mb-px flex space-x-6 px-6">
                        <TabButton
                          id="config"
                          activeTab={activeTab}
                          setActiveTab={setActiveTab}
                          label="Configuration"
                        />
                        <TabButton
                          id="builder"
                          activeTab={activeTab}
                          setActiveTab={setActiveTab}
                          label="Builder & Test"
                        />
                      </nav>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                      {activeTab === "config" && (
                        <ConfigurationTab
                          name={name}
                          setName={setName}
                          logExample={logExample}
                          setLogExample={setLogExample}
                          regexPattern={regexPattern}
                          setRegexPattern={setRegexPattern}
                        />
                      )}
                      {activeTab === "builder" && (
                        <BuilderTab
                          logExample={logExample}
                          logInputRef={logInputRef}
                          handleLogHighlight={handleLogHighlight}
                          highlightedText={highlightedText}
                          fieldName={fieldName}
                          setFieldName={setFieldName}
                          handleAddField={handleAddField}
                          currentFields={currentFields}
                          handleGenerateRegex={handleGenerateRegex}
                          batchTestLogs={batchTestLogs}
                          setBatchTestLogs={setBatchTestLogs}
                          handleRunTestBench={handleRunTestBench}
                          batchTestResults={batchTestResults}
                          onRemoveField={handleRemoveField}
                          regexPattern={regexPattern}
                        />
                      )}
                    </div>

                    {error && (
                      <div className="px-6 pb-4">
                        <div className="rounded-md bg-red-50 p-3">
                          <p className="text-sm font-medium text-red-700">
                            {error}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-shrink-0 justify-end gap-3 px-6 py-4 border-t border-slate-200">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 bg-white py-2 px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                        onClick={onClose}>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={clsx(
                          "inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800",
                          "focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2",
                          "disabled:opacity-50"
                        )}>
                        {isSubmitting && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {isSubmitting
                          ? "Saving..."
                          : isCreateMode
                          ? "Create Decoder"
                          : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

// --- SUB-COMPONENTS for Tabs ---

const TabButton = ({ id, activeTab, setActiveTab, label }) => (
  <button
    type="button"
    onClick={() => setActiveTab(id)}
    className={clsx(
      "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none",
      activeTab === id
        ? "border-blue-500 text-blue-600"
        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
    )}>
    {label}
  </button>
);

const ConfigurationTab = ({
  name,
  setName,
  logExample,
  setLogExample,
  regexPattern,
  setRegexPattern,
}) => (
  <div className="space-y-6">
    <div>
      <label
        htmlFor="decoder-name"
        className="block text-sm font-medium leading-6 text-slate-900">
        Decoder Name
      </label>
      <input
        type="text"
        id="decoder-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="mt-2 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>
    <div>
      <label
        htmlFor="log-example"
        className="block text-sm font-medium leading-6 text-slate-900">
        Example Log
      </label>
      <textarea
        id="log-example"
        rows={4}
        value={logExample}
        onChange={(e) => setLogExample(e.target.value)}
        required
        className="mt-2 block w-full rounded-md border-slate-300 font-mono text-xs shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label
        htmlFor="regex-pattern"
        className="block text-sm font-medium leading-6 text-slate-900">
        Regular Expression
      </label>
      <textarea
        id="regex-pattern"
        rows={6}
        value={regexPattern}
        onChange={(e) => setRegexPattern(e.target.value)}
        required
        className="mt-2 block w-full rounded-md border-slate-300 font-mono text-xs shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  </div>
);

const BuilderTab = ({
  logExample,
  logInputRef,
  handleLogHighlight,
  highlightedText,
  fieldName,
  setFieldName,
  handleAddField,
  currentFields,
  handleGenerateRegex,
  batchTestLogs,
  setBatchTestLogs,
  handleRunTestBench,
  batchTestResults,
  onRemoveField,
  regexPattern,
}) => (
  <div className="space-y-8">
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-800">
        Step 1: Highlight Log to Define Fields
      </h3>
      <p className="text-sm text-slate-500">
        Use the sample log from the Configuration tab. Click and drag to select
        parts of the log you want to extract.
      </p>
      <textarea
        ref={logInputRef}
        rows={4}
        value={logExample}
        onMouseUp={handleLogHighlight}
        readOnly
        className="mt-2 block w-full cursor-text rounded-md border-slate-300 bg-slate-50 font-mono text-xs shadow-sm"
      />
    </div>

    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-800">
        Step 2: Name Your Fields
      </h3>
      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
        <input
          type="text"
          value={highlightedText}
          readOnly
          placeholder="Highlighted Text"
          className="w-full p-2 bg-slate-200 border-slate-300 rounded-md font-mono text-xs"
        />
        <input
          type="text"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          placeholder="Field Name (e.g., src_ip)"
          className="w-full p-2 border-slate-300 rounded-md text-sm"
        />
        <button
          type="button"
          onClick={handleAddField}
          disabled={!highlightedText || !fieldName}
          className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 disabled:opacity-50">
          Add
        </button>
      </div>
      {currentFields.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm">
          {currentFields.map((f, i) => (
            <li
              key={i}
              className="group flex items-center justify-between p-1.5 bg-slate-100 rounded">
              <span className="font-mono text-xs">
                {f.text !== "From Regex" ? (
                  <>
                    <span className="bg-yellow-200/80 px-1 rounded">
                      "{f.text}"
                    </span>
                    <span className="text-slate-400 mx-2">→</span>
                  </>
                ) : (
                  <span className="text-slate-500 italic mr-2">
                    Existing Field:
                  </span>
                )}
                <span className="font-semibold text-blue-600">{f.name}</span>
              </span>
              {/* --- BUG FIX --- */}
              <button
                type="button"
                onClick={() => onRemoveField(i)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-800">
        Step 3: Generate & Test
      </h3>
      <button
        type="button"
        onClick={handleGenerateRegex}
        disabled={
          currentFields.filter((f) => f.text !== "From Regex").length === 0
        }
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50">
        <Wand2 className="h-5 w-5" /> Generate Regex from New Fields
      </button>
      <div className="border-t border-slate-200 pt-6 space-y-2">
        <h4 className="text-sm font-semibold text-slate-800">
          Quick Test Bench
        </h4>
        <textarea
          value={batchTestLogs}
          onChange={(e) => setBatchTestLogs(e.target.value)}
          rows={5}
          placeholder="Paste one or more logs here to test against the current regex..."
          className="mt-2 block w-full rounded-md border-slate-300 font-mono text-xs shadow-sm"
        />
        <button
          type="button"
          onClick={handleRunTestBench}
          disabled={!regexPattern || !batchTestLogs}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50">
          <TestTube className="h-5 w-5" /> Test Current Regex
        </button>
        {batchTestResults.length > 0 && (
          <div className="text-sm space-y-1 mt-4">
            {batchTestResults.map((r, i) => (
              <div
                key={i}
                className={clsx(
                  "p-2 rounded font-mono text-xs",
                  r.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                )}>
                <p className="block truncate text-slate-600">{r.log}</p>
                {r.success && (
                  <pre className="text-xs text-green-800 mt-1 bg-green-100 p-1 rounded">
                    {JSON.stringify(r.groups, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
