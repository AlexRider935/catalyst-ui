"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";

// This is the main component for the Decoders Console.
export default function DecodersPage() {
  // --- STATE MANAGEMENT ---
  // Replaces all global variables from the prototype with React state.
  const [services, setServices] = useState([]);
  const [currentFields, setCurrentFields] = useState([]);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(null);

  // State for controlled inputs in the decoder builder.
  const [logInput, setLogInput] = useState("");
  const [highlightedText, setHighlightedText] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [decoderName, setDecoderName] = useState("");

  // State for the batch processing section.
  const [batchLogInput, setBatchLogInput] = useState("");
  const [processingResults, setProcessingResults] = useState([]);

  // State for the edit modal.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDecoderInfo, setEditingDecoderInfo] = useState(null);
  const [editDecoderName, setEditDecoderName] = useState("");
  const [editDecoderRegex, setEditDecoderRegex] = useState("");

  const logInputRef = useRef(null);

  // --- CORE LOGIC & HANDLERS ---
  // All functions are now encapsulated within the component and operate on state.

  const handleAddService = (name, prefilter) => {
    if (!name || !prefilter) {
      alert("Please provide a service name and a prefilter keyword.");
      return;
    }
    setServices([...services, { name, prefilter, decoders: [] }]);
  };

  const handleSelectService = (index) => {
    setSelectedServiceIndex(index);
    // Reset the builder form when a new service is selected.
    setLogInput("");
    setHighlightedText("");
    setFieldName("");
    setDecoderName("");
    setCurrentFields([]);
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
    if (!highlightedText || !fieldName) {
      alert(
        "Please highlight text from the sample log and provide a field name."
      );
      return;
    }
    setCurrentFields([
      ...currentFields,
      { text: highlightedText, name: fieldName },
    ]);
    setHighlightedText("");
    setFieldName("");
  };

  const handleRemoveField = (index) => {
    setCurrentFields(currentFields.filter((_, i) => i !== index));
  };

  const handleSaveDecoder = () => {
    if (
      selectedServiceIndex === null ||
      !decoderName ||
      currentFields.length === 0 ||
      !logInput
    ) {
      return alert(
        "Please select a service, provide a decoder name, a sample log, and define at least one field."
      );
    }
    try {
      const regex = buildRegexFromFields(logInput, currentFields);
      const newServices = [...services];
      newServices[selectedServiceIndex].decoders.push({
        name: decoderName,
        regex,
      });
      setServices(newServices);

      // Reset form
      setDecoderName("");
      setLogInput("");
      setCurrentFields([]);
    } catch (error) {
      alert(`Error creating decoder: ${error.message}`);
    }
  };

  const handleProcessLogs = () => {
    if (services.length === 0 || !batchLogInput) {
      return alert(
        "Please define at least one service and paste logs to process."
      );
    }
    const logLines = batchLogInput
      .split("\n")
      .filter((line) => line.trim() !== "");
    const results = logLines.map((line) => {
      for (const service of services) {
        if (line.includes(service.prefilter)) {
          for (const decoder of service.decoders) {
            const match = line.match(decoder.regex);
            if (match && match.groups) {
              return {
                Service: service.name,
                Decoder: decoder.name,
                Data: match.groups,
                _status: "success",
              };
            }
          }
        }
      }
      // If no match found after checking all services and decoders
      const matchingService = services.find((s) => line.includes(s.prefilter));
      return {
        "Original Log": line,
        Service: matchingService ? matchingService.name : "Unknown",
        Decoder: "No Match",
        _status: "fail",
      };
    });
    setProcessingResults(results);
  };

  const openEditModal = (serviceIndex, decoderIndex) => {
    const decoder = services[serviceIndex].decoders[decoderIndex];
    setEditingDecoderInfo({ serviceIndex, decoderIndex });
    setEditDecoderName(decoder.name);
    setEditDecoderRegex(decoder.regex.source);
    setIsModalOpen(true);
  };

  const handleSaveDecoderChanges = () => {
    if (!editingDecoderInfo) return;
    const { serviceIndex, decoderIndex } = editingDecoderInfo;

    if (!editDecoderName || !editDecoderRegex) {
      return alert("Decoder name and regex cannot be empty.");
    }

    try {
      const newRegex = new RegExp(editDecoderRegex);
      const updatedServices = [...services];
      updatedServices[serviceIndex].decoders[decoderIndex] = {
        name: editDecoderName,
        regex: newRegex,
      };
      setServices(updatedServices);
      setIsModalOpen(false);
      setEditingDecoderInfo(null);
    } catch (error) {
      alert(`Invalid Regular Expression: ${error.message}`);
    }
  };

  // --- RENDER ---
  // The UI is rendered declaratively based on the current state.
  const selectedService =
    selectedServiceIndex !== null ? services[selectedServiceIndex] : null;

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Decoders
        </h1>
        <p className="mt-1 text-slate-500">
          Create and test decoders to parse logs into structured data. This
          console serves as the Visual Parser Studio.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column: Service and Decoder Management */}
        <div className="space-y-6">
          {/* Service Management */}
          <div className="border border-slate-200 p-4 rounded-lg space-y-4 bg-white">
            <h2 className="text-xl font-bold text-slate-800">
              1. Manage Services
            </h2>
            <ServiceForm onSubmit={handleAddService} />
            <div className="space-y-3">
              {services.length === 0 ? (
                <p className="text-slate-500 text-sm p-4 text-center bg-slate-50 rounded-md">
                  Your services will appear here.
                </p>
              ) : (
                services.map((service, index) => (
                  <ServiceItem
                    key={index}
                    service={service}
                    onSelect={() => handleSelectService(index)}
                    onEditDecoder={openEditModal}
                    serviceIndex={index}
                  />
                ))
              )}
            </div>
          </div>

          {/* Decoder Builder */}
          {selectedService && (
            <div className="border border-slate-200 p-4 rounded-lg space-y-4 bg-white">
              <h2 className="text-xl font-bold text-slate-800">
                2. Build a Decoder for{" "}
                <span className="text-blue-600">{selectedService.name}</span>
              </h2>
              <div className="space-y-2">
                <label
                  htmlFor="log-input"
                  className="text-md font-semibold text-slate-600">
                  Paste Sample Log
                </label>
                <textarea
                  id="log-input"
                  ref={logInputRef}
                  rows="3"
                  className="w-full p-3 border rounded-lg font-mono text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste a sample log for this service..."
                  value={logInput}
                  onChange={(e) => setLogInput(e.target.value)}
                  onMouseUp={handleLogHighlight}></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-md font-semibold text-slate-600">
                  Define Fields by Highlighting
                </label>
                <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-lg border">
                  <input
                    type="text"
                    className="w-full p-2 bg-slate-200 border rounded-md font-mono text-sm"
                    readOnly
                    placeholder="Highlight text..."
                    value={highlightedText}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Give it a name (e.g., client_ip)"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                  />
                  <button
                    onClick={handleAddField}
                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 whitespace-nowrap">
                    Add Field
                  </button>
                </div>
                <ul className="mt-2 space-y-2 text-sm">
                  {currentFields.map((field, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-2 bg-slate-100 rounded-md">
                      <span>
                        <span className="font-mono bg-yellow-200 px-1 rounded">
                          "{field.text}"
                        </span>{" "}
                        &rarr;{" "}
                        <span className="font-semibold text-blue-700">
                          {field.name}
                        </span>
                      </span>
                      <button
                        className="text-red-500 hover:text-red-700 font-bold"
                        onClick={() => handleRemoveField(index)}>
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Decoder Name (e.g., apache_access_log)"
                  value={decoderName}
                  onChange={(e) => setDecoderName(e.target.value)}
                />
                <button
                  onClick={handleSaveDecoder}
                  className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 w-1/2">
                  Save Decoder
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Batch Processing (Decoder Test Bench) */}
        <div className="border border-slate-200 p-4 rounded-lg space-y-4 bg-white">
          <h2 className="text-xl font-bold text-slate-800">
            3. Decoder Test Bench
          </h2>
          <div className="space-y-2">
            <textarea
              rows="20"
              className="w-full p-3 border rounded-lg font-mono text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500"
              placeholder="Paste mixed logs here to test all decoders..."
              value={batchLogInput}
              onChange={(e) => setBatchLogInput(e.target.value)}></textarea>
          </div>
          <div className="text-center">
            <button
              onClick={handleProcessLogs}
              className="w-full bg-slate-800 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-900">
              Process All Logs
            </button>
          </div>
          {processingResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-700">
                Processing Results
              </h3>
              <div className="w-full overflow-x-auto border rounded-lg max-h-[40rem]">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Decoder
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Parsed Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {processingResults.map((result, index) => (
                      <tr
                        key={index}
                        className={
                          result._status === "fail" ? "bg-red-50" : ""
                        }>
                        {result._status === "fail" ? (
                          <td
                            colSpan="3"
                            className="px-6 py-4 text-sm text-red-700">
                            <div className="flex items-center">
                              <span className="font-bold mr-2 text-red-800">
                                [{result.Service} | {result.Decoder}]
                              </span>{" "}
                              <span className="font-mono text-red-900">
                                {result["Original Log"]}
                              </span>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                              {result.Service}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                              {result.Decoder}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-800">
                              <pre className="bg-slate-100 p-2 rounded-md text-xs">
                                <code>
                                  {JSON.stringify(result.Data, null, 2)}
                                </code>
                              </pre>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Decoder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 transition-opacity">
          <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-slate-900">
                Edit Decoder
              </h3>
              <div className="mt-4 px-7 py-3 space-y-4 text-left">
                <div>
                  <label
                    htmlFor="edit-decoder-name"
                    className="text-sm font-medium text-slate-700">
                    Decoder Name
                  </label>
                  <input
                    type="text"
                    id="edit-decoder-name"
                    className="w-full p-2 mt-1 border rounded-md"
                    value={editDecoderName}
                    onChange={(e) => setEditDecoderName(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-decoder-regex"
                    className="text-sm font-medium text-slate-700">
                    Regular Expression
                  </label>
                  <textarea
                    id="edit-decoder-regex"
                    rows="5"
                    className="w-full p-2 mt-1 border rounded-md font-mono text-sm"
                    value={editDecoderRegex}
                    onChange={(e) =>
                      setEditDecoderRegex(e.target.value)
                    }></textarea>
                </div>
              </div>
              <div className="items-center px-4 py-3 space-x-2">
                <button
                  onClick={handleSaveDecoderChanges}
                  className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300">
                  Save Changes
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 text-base font-medium rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// --- HELPER COMPONENTS & LOGIC ---

// A controlled component for adding new services.
function ServiceForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [prefilter, setPrefilter] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(name, prefilter);
    setName("");
    setPrefilter("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded-md"
        placeholder="New Service Name (e.g., Apache)"
      />
      <input
        type="text"
        value={prefilter}
        onChange={(e) => setPrefilter(e.target.value)}
        className="w-full p-2 border rounded-md"
        placeholder="Prefilter Keyword (e.g., HTTP)"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 whitespace-nowrap">
        Add Service
      </button>
    </form>
  );
}

// A component to display a single service and its decoders.
function ServiceItem({ service, onSelect, onEditDecoder, serviceIndex }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800">
          {service.name}{" "}
          <span className="text-sm font-normal text-slate-500">
            (Prefilter: "{service.prefilter}")
          </span>
        </h3>
        <button
          className="bg-blue-100 text-blue-700 text-sm font-semibold py-1 px-3 rounded-lg hover:bg-blue-200"
          onClick={onSelect}>
          Add Decoder
        </button>
      </div>
      <div className="mt-3 ml-4 space-y-2">
        {service.decoders.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No decoders yet.</p>
        ) : (
          service.decoders.map((d, decoderIndex) => (
            <div key={decoderIndex} className="p-2 border-l-4 border-slate-200">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-slate-700 font-mono">
                  {d.name}
                </p>
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => onEditDecoder(serviceIndex, decoderIndex)}>
                  Edit
                </button>
              </div>
              <pre className="text-xs text-slate-500 bg-slate-100 p-1 rounded mt-1 overflow-x-auto">
                <code>{d.regex.source}</code>
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- REGEX ENGINE ---
// This pure logic is transplanted directly from the prototype. It is highly effective.
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
    regexParts.push(escapeForRegex(delimiter).replace(/\s+/g, "\\s+")); // Make whitespace flexible

    const pattern = inferCapturePattern(field.text);
    regexParts.push(`(?<${field.name}>${pattern})`);

    lastIndex = field.index + field.text.length;
  }
  const suffix = logString.substring(lastIndex);
  regexParts.push(escapeForRegex(suffix).replace(/\s+/g, "\\s+"));

  // Do not anchor to the end ($) to allow for variable log endings unless specified.
  // regexParts.push('$');
  return new RegExp(regexParts.join(""));
}
