// components/EditIntegrationModal.jsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";

// --- Placeholders for specific integration edit forms ---
// In a real application, you would create a file for each of these.

const EditSlackConfig = ({ config, onConfigChange }) => (
  <div>
    <label
      htmlFor="webhook-url"
      className="block text-sm font-medium text-slate-700">
      Webhook URL
    </label>
    <input
      type="password"
      id="webhook-url"
      value={config.webhookUrl || ""}
      onChange={(e) =>
        onConfigChange({ ...config, webhookUrl: e.target.value })
      }
      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      placeholder="Value is encrypted"
    />
    <p className="mt-1 text-xs text-slate-500">
      Leave blank to keep the existing value.
    </p>
  </div>
);

const EditJiraConfig = ({ config, onConfigChange }) => (
  <div>
    <label
      htmlFor="jira-domain"
      className="block text-sm font-medium text-slate-700">
      Jira Domain
    </label>
    <input
      type="text"
      id="jira-domain"
      value={config.domain || ""}
      onChange={(e) => onConfigChange({ ...config, domain: e.target.value })}
      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      placeholder="company.atlassian.net"
    />
  </div>
);

const GenericConfig = ({ config, onConfigChange }) => (
  <p className="text-sm text-slate-500 text-center bg-slate-50 p-4 rounded-md">
    This integration type has no additional editable configuration.
  </p>
);

export default function EditIntegrationModal({
  isOpen,
  onClose,
  onSave,
  integration,
}) {
  const [name, setName] = useState("");
  const [config, setConfig] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (integration) {
      setName(integration.name);
      // IMPORTANT: Only set the config if it exists.
      // Don't pass the full sensitive config from the server to the client.
      // The server should only send non-sensitive fields.
      setConfig(integration.config || {});
    }
  }, [integration]);

  if (!isOpen || !integration) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Pass the full updated object back to the parent
    await onSave({ ...integration, name, config });
    setIsSaving(false);
  };

  const renderConfigComponent = () => {
    const components = {
      slack: EditSlackConfig,
      jira: EditJiraConfig,
      // Add other integration types here
    };
    const Component = components[integration.type] || GenericConfig;
    return <Component config={config} onConfigChange={setConfig} />;
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
            <h3 className="text-lg font-semibold leading-6 text-slate-900">
              Edit {integration.type} Integration
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-200">
              <X size={20} className="text-slate-600" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label
                htmlFor="integration-name"
                className="block text-sm font-medium text-slate-700">
                Integration Name
              </label>
              <input
                type="text"
                id="integration-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Configuration
              </label>
              {renderConfigComponent()}
            </div>
          </div>
          <div className="flex justify-end gap-3 bg-slate-50 p-4 border-t border-slate-200">
            <button
              type="button"
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              onClick={onClose}
              disabled={isSaving}>
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
              disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>,
    document.body
  );
}
