// src/app/(main)/settings/api/page.jsx

"use client";

import { useState, Fragment } from "react";
import {
  KeyRound,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Dialog, Transition, Switch } from "@headlessui/react";
import clsx from "clsx";

// --- Mock Data ---
const initialApiKeys = [
  {
    id: "key-1",
    name: "CI/CD Deployment Script",
    prefix: "cat_sk_a1b2",
    scopes: ["read:rules", "write:rules"],
    createdAt: "2025-08-20T10:00:00Z",
    lastUsed: "2025-08-21T09:30:00Z",
  },
  {
    id: "key-2",
    name: "Splunk Data Forwarder",
    prefix: "cat_sk_c3d4",
    scopes: ["read:logs"],
    createdAt: "2025-08-15T14:20:00Z",
    lastUsed: "2025-08-21T10:30:00Z",
  },
];

const ALL_SCOPES = [
  {
    id: "read:rules",
    name: "Read Rules",
    description: "Allows reading detection rules and groups.",
  },
  {
    id: "write:rules",
    name: "Write Rules",
    description: "Allows creating, updating, and deleting rules.",
  },
  {
    id: "read:logs",
    name: "Read Logs",
    description: "Allows querying active response and audit logs.",
  },
  {
    id: "write:integrations",
    name: "Manage Integrations",
    description: "Allows configuring and testing integrations.",
  },
];

// --- Main API Page ---
export default function ApiKeysPage() {
  const [keys, setKeys] = useState(initialApiKeys);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState([]);
  const [generatedKey, setGeneratedKey] = useState(null);

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    // Simulate API call to create the key
    const newKey = `cat_sk_${[...Array(32)]
      .map(() => Math.random().toString(36)[2])
      .join("")}`;
    setGeneratedKey(newKey);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setGeneratedKey(null);
    setNewKeyName("");
    setSelectedScopes([]);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    // In a real app, show a toast notification
  };

  const handleScopeChange = (scopeId) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId)
        ? prev.filter((s) => s !== scopeId)
        : [...prev, scopeId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">API Access</h1>
          <p className="mt-1 text-slate-500">
            Manage API keys to programmatically interact with The Catalyst
            platform.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
          <Plus size={18} /> Generate New Key
        </button>
      </div>

      {/* API Keys Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Key Prefix
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Scopes
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Last Used
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {keys.map((key) => (
              <tr key={key.id}>
                <td className="px-6 py-4 font-semibold text-slate-800">
                  {key.name}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                  {key.prefix}...
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {key.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {scope}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {new Date(key.lastUsed).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm font-semibold text-red-600 hover:text-red-800">
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Key Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/30" />
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {generatedKey ? (
                    <>
                      <Dialog.Title
                        as="h3"
                        className="text-xl font-bold leading-6 text-slate-900">
                        API Key Generated
                      </Dialog.Title>
                      <div className="mt-4">
                        <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50 border border-amber-200">
                          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800">
                            **Important:** This is the only time you will see
                            this key. Copy it and store it in a secure location.
                          </p>
                        </div>
                        <div className="mt-4 flex items-center gap-2 relative">
                          <input
                            type="text"
                            readOnly
                            value={generatedKey}
                            className="block w-full rounded-lg border-slate-300 bg-slate-50 font-mono text-sm pr-10"
                          />
                          <button
                            onClick={copyKey}
                            className="absolute right-2 p-1 text-slate-500 hover:text-slate-800">
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="inline-flex justify-center rounded-lg border border-transparent bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                          Done
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleGenerateKey}>
                      <Dialog.Title
                        as="h3"
                        className="text-xl font-bold leading-6 text-slate-900">
                        Generate New API Key
                      </Dialog.Title>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label
                            htmlFor="keyName"
                            className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Key Name
                          </label>
                          <input
                            type="text"
                            id="keyName"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="e.g., CI/CD Deployment Script"
                            className="block w-full rounded-lg border-slate-300 shadow-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Permissions (Scopes)
                          </label>
                          <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                            {ALL_SCOPES.map((scope) => (
                              <div key={scope.id} className="flex items-start">
                                <div className="flex h-6 items-center">
                                  <input
                                    id={scope.id}
                                    onChange={() => handleScopeChange(scope.id)}
                                    checked={selectedScopes.includes(scope.id)}
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                                  />
                                </div>
                                <div className="ml-3 text-sm leading-6">
                                  <label
                                    htmlFor={scope.id}
                                    className="font-medium text-slate-800">
                                    {scope.name}
                                  </label>
                                  <p className="text-slate-500">
                                    {scope.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                          Generate Key
                        </button>
                      </div>
                    </form>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
