"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Loader2, X, Lock, User, CalendarDays } from "lucide-react";
import { format } from "date-fns";

// --- Configuration Component for Webhooks ---
const EditWebhookConfig = ({ config, onConfigChange }) => (
  <div className="space-y-4">
    <div>
      <label
        htmlFor="webhook-url"
        className="block text-sm font-medium text-slate-700">
        Webhook URL
      </label>
      <div className="relative mt-1">
        <Lock
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="password"
          id="webhook-url"
          autoComplete="new-password"
          onChange={(e) => onConfigChange({ ...config, url: e.target.value })}
          className="block w-full rounded-md border-slate-300 pl-9 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Value is encrypted and write-only"
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Leave blank to keep the existing value.
      </p>
    </div>
    <div>
      <label
        htmlFor="webhook-secret"
        className="block text-sm font-medium text-slate-700">
        Shared Secret
      </label>
      <div className="relative mt-1">
        <Lock
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="password"
          id="webhook-secret"
          autoComplete="new-password"
          onChange={(e) =>
            onConfigChange({ ...config, secret: e.target.value })
          }
          className="block w-full rounded-md border-slate-300 pl-9 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Value is encrypted and write-only"
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Leave blank to keep the existing value.
      </p>
    </div>
  </div>
);

// --- Fallback Component for Integrations with No Config ---
const GenericConfig = () => (
  <p className="text-sm text-slate-500 text-center bg-slate-50 p-4 rounded-md border border-slate-200">
    This integration type has no additional editable configuration.
  </p>
);

// --- Main Edit Integration Modal Component ---
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
      // Initialize config as an empty object.
      // The form will only handle writing/updating sensitive fields, not reading them.
      setConfig({});
    }
  }, [integration]);

  if (!isOpen || !integration) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // ARCHITECT'S NOTE: Critical Security Feature.
    // Filter out any config values that are empty strings.
    // This prevents accidentally overwriting an existing secret with an empty value.
    const updatedConfig = Object.entries(config).reduce((acc, [key, value]) => {
      if (value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {});

    await onSave({ ...integration, name, config: updatedConfig });
    setIsSaving(false);
  };

  const renderConfigComponent = () => {
    const components = {
      webhook: EditWebhookConfig,
      // Add other specific integration config components here
    };
    const Component = components[integration.type] || GenericConfig;
    return <Component config={config} onConfigChange={setConfig} />;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel
                as="form"
                onSubmit={handleSubmit}
                className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold capitalize leading-6 text-slate-900">
                    Edit {integration.type} Integration
                  </Dialog.Title>
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

                <div className="flex items-center justify-between bg-slate-50 p-4 border-t border-slate-200">
                  {/* AUDIT TRAIL FOOTER */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div
                      className="flex items-center gap-1.5"
                      title={`Last updated at ${new Date(
                        integration.updatedAt
                      ).toLocaleString()}`}>
                      <CalendarDays size={14} />
                      <span>
                        {format(new Date(integration.updatedAt), "PP")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User size={14} />
                      <span>{integration.configuredBy}</span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
