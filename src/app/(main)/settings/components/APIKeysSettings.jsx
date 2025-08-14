"use client";

import { useState } from "react";
import { Plus, Copy, Check, Trash2 } from "lucide-react";

const SettingsCard = ({ title, subtitle, children, footer }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="p-6 border-b border-slate-200">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    <div className="space-y-6">{children}</div>
    {footer && (
      <div className="bg-slate-50/80 px-6 py-4 text-right rounded-b-xl border-t border-slate-200">
        {footer}
      </div>
    )}
  </div>
);

export default function APIKeysSettings() {
  const [apiKey, setApiKey] = useState(null);
  const [hasCopied, setHasCopied] = useState(false);

  const generateKey = () => {
    const newKey = `cat_live_${[...Array(32)]
      .map(() => Math.random().toString(36)[2])
      .join("")}`;
    setApiKey(newKey);
    setHasCopied(false);
  };

  const copyToClipboard = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <SettingsCard
      title="API Keys"
      subtitle="Manage API keys for programmatic access.">
      <div className="p-6 flex justify-end">
        <button
          onClick={generateKey}
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
          <Plus size={16} /> Generate Key
        </button>
      </div>

      {apiKey && (
        <div className="px-6 pb-6 -mt-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-slate-800">
              New API Key Generated
            </p>
            <p className="text-xs text-slate-500 mt-1">
              This is the only time your secret key will be displayed. Please
              copy and store it securely.
            </p>
            <div className="mt-4 flex items-center gap-2 p-3 rounded-md bg-white border border-slate-300">
              <p className="font-mono text-sm text-slate-600 flex-1 truncate">
                {apiKey}
              </p>
              <button
                onClick={copyToClipboard}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800">
                {hasCopied ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 pb-6">
        <h3 className="font-semibold text-slate-800">Active Keys</h3>
        <ul className="mt-2 divide-y divide-slate-200 border rounded-lg">
          <li className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-slate-800">Primary Server Key</p>
              <p className="font-mono text-sm text-slate-500">
                cat_live_...a4f2
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-slate-500 hidden sm:block">
                Last used: 3 hours ago
              </p>
              <button className="p-2 text-slate-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </SettingsCard>
  );
}
