"use client";

import { useState } from "react";
import {
  Info,
  Users,
  RadioTower,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Copy,
} from "lucide-react";
import clsx from "clsx";

// ✅ Guidance on required Okta permissions.
const REQUIRED_PERMISSIONS = ["okta.users.manage", "okta.groups.read"];

export default function OktaConfig({ onSave, isSaving }) {
  const [config, setConfig] = useState({
    name: "",
    domainUrl: "",
    apiToken: "",
  });
  const [connectionStatus, setConnectionStatus] = useState("idle"); // idle, testing, success, failed

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const copyPermissions = () => {
    navigator.clipboard.writeText(REQUIRED_PERMISSIONS.join(", "));
    alert("Required permissions copied to clipboard."); // Replace with toast in production
  };

  const handleTestConnection = async () => {
    setConnectionStatus("testing");
    // Simulate API call to backend, which attempts to call Okta's /api/v1/users/me endpoint
    await new Promise((res) => setTimeout(res, 1500));
    const success = Math.random() > 0.2; // Simulate a higher success rate for demos
    setConnectionStatus(success ? "success" : "failed");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ type: "okta", ...config });
  };

  return (
    <form
      id="integration-form"
      onSubmit={handleSubmit}
      className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Users size={32} className="text-slate-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configure Okta</h2>
          <p className="text-slate-500">
            Enable identity response actions like suspending users and forcing
            MFA.
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
                placeholder="e.g., Production Okta Tenant"
                className="block w-full rounded-lg border-slate-300 shadow-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              2. API Credentials
            </h3>

            {/* ✅ SECURITY BEST PRACTICE NOTICES */}
            <div className="flex items-start gap-3 p-3 rounded-md bg-blue-50 border border-blue-200">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  Create an API token from a dedicated service account in Okta.
                  Grant it the following permissions:
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {REQUIRED_PERMISSIONS.map((scope) => (
                    <code
                      key={scope}
                      className="text-xs font-semibold bg-blue-100 text-blue-900 px-2 py-1 rounded">
                      {scope}
                    </code>
                  ))}
                  <button
                    type="button"
                    onClick={copyPermissions}
                    className="p-1 text-blue-600 hover:text-blue-800">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="domainUrl"
                className="block text-sm font-semibold text-slate-700 mb-1.5">
                Okta Domain URL
              </label>
              <input
                type="url"
                id="domainUrl"
                name="domainUrl"
                value={config.domainUrl}
                onChange={handleChange}
                placeholder="https://your-company.okta.com"
                className="block w-full rounded-lg border-slate-300 shadow-sm"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="apiToken"
                  className="block text-sm font-semibold text-slate-700">
                  API Token
                </label>
                <a
                  href="https://developer.okta.com/docs/guides/create-an-api-token/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                  How to create an API token <ExternalLink size={12} />
                </a>
              </div>
              <input
                type="password"
                id="apiToken"
                name="apiToken"
                value={config.apiToken}
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
                  !config.domainUrl ||
                  !config.apiToken
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
                    : "Connection failed. Check Domain, Token, and API permissions."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
