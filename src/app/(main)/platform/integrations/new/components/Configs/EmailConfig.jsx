"use client";

import { useState, useEffect } from "react";
import { Info, KeyRound } from "lucide-react";
import clsx from "clsx";

// --- Sub-components for clarity ---

const ApiKeyConfig = ({ config, handleChange }) => (
  <div>
    <label
      htmlFor="apiKey"
      className="block text-sm font-medium text-slate-700 mb-1">
      SendGrid API Key
    </label>
    <input
      type="password"
      id="apiKey"
      name="apiKey"
      value={config.apiKey || ""}
      onChange={handleChange}
      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      placeholder="Value is encrypted and write-only"
    />
  </div>
);

const SmtpConfig = ({
  config,
  handleChange,
  presets,
  isLoadingPresets,
  handlePresetClick,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="smtpServer"
          className="block text-sm font-medium text-slate-700 mb-1">
          SMTP Server
        </label>
        <input
          type="text"
          id="smtpServer"
          name="smtpServer"
          value={config.smtpServer || ""}
          onChange={handleChange}
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="smtp.example.com"
        />
      </div>
      <div>
        <label
          htmlFor="smtpPort"
          className="block text-sm font-medium text-slate-700 mb-1">
          SMTP Port
        </label>
        <input
          type="text"
          id="smtpPort"
          name="smtpPort"
          value={config.smtpPort || ""}
          onChange={handleChange}
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="587"
        />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="smtpUser"
          className="block text-sm font-medium text-slate-700 mb-1">
          SMTP Username
        </label>
        <input
          type="text"
          id="smtpUser"
          name="smtpUser"
          value={config.smtpUser || ""}
          onChange={handleChange}
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="smtpPass"
          className="block text-sm font-medium text-slate-700 mb-1">
          SMTP Password
        </label>
        <input
          type="password"
          id="smtpPass"
          name="smtpPass"
          value={config.smtpPass || ""}
          onChange={handleChange}
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Value is encrypted and write-only"
        />
      </div>
    </div>
    {!isLoadingPresets && presets.length > 0 && (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Common Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {/* ✅ FIX: Added the unique key prop to the button element being mapped. */}
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetClick(p)}
              className="text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1 rounded-full">
              {p.name}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

// --- Main EmailConfig Component ---
// ARCHITECT'S NOTE: This component is now a "controlled component".
// It receives 'config' and 'onConfigChange' as props from its parent.
// It has no internal state for form data and no logic for testing or saving.
// Its only job is to render the form and report changes back to the parent.
export default function EmailConfig({ config, onConfigChange }) {
  const [authMethod, setAuthMethod] = useState("api");
  const [presets, setPresets] = useState([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(true);

  // Fetch presets for SMTP providers
  useEffect(() => {
    const fetchPresets = async () => {
      setIsLoadingPresets(true);
      try {
        const response = await fetch("/api/email-presets");
        if (!response.ok) throw new Error("Failed to fetch presets");
        const data = await response.json();
        setPresets(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingPresets(false);
      }
    };
    fetchPresets();
  }, []);

  // This function now calls the onConfigChange prop passed down from the parent.
  const handleChange = (e) => {
    onConfigChange({ ...config, [e.target.name]: e.target.value });
  };

  // This function also calls the onConfigChange prop.
  const handlePresetClick = (preset) => {
    onConfigChange({
      ...config,
      smtpServer: preset.server,
      smtpPort: preset.port,
    });
  };

  // When switching auth methods, we also need to inform the parent.
  const handleAuthChange = (method) => {
    setAuthMethod(method);
    onConfigChange({ ...config, authMethod: method });
  };

  // Set initial auth method on mount
  useEffect(() => {
    onConfigChange({ ...config, authMethod: "api" });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 mb-1">
          Integration Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={config.name || ""}
          onChange={handleChange}
          placeholder="e.g., Primary SOC Alerts (SendGrid)"
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-800">
          Authentication
        </h3>
        <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50 border border-amber-200">
          <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Credentials are write-only. They are encrypted at rest and will
            never be displayed again after saving.
          </p>
        </div>
        <div className="flex items-center p-1 bg-slate-100 rounded-lg w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleAuthChange("api")}
            className={clsx(
              "flex-1 text-center flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors",
              authMethod === "api"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}>
            <KeyRound size={16} /> API Key (Recommended)
          </button>
          <button
            type="button"
            onClick={() => handleAuthChange("smtp")}
            className={clsx(
              "flex-1 text-center px-3 py-1.5 rounded-md text-sm font-semibold transition-colors",
              authMethod === "smtp"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}>
            SMTP Credentials
          </button>
        </div>

        {authMethod === "api" ? (
          <ApiKeyConfig config={config} handleChange={handleChange} />
        ) : (
          <SmtpConfig
            config={config}
            handleChange={handleChange}
            presets={presets}
            isLoadingPresets={isLoadingPresets}
            handlePresetClick={handlePresetClick}
          />
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-800">
          Sender Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sender Name
            </label>
            <input
              type="text"
              name="senderName"
              value={config.senderName || "Catalyst Alerts"}
              onChange={handleChange}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sender Email
            </label>
            <input
              type="email"
              name="senderEmail"
              value={config.senderEmail || ""}
              onChange={handleChange}
              placeholder="alerts@your-domain.com"
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}
