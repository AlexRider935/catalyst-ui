"use client";

// This component is now a simple "dumb" component. Its only job is to
// capture the agent's name and pass it up to the parent page.
// All API calls and token handling have been removed.

export default function CatalystAgentConfig({ config, onConfigChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-900 mb-1">
          Agent Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={config.name || ""}
          onChange={(e) => onConfigChange({ ...config, name: e.target.value })}
          placeholder="e.g., prod-database-server-01"
          className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          required
        />
        <p className="mt-2 text-sm text-slate-500">
          A unique, friendly name for this agent. This will be its primary
          identifier.
        </p>
      </div>
      <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
        <p className="text-sm">
          After entering a name, use the main **"Save & Activate"** button at
          the top-right of the page to pre-register this agent and get its
          deployment token.
        </p>
      </div>
    </div>
  );
}
