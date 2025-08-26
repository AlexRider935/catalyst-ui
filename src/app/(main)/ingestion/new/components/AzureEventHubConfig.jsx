"use client";

export default function AzureEventHubConfig({ config, onConfigChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 mb-1">
          Source Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={config.name || ""}
          onChange={(e) => onConfigChange({ ...config, name: e.target.value })}
          placeholder="e.g., Azure Production Event Hub"
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label
          htmlFor="connection_string"
          className="block text-sm font-medium text-slate-700 mb-1">
          Connection String
        </label>
        <input
          type="password"
          id="connection_string"
          name="connection_string"
          value={config.connection_string || ""}
          onChange={(e) =>
            onConfigChange({ ...config, connection_string: e.target.value })
          }
          placeholder="Value is encrypted and write-only"
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          Find this in your Event Hubs Namespace under "Shared access policies".
        </p>
      </div>
      <div>
        <label
          htmlFor="consumer_group"
          className="block text-sm font-medium text-slate-700 mb-1">
          Consumer Group
        </label>
        <input
          type="text"
          id="consumer_group"
          name="consumer_group"
          value={config.consumer_group || "$Default"}
          onChange={(e) =>
            onConfigChange({ ...config, consumer_group: e.target.value })
          }
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          The consumer group to read events from. Defaults to `$Default`.
        </p>
      </div>
    </div>
  );
}
