"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Toggle = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-200 last:border-b-0">
    <div>
      <p className="font-medium text-slate-800">{label}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
    <button
      type="button"
      className={`${
        enabled ? "bg-blue-600" : "bg-slate-200"
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      onClick={onChange}>
      <span
        className={`${
          enabled ? "translate-x-5" : "translate-x-0"
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
);

export default function ConfigurationForm({ agentId, initialConfig }) {
  const [config, setConfig] = useState(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter(); // To refresh the page data

  const handleSave = async () => {
    setIsSaving(true);
    const savePromise = fetch(`/api/agents/${agentId}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    toast.promise(savePromise, {
      loading: "Saving configuration...",
      success: "Configuration saved successfully!",
      error: "Failed to save configuration.",
    });

    try {
      const response = await savePromise;
      if (response.ok) {
        // Refresh the server component to show the new raw JSON
        router.refresh();
      }
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800">
        Module Controls
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Enable or disable agent modules remotely. Changes will apply on the
        agent's next check-in.
      </p>
      <Toggle
        label="File Integrity Monitoring (FIM)"
        description="Monitor critical files for changes."
        enabled={config.fim_enabled}
        onChange={() =>
          setConfig((c) => ({ ...c, fim_enabled: !c.fim_enabled }))
        }
      />
      <Toggle
        label="Log Collector"
        description="Tail a log file and stream its contents."
        enabled={config.log_collector_enabled}
        onChange={() =>
          setConfig((c) => ({
            ...c,
            log_collector_enabled: !c.log_collector_enabled,
          }))
        }
      />
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50">
          <Save size={16} />
          {isSaving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
