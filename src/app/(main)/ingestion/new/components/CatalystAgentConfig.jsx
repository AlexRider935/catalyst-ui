"use client";

export default function CatalystAgentConfig({ config, onConfigChange }) {
  return (
    <div className="space-y-6">
      {/* Agent Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-900 mb-2">
          Agent Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={config.name || ""}
          onChange={(e) => onConfigChange({ ...config, name: e.target.value })}
          placeholder="e.g., prod-database-server-01"
          className="block w-full rounded-md border border-slate-300 py-2 px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:text-sm"
          required
        />
        <p className="mt-2 text-sm text-slate-500">
          A unique, friendly name for this agent. This will be its primary
          identifier.
        </p>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">
          After entering a name, use the main{" "}
          <span className="font-medium">Save &amp; Activate</span> button at the
          top-right of the page to pre-register this agent and get its
          deployment token.
        </p>
      </div>
    </div>
  );
}
