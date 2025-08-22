"use client";

import { useState, useEffect } from "react";
import {
  Info,
  Mail,
  RadioTower,
  CheckCircle,
  XCircle,
  Loader2,
  KeyRound,
  TestTube2,
} from "lucide-react";
import clsx from "clsx";

import ApiKeyConfig from "./email/ApiKeyConfig";
import SmtpConfig from "./email/SmtpConfig";

export default function EmailConfig({ onSave, isSaving }) {
  const [authMethod, setAuthMethod] = useState("api");
  const [config, setConfig] = useState({
    name: "",
    apiKey: "",
    apiService: "sendgrid",
    smtpServer: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    senderName: "The Catalyst",
    senderEmail: "alerts@thecatalyst.io",
  });

  const [presets, setPresets] = useState([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [connectionStatus, setConnectionStatus] = useState({
    state: "idle",
    message: "",
  });
  const [sendTestStatus, setSendTestStatus] = useState({
    state: "idle",
    message: "",
  });

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

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handlePresetClick = (preset) => {
    setConfig({
      ...config,
      smtpServer: preset.server,
      smtpPort: preset.port,
    });
  };

  const handleTestConnection = async () => {
    setConnectionStatus({
      state: "testing",
      message: "Verifying credentials...",
    });
    try {
      const payload = { config: { authMethod, ...config } };
      const response = await fetch("/api/integrations/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.details || "Connection failed");
      setConnectionStatus({ state: "success", message: result.message });
    } catch (error) {
      setConnectionStatus({ state: "failed", message: error.message });
    }
  };

  const handleSendTestEmail = async () => {
    setSendTestStatus({
      state: "testing",
      message: "Dispatching test email...",
    });
    try {
      const payload = { testEmail, config: { authMethod, ...config } };
      const response = await fetch("/api/integrations/test-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.details || "Dispatch failed");
      setSendTestStatus({ state: "success", message: result.message });
    } catch (error) {
      setSendTestStatus({ state: "failed", message: error.message });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { type: "email", ...config, authMethod };
    if (authMethod === "api") {
      delete payload.smtpServer;
      delete payload.smtpPort;
      delete payload.smtpUser;
      delete payload.smtpPass;
    } else {
      delete payload.apiKey;
      delete payload.apiService;
    }
    onSave(payload);
  };

  return (
    <form
      id="integration-form"
      onSubmit={handleSubmit}
      className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Mail size={32} className="text-slate-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Configure Email Notification Channel
          </h2>
          <p className="text-slate-500">
            Set up an SMTP server or email API for playbook notifications.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              1. Connection Details
            </h3>
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
                placeholder="e.g., Primary SOC Alerts (SendGrid)"
                className="block w-full rounded-lg border-slate-300 shadow-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              2. Authentication
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
                onClick={() => setAuthMethod("api")}
                className={clsx(
                  "flex-1 text-center flex items-center justify-center gap-2 px-3 py-1 rounded-md text-sm font-semibold transition-colors",
                  authMethod === "api"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}>
                <KeyRound size={16} /> API Key (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("smtp")}
                className={clsx(
                  "flex-1 text-center px-3 py-1 rounded-md text-sm font-semibold transition-colors",
                  authMethod === "smtp"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}>
                SMTP
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
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              3. Sender Identity
            </h3>
            <p className="text-sm text-slate-500 -mt-2">
              The "From" name and address that will appear on all emails.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Sender Name
                </label>
                <input
                  type="text"
                  name="senderName"
                  value={config.senderName}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-slate-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Sender Email
                </label>
                <input
                  type="email"
                  name="senderEmail"
                  value={config.senderEmail}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-slate-300 shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              4. Verification
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={connectionStatus.state === "testing"}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 h-10">
                {connectionStatus.state === "testing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube2 size={16} />
                )}
                <span>Test Connection</span>
              </button>
              {connectionStatus.state !== "idle" && (
                <div
                  className={clsx(
                    "flex items-center gap-2 text-sm font-medium",
                    connectionStatus.state === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  )}>
                  {" "}
                  {connectionStatus.state === "success" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}{" "}
                  {connectionStatus.message}{" "}
                </div>
              )}
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-grow">
                <label
                  htmlFor="testEmail"
                  className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Recipient for Test Email
                </label>
                <input
                  type="email"
                  id="testEmail"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="block w-full rounded-lg border-slate-300 shadow-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={
                  !testEmail ||
                  connectionStatus.state !== "success" ||
                  sendTestStatus.state === "testing"
                }
                className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-300 h-10">
                {sendTestStatus.state === "testing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RadioTower size={16} />
                )}
                <span>Send Test</span>
              </button>
            </div>
            {sendTestStatus.state !== "idle" && (
              <div
                className={clsx(
                  "mt-2 flex items-center gap-2 text-sm font-medium",
                  sendTestStatus.state === "success"
                    ? "text-green-600"
                    : "text-red-600"
                )}>
                {" "}
                {sendTestStatus.state === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <XCircle size={16} />
                )}{" "}
                {sendTestStatus.message}{" "}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
