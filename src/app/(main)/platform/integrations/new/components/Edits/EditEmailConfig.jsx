"use client";
import { Lock } from "lucide-react";

export default function EditEmailConfig({ config, onConfigChange }) {
  // Note: This form is for updating an existing email integration.
  // The auth method cannot be changed after creation.
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label
          htmlFor="smtp-host"
          className="block text-sm font-medium text-slate-700">
          SMTP Host
        </label>
        <input
          type="text"
          id="smtp-host"
          onChange={(e) => onConfigChange({ ...config, host: e.target.value })}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="smtp.example.com"
        />
      </div>
      <div>
        <label
          htmlFor="smtp-port"
          className="block text-sm font-medium text-slate-700">
          SMTP Port
        </label>
        <input
          type="number"
          id="smtp-port"
          onChange={(e) => onConfigChange({ ...config, port: e.target.value })}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="587"
        />
      </div>
      <div>
        <label
          htmlFor="smtp-user"
          className="block text-sm font-medium text-slate-700">
          SMTP Username
        </label>
        <input
          type="text"
          id="smtp-user"
          onChange={(e) => onConfigChange({ ...config, user: e.target.value })}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="user@example.com"
        />
      </div>
      <div className="sm:col-span-2">
        <label
          htmlFor="smtp-pass"
          className="block text-sm font-medium text-slate-700">
          SMTP Password / API Key
        </label>
        <div className="relative mt-1">
          <Lock
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="password"
            id="smtp-pass"
            autoComplete="new-password"
            onChange={(e) =>
              onConfigChange({ ...config, pass: e.target.value })
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
}
