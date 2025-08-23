"use client";
import { Lock } from "lucide-react";

export default function EditWebhookConfig({ config, onConfigChange }) {
  return (
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
          Shared Secret (Optional)
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
}
