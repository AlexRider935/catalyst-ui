// src/app/(main)/integrations/new/components/PagerDutyConfig.jsx
"use client";
import { useState } from "react";
import { Info, PhoneForwarded } from "lucide-react";

export default function PagerDutyConfig({ onSave, isSaving }) {
  const [config, setConfig] = useState({ name: "", integrationKey: "" });
  const handleChange = (e) =>
    setConfig({ ...config, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ type: "pagerduty", ...config });
  };

  return (
    <form
      id="integration-form"
      onSubmit={handleSubmit}
      className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <PhoneForwarded size={32} className="text-slate-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Configure PagerDuty
          </h2>
          <p className="text-slate-500">
            Trigger and manage PagerDuty incidents from playbooks.
          </p>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50 border border-amber-200">
            <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Your PagerDuty Integration Key is a secret and will be encrypted
              at rest.
            </p>
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-slate-700 mb-1.5">
              Connection Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={config.name}
              onChange={handleChange}
              placeholder="e.g., Critical Security Alerts Service"
              className="block w-full rounded-lg border-slate-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="integrationKey"
              className="block text-sm font-semibold text-slate-700 mb-1.5">
              Integration Key
            </label>
            <input
              type="password"
              id="integrationKey"
              name="integrationKey"
              value={config.integrationKey}
              onChange={handleChange}
              placeholder="••••••••••••••••••••••••••••••••"
              className="block w-full rounded-lg border-slate-300 shadow-sm"
              required
            />
          </div>
          {/* Add Test Button Here */}
        </div>
      </div>
    </form>
  );
}
