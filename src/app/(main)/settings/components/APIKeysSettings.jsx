"use client";

import { useState, Fragment } from "react";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  MoreVertical,
  KeyRound,
  AlertTriangle,
  X,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import { Menu, Transition } from "@headlessui/react";

// --- Reusable Components ---
const SettingsCard = ({ title, description, children, headerAction }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {headerAction && <div>{headerAction}</div>}
    </div>
    {children}
  </div>
);

// --- Modals ---
const CreateKeyModal = ({ isOpen, onClose, onKeyGenerated }) => {
  if (!isOpen) return null;

  const handleGenerate = () => {
    // In a real app, this would come from the backend
    const newKey = `cat_live_${[...Array(32)]
      .map(() => Math.random().toString(36)[2])
      .join("")}`;
    onKeyGenerated({
      name: "My New Key", // This would come from form state
      key: newKey,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl m-4">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Create New API Key
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure permissions and restrictions for this key.
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <label
              htmlFor="keyName"
              className="block text-sm font-medium text-slate-700">
              Key Name
            </label>
            <input
              type="text"
              id="keyName"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., CI/CD Pipeline Key"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-700">
              Permissions (Scopes)
            </h3>
            <p className="text-xs text-slate-500">
              Select the permissions this key will have.
            </p>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "events:read",
                "events:write",
                "rules:read",
                "rules:write",
                "ingestion:write",
                "users:read",
              ].map((scope) => (
                <label key={scope} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-mono text-slate-600">
                    {scope}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="ipRestrictions"
              className="block text-sm font-medium text-slate-700">
              IP Address Restrictions
            </label>
            <p className="text-xs text-slate-500">
              For added security, restrict this key to a set of IP addresses
              (one per line).
            </p>
            <textarea
              id="ipRestrictions"
              rows={3}
              className="mt-2 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono text-xs"
              placeholder="203.0.113.1/24&#10;198.51.100.5"
            />
          </div>
        </div>
        <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            Generate Key
          </button>
        </div>
      </div>
    </div>
  );
};

const ShowKeyModal = ({ generatedKey, onClose }) => {
  const [hasCopied, setHasCopied] = useState(false);
  if (!generatedKey) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey.key);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl m-4">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <KeyRound className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                API Key Generated
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Please copy this key and store it securely. You will not be able
                to see it again.
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 p-3 rounded-md bg-slate-100 border border-slate-200">
            <p className="font-mono text-sm text-slate-600 flex-1 truncate">
              {generatedKey.key}
            </p>
            <button
              onClick={copyToClipboard}
              className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800">
              {hasCopied ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </div>
        <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function APIKeysSettings() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);

  const activeKeys = [
    {
      id: 1,
      name: "Primary Server Key",
      prefix: "cat_live_...a4f2",
      lastUsed: "3 hours ago",
      createdBy: "Alex Rider",
      scopes: ["events:read", "events:write"],
    },
    {
      id: 2,
      name: "Read-only Analytics Key",
      prefix: "cat_live_...b8d1",
      lastUsed: "1 day ago",
      createdBy: "Alex Rider",
      scopes: ["events:read"],
    },
  ];

  return (
    <>
      <SettingsCard
        title="API Keys"
        description="Manage API keys for programmatic access to the Catalyst platform."
        headerAction={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            <Plus size={16} /> Create API Key
          </button>
        }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 bg-slate-50">
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Key Prefix</th>
                <th className="p-4 font-medium">Scopes</th>
                <th className="p-4 font-medium">Last Used</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activeKeys.map((key) => (
                <tr key={key.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{key.name}</p>
                    <p className="text-xs text-slate-500">
                      Created by {key.createdBy}
                    </p>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{key.prefix}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="px-2 py-0.5 text-xs font-mono rounded bg-slate-100 text-slate-600">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{key.lastUsed}</td>
                  <td className="p-4 text-right">
                    <Menu as="div" className="relative">
                      <Menu.Button className="p-2 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <MoreVertical size={16} />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <div className="py-1">
                            <Menu.Item>
                              <a
                                href="#"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                Edit Permissions
                              </a>
                            </Menu.Item>
                            <Menu.Item>
                              <button className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <Trash2 size={14} /> Revoke Key
                              </button>
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsCard>

      <CreateKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onKeyGenerated={setGeneratedKey}
      />
      <ShowKeyModal
        generatedKey={generatedKey}
        onClose={() => setGeneratedKey(null)}
      />
    </>
  );
}
