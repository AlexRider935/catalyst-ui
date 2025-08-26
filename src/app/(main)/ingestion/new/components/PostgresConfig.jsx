"use client";

export default function PostgresConfig({ config, onConfigChange }) {
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
          placeholder="e.g., Production Application DB"
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
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          Example:{" "}
          <code className="text-xs">
            postgresql://user:password@host:port/dbname
          </code>
        </p>
      </div>
      <div>
        <label
          htmlFor="query"
          className="block text-sm font-medium text-slate-700 mb-1">
          Ingestion Query
        </label>
        <textarea
          id="query"
          name="query"
          rows={4}
          value={config.query || ""}
          onChange={(e) => onConfigChange({ ...config, query: e.target.value })}
          placeholder="SELECT * FROM audit_logs WHERE event_timestamp > $1 ORDER BY event_timestamp ASC"
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          The SQL query to run for ingesting data. Use{" "}
          <code className="text-xs">$1</code> as a placeholder for the last seen
          timestamp.
        </p>
      </div>
    </div>
  );
}
