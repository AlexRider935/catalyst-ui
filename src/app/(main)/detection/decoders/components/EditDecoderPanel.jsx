"use client";

import { Fragment, useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  FileJson,
  ChevronsRight,
  ShieldCheck,
  Info,
  Trash2,
  Plus,
  Wand2,
  TestTube,
  FileText,
} from "lucide-react";

// --- REGEX ENGINE (Ported from prototype) ---
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

export default function EditDecoderPanel({
  service,
  decoder,
  isOpen,
  onClose,
  onUpdate,
}) {
  const isCreateMode = !decoder;

  // Main form state
  const [name, setName] = useState("");
  const [logExample, setLogExample] = useState("");
  const [regexPattern, setRegexPattern] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState("config");

  // Visual Builder state
  const [highlightedText, setHighlightedText] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [currentFields, setCurrentFields] = useState([]);

  // Test Bench state
  const [batchTestLogs, setBatchTestLogs] = useState("");
  const [batchTestResults, setBatchTestResults] = useState([]);

  // Integrity Tests state
  const [testCases, setTestCases] = useState([]);
  const [newLogSample, setNewLogSample] = useState("");
  const [newShouldMatch, setNewShouldMatch] = useState(true);
  const [newExpectedOutput, setNewExpectedOutput] = useState("");

  const logInputRef = useRef(null);

  useEffect(() => {
    const fetchTestCases = async () => {
      if (decoder?.id) {
        const response = await fetch(`/api/decoders/${decoder.id}/testcases`);
        const data = await response.json();
        setTestCases(data);
      }
    };

    if (isOpen) {
      setActiveTab("config"); // Reset to first tab on open
      if (decoder) {
        // Edit mode
        setName(decoder.name);
        setLogExample(decoder.log_example || "");
        setRegexPattern(decoder.regex);
        fetchTestCases();
      } else {
        // Create mode
        setName("");
        setLogExample("");
        setRegexPattern("");
        setTestCases([]);
      }
      // Reset builder and test bench state
      setCurrentFields([]);
      setBatchTestLogs("");
      setBatchTestResults([]);
    }
  }, [decoder, isOpen]);

  const handleMainSubmit = async (event) => {
    event.preventDefault();
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
      if (!response.ok)
        throw new Error(
          `Failed to ${isCreateMode ? "create" : "save"} decoder`
        );
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
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
    if (!highlightedText || !fieldName)
      return alert("Please highlight text and provide a field name.");
    setCurrentFields([
      ...currentFields,
      { text: highlightedText, name: fieldName },
    ]);
    setHighlightedText("");
    setFieldName("");
  };

  const handleGenerateRegex = () => {
    if (currentFields.length === 0)
      return alert("Please add at least one field to generate a regex.");
    try {
      const regex = buildRegexFromFields(logExample, currentFields);
      setRegexPattern(regex.source);
      alert(
        "Regular expression generated and populated in the Configuration tab."
      );
      setActiveTab("config");
    } catch (error) {
      alert(`Error generating regex: ${error.message}`);
    }
  };

  const handleRunTestBench = () => {
    if (!regexPattern || !batchTestLogs)
      return alert("Please provide a regex and logs to test.");
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

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        {/* ... Backdrop ... */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full">
                <Dialog.Panel className="pointer-events-auto w-screen max-w-4xl">
                  <form onSubmit={handleMainSubmit} className="flex h-full">
                    {/* Left Panel is unchanged */}
                    <div className="relative flex-1 w-1/3 bg-slate-800/90 text-white p-8 space-y-8 overflow-y-auto">
                      {/*...*/}
                    </div>

                    {/* Right Panel with Tabs */}
                    <div className="flex h-full w-2/3 flex-col bg-white shadow-xl">
                      <div className="h-0 flex-1 overflow-y-auto">
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-6 sm:px-6">
                          <div className="flex items-center justify-between">
                            <Dialog.Title className="text-base font-semibold leading-6 text-slate-900">
                              {isCreateMode
                                ? "Create New Decoder"
                                : `Edit Decoder: ${decoder?.name}`}
                            </Dialog.Title>
                            <button
                              type="button"
                              className="relative rounded-md text-slate-500 hover:text-slate-800"
                              onClick={onClose}>
                              <X className="h-6 w-6" />
                            </button>
                          </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="border-b border-slate-200">
                          <nav className="-mb-px flex space-x-6 px-6">
                            <button
                              type="button"
                              onClick={() => setActiveTab("config")}
                              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                activeTab === "config"
                                  ? "border-blue-500 text-blue-600"
                                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                              }`}>
                              Configuration
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab("builder")}
                              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                activeTab === "builder"
                                  ? "border-blue-500 text-blue-600"
                                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                              }`}>
                              Builder & Test
                            </button>
                            {!isCreateMode && (
                              <button
                                type="button"
                                onClick={() => setActiveTab("integrity")}
                                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                                  activeTab === "integrity"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                }`}>
                                Integrity Tests
                              </button>
                            )}
                          </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-8">
                          {activeTab === "config" && (
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
                                  className="mt-2 block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-900/10 focus:ring-2 focus:ring-inset focus:ring-blue-600"
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
                                  onChange={(e) =>
                                    setLogExample(e.target.value)
                                  }
                                  required
                                  className="mt-2 block w-full rounded-md border-0 font-mono text-sm py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-900/10 focus:ring-2 focus:ring-inset focus:ring-blue-600"
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
                                  onChange={(e) =>
                                    setRegexPattern(e.target.value)
                                  }
                                  required
                                  className="mt-2 block w-full rounded-md border-0 font-mono text-sm py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-900/10 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                                />
                              </div>
                            </div>
                          )}
                          {activeTab === "builder" && (
                            <div className="space-y-6">
                              <div>
                                <label className="block text-sm font-medium leading-6 text-slate-900">
                                  1. Sample Log for Building
                                </label>
                                <p className="text-sm text-slate-500">
                                  Use the log from the Configuration tab.
                                  Highlight text below to define fields.
                                </p>
                                <textarea
                                  ref={logInputRef}
                                  rows={4}
                                  value={logExample}
                                  onMouseUp={handleLogHighlight}
                                  readOnly
                                  className="mt-2 block w-full cursor-text rounded-md border-0 font-mono text-sm py-2 text-slate-900 bg-slate-50 ring-1 ring-inset ring-slate-200"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium leading-6 text-slate-900">
                                  2. Define Fields
                                </label>
                                <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-lg border mt-2">
                                  <input
                                    type="text"
                                    value={highlightedText}
                                    readOnly
                                    placeholder="Highlight text..."
                                    className="w-full p-2 bg-slate-200 border rounded-md font-mono text-sm"
                                  />
                                  <input
                                    type="text"
                                    value={fieldName}
                                    onChange={(e) =>
                                      setFieldName(e.target.value)
                                    }
                                    placeholder="Give it a name..."
                                    className="w-full p-2 border rounded-md"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleAddField}
                                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
                                    Add
                                  </button>
                                </div>
                                <ul className="mt-2 space-y-1 text-sm">
                                  {currentFields.map((f, i) => (
                                    <li
                                      key={i}
                                      className="flex justify-between p-1 bg-slate-100 rounded">
                                      <span>
                                        <code className="bg-yellow-200">
                                          "{f.text}"
                                        </code>{" "}
                                        →{" "}
                                        <b className="text-blue-600">
                                          {f.name}
                                        </b>
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={handleGenerateRegex}
                                  className="w-full flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
                                  <Wand2 className="h-5 w-5" /> Generate Regex
                                </button>
                              </div>
                              <div className="border-t border-slate-200 pt-6 space-y-4">
                                <label className="block text-sm font-medium leading-6 text-slate-900">
                                  3. Quick Test Bench
                                </label>
                                <textarea
                                  value={batchTestLogs}
                                  onChange={(e) =>
                                    setBatchTestLogs(e.target.value)
                                  }
                                  rows={5}
                                  placeholder="Paste one or more logs here to test against the current regex..."
                                  className="mt-2 block w-full rounded-md border-0 font-mono text-sm py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-900/10 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                                />
                                <button
                                  type="button"
                                  onClick={handleRunTestBench}
                                  className="w-full flex items-center justify-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700">
                                  <TestTube className="h-5 w-5" /> Test Current
                                  Regex
                                </button>
                                {batchTestResults.length > 0 && (
                                  <div className="text-sm space-y-1">
                                    {batchTestResults.map((r, i) => (
                                      <div
                                        key={i}
                                        className={`p-1 rounded ${
                                          r.success
                                            ? "bg-green-100"
                                            : "bg-red-100"
                                        }`}>
                                        <code className="block truncate">
                                          {r.log}
                                        </code>
                                        {r.success && (
                                          <pre className="text-xs">
                                            {JSON.stringify(r.groups)}
                                          </pre>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {activeTab === "integrity" && !isCreateMode && (
                            <div className="space-y-6">
                              {/* ... Integrity Test Case UI ... */}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 justify-end border-t border-slate-200 px-4 py-4">
                        <button
                          type="button"
                          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                          onClick={onClose}>
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="ml-4 inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                          {isCreateMode ? "Create Decoder" : "Save Changes"}
                        </button>
                      </div>
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
