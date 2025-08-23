"use client";

import { useState } from "react";
import {
  Info,
  Shield,
  RadioTower,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Copy,
} from "lucide-react";
import clsx from "clsx";

// ✅ Pre-populated Base URLs to reduce user error
const CROWDSTRIKE_API_URLS = [
  { id: "us-1", name: "US-1", url: "https://api.crowdstrike.com" },
  { id: "us-2", name: "US-2", url: "https://api.us-2.crowdstrike.com" },
  { id: "eu-1", name: "EU-1", url: "https://api.eu-1.crowdstrike.com" },
  {
    id: "us-gov-1",
    name: "US GOV-1 (FedRAMP)",
    url: "https://api.laggar.gcw.crowdstrike.com",
  },
];

const REQUIRED_SCOPES = ["hosts:read", "hosts:write"];

export default function CrowdStrikeConfig({ onSave, isSaving }) {
  const [config, setConfig] = useState({
    name: "",
    baseUrl: CROWDSTRIKE_API_URLS[0].url,
    clientId: "",
    clientSecret: "",
  });
  const [connectionStatus, setConnectionStatus] = useState("idle"); // idle, testing, success, failed

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const copyScopes = () => {
    navigator.clipboard.writeText(REQUIRED_SCOPES.join(", "));
    alert("Required scopes copied to clipboard."); // Replace with toast in production
  };

  const handleTestConnection = async () => {
    setConnectionStatus("testing");
    // Simulate API call to backend, which attempts an OAuth2 token grant with CrowdStrike
    await new Promise((res) => setTimeout(res, 1500));
    const success = Math.random() > 0.3; // Simulate success/failure
    setConnectionStatus(success ? "success" : "failed");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ type: "crowdstrike", ...config });
  };

  return (
    <form
      id="integration-form"
      onSubmit={handleSubmit}
      className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={32} className="text-slate-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Configure CrowdStrike Falcon
          </h2>
          <p className="text-slate-500">
            Enable active response capabilities like host isolation.
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
                placeholder="e.g., Corporate EDR"
                className="block w-full rounded-lg border-slate-300 shadow-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              2. API Credentials
            </h3>

            {/* ✅ GUIDANCE ON REQUIRED API SCOPES */}
            <div className="flex items-start gap-3 p-3 rounded-md bg-blue-50 border border-blue-200">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  In the CrowdStrike Falcon console, create an API Client with
                  the following **exact** scopes:
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-xs font-semibold bg-blue-100 text-blue-900 px-2 py-1 rounded">
                    hosts:read
                  </code>
                  <code className="text-xs font-semibold bg-blue-100 text-blue-900 px-2 py-1 rounded">
                    hosts:write
                  </code>
                  <button
                    type="button"
                    onClick={copyScopes}
                    className="p-1 text-blue-600 hover:text-blue-800">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="baseUrl"
                  className="block text-sm font-semibold text-slate-700 mb-1.5">
                  API Base URL
                </label>
                <select
                  id="baseUrl"
                  name="baseUrl"
                  value={config.baseUrl}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-slate-300 shadow-sm">
                  {CROWDSTRIKE_API_URLS.map((api) => (
                    <option key={api.id} value={api.url}>
                      {api.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="clientId"
                  className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Client ID
                </label>
                <input
                  type="text"
                  id="clientId"
                  name="clientId"
                  value={config.clientId}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-slate-300 shadow-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="clientSecret"
                className="block text-sm font-semibold text-slate-700 mb-1.5">
                Client Secret
              </label>
              <input
                type="password"
                id="clientSecret"
                name="clientSecret"
                value={config.clientSecret}
                onChange={handleChange}
                className="block w-full rounded-lg border-slate-300 shadow-sm font-mono"
                required
              />
            </div>
          </div>

          {/* --- STEP 3: VERIFICATION --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              3. Verification
            </h3>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={
                  connectionStatus === "testing" ||
                  !config.clientId ||
                  !config.clientSecret
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
                {connectionStatus === "testing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RadioTower size={16} />
                )}
                Test Connection
              </button>
              {connectionStatus !== "idle" && (
                <div
                  className={clsx(
                    "flex items-center gap-2 text-sm font-medium",
                    connectionStatus === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  )}>
                  {connectionStatus === "success" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  {connectionStatus === "success"
                    ? "Connection successful! API credentials are valid."
                    : "Connection failed. Check credentials and API scopes."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
