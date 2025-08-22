"use client";

import { Info, KeyRound, Puzzle, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";

// --- Main Component ---
// Silas: This component is now 'controlled'. It holds no internal state.
// It receives its data via the `config` prop and reports all changes
// up to the parent workbench via the `onConfigChange` function prop.
export default function WebhookConfig({ config, onConfigChange }) {
  // A helper function to update a specific field in the parent's state.
  const updateConfig = (key, value) => {
    onConfigChange({ ...config, [key]: value });
  };

  const generateSecret = () => {
    const newSecret = `cat_sec_${[...Array(32)]
      .map(() => Math.random().toString(36)[2])
      .join("")}`;
    updateConfig("secret", newSecret);
  };

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...(config.headers || [])];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    updateConfig("headers", newHeaders);
  };

  const addHeader = () => {
    const newHeaders = [...(config.headers || []), { key: "", value: "" }];
    updateConfig("headers", newHeaders);
  };

  const removeHeader = (index) => {
    const newHeaders = (config.headers || []).filter((_, i) => i !== index);
    updateConfig("headers", newHeaders);
  };

  const defaultPayloadExample = JSON.stringify(
    {
      alert: {
        id: "01H8X...",
        severity: "Critical",
        timestamp: "2025-08-22T08:30:00Z",
      },
      rule: { id: "rules-123", name: "Unusual Login Activity Detected" },
      context: { source_ip: "123.45.67.89", user: "admin" },
    },
    null,
    2
  );

  // Initialize headers if they don't exist in the config prop
  const headers = config.headers || [];

  return (
    // Silas: The component is now just a div, not a full form. The parent workbench handles the form submission.
    <div className="space-y-6">
      {/* --- Section 1: General Configuration --- */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800">
          Webhook Configuration
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Send playbook data to any external API endpoint.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700">
              Integration Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={config.name || ""}
              onChange={(e) => updateConfig("name", e.target.value)}
              placeholder="e.g., Production SIEM Endpoint"
              className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="targetUrl"
              className="block text-sm font-medium text-slate-700">
              Target URL
            </label>
            <input
              type="url"
              name="targetUrl"
              id="targetUrl"
              value={config.targetUrl || ""}
              onChange={(e) => updateConfig("targetUrl", e.target.value)}
              placeholder="https://your-api.com/endpoint"
              className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm text-sm"
              required
            />
          </div>
        </div>
      </div>

      {/* --- Section 2: Security & Headers --- */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800">
          Security & Headers
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="secret"
              className="block text-sm font-medium text-slate-700">
              Signing Secret
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                name="secret"
                id="secret"
                value={config.secret || ""}
                onChange={(e) => updateConfig("secret", e.target.value)}
                placeholder="A strong, unique secret for payload signing"
                className="flex-1 block w-full rounded-lg border-slate-300 shadow-sm text-sm font-mono"
              />
              <button
                type="button"
                onClick={generateSecret}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <KeyRound size={16} /> Generate
              </button>
            </div>
            <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600 flex items-start gap-3">
              <Info size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <span>
                We use this secret to generate an{" "}
                <b className="text-slate-700 font-mono">HMAC-SHA256</b>{" "}
                signature, sent in the{" "}
                <b className="text-slate-700 font-mono">X-Catalyst-Signature</b>{" "}
                header for you to validate.
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Custom Headers
            </label>
            <p className="text-xs text-slate-500">
              Add custom headers, like{" "}
              <span className="font-mono">Authorization</span> tokens.
            </p>
            <div className="mt-2 space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={header.key}
                    onChange={(e) =>
                      handleHeaderChange(index, "key", e.target.value)
                    }
                    placeholder="Header Name"
                    className="w-1/3 rounded-lg border-slate-300 text-sm"
                  />
                  <input
                    type="text"
                    value={header.value}
                    onChange={(e) =>
                      handleHeaderChange(index, "value", e.target.value)
                    }
                    placeholder="Header Value"
                    className="flex-1 rounded-lg border-slate-300 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeHeader(index)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addHeader}
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                <Plus size={16} /> Add Header
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Section 3: Payload Configuration --- */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800">Payload</h3>
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-100 p-1 w-fit">
          <button
            type="button"
            onClick={() => updateConfig("payloadType", "default")}
            className={clsx(
              "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
              config.payloadType === "default" || !config.payloadType
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:bg-white/50"
            )}>
            Default
          </button>
          <button
            type="button"
            onClick={() => updateConfig("payloadType", "custom")}
            className={clsx(
              "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
              config.payloadType === "custom"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:bg-white/50"
            )}>
            Custom
          </button>
        </div>
        <div className="mt-4">
          {config.payloadType === "default" || !config.payloadType ? (
            <div>
              <p className="text-sm text-slate-600 mb-2">
                We will send a standardized JSON payload. Example:
              </p>
              <pre className="p-4 rounded-lg bg-slate-900 text-green-400 text-xs font-mono border border-slate-700">
                {defaultPayloadExample}
              </pre>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-600 mb-2">
                Construct a custom JSON payload. Use variables like{" "}
                <span className="font-mono bg-slate-100 p-0.5 rounded-sm">{`{{alert.id}}`}</span>
                .
              </p>
              <textarea
                value={config.customPayload || ""}
                onChange={(e) => updateConfig("customPayload", e.target.value)}
                rows={10}
                className="w-full p-4 font-mono text-sm bg-slate-900 text-green-400 rounded-lg border-slate-700 focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
