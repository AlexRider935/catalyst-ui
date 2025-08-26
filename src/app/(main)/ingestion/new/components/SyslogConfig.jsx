"use client";

export default function SyslogConfig({ config, onConfigChange }) {
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
          placeholder="e.g., Palo Alto Firewall Syslog"
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label
          htmlFor="port"
          className="block text-sm font-medium text-slate-700 mb-1">
          Listening Port
        </label>
        <input
          type="number"
          id="port"
          name="port"
          value={config.port || "514"}
          onChange={(e) => onConfigChange({ ...config, port: e.target.value })}
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          The UDP/TCP port on which Catalyst will listen for Syslog messages.
        </p>
      </div>
    </div>
  );
}
