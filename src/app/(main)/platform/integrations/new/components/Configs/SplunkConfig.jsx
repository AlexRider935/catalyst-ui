"use client";

import { useState } from "react";
import {
  Info,
  Database,
  RadioTower,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";

export default function SplunkConfig({ onSave, isSaving }) {
  const [config, setConfig] = useState({
    name: "",
    hecUrl: "",
    hecToken: "",
    defaultIndex: "main",
    defaultSourcetype: "catalyst:alert",
    defaultSource: "catalyst_platform",
  });
  const [testStatus, setTestStatus] = useState("idle"); // idle, testing, success, failed

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleTest = async () => {
    setTestStatus("testing");
    // Simulate API call to backend, which attempts to POST to the HEC endpoint
    await new Promise((res) => setTimeout(res, 1500));
    const success = Math.random() > 0.3;
    setTestStatus(success ? "success" : "failed");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ type: "splunk", ...config });
  };

  const examplePayload = JSON.stringify(
    {
      event: {
        alert_id: "alert-12345",
        rule_name: "Impossible Travel Detected",
        severity: "High",
        target_user: "john.doe",
      },
      sourcetype: config.defaultSourcetype || "catalyst:alert",
      source: config.defaultSource || "catalyst_platform",
      index: config.defaultIndex || "main",
    },
    null,
    2
  );

  return (
    <form
      id="integration-form"
      onSubmit={handleSubmit}
      className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Database size={32} className="text-slate-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Configure Splunk
          </h2>
          <p className="text-slate-500">
            Forward enriched alerts to a Splunk HTTP Event Collector (HEC).
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              1. Connection Details
            </h3>
            <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50 border border-amber-200">
              <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                The HEC Token is a secret. It will be encrypted at rest and
                never displayed again after saving.
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
                placeholder="e.g., Primary Splunk Instance"
                className="block w-full rounded-lg border-slate-300 shadow-sm"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="hecUrl"
                  className="block text-sm font-semibold text-slate-700">
                  HEC URL
                </label>
                <a
                  href="https://docs.splunk.com/Documentation/SplunkCloud/latest/Data/UsetheHTTPEventCollector"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                  How to set up HEC <ExternalLink size={12} />
                </a>
              </div>
              <input
                type="url"
                id="hecUrl"
                name="hecUrl"
                value={config.hecUrl}
                onChange={handleChange}
                placeholder="https://http-inputs.splunkcloud.com/services/collector"
                className="block w-full rounded-lg border-slate-300 shadow-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="hecToken"
                className="block text-sm font-semibold text-slate-700 mb-1.5">
                HEC Token
              </label>
              <input
                type="password"
                id="hecToken"
                name="hecToken"
                value={config.hecToken}
                onChange={handleChange}
                className="block w-full rounded-lg border-slate-300 shadow-sm font-mono"
                required
              />
            </div>
          </div>

          {/* ✅ CONFIGURABLE EVENT METADATA (INDEX, SOURCETYPE) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              2. Default Event Metadata
            </h3>
            <p className="text-sm text-slate-500 -mt-2">
              Configure how events from this platform will be identified in
              Splunk.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Default Index
                </label>
                <input
                  type="text"
                  name="defaultIndex"
                  value={config.defaultIndex}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-slate-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Default Source Type
                </label>
                <input
                  type="text"
                  name="defaultSourcetype"
                  value={config.defaultSourcetype}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-slate-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Default Source
                </label>
                <input
                  type="text"
                  name="defaultSource"
                  value={config.defaultSource}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-slate-300 shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* --- STEP 3: VERIFICATION --- */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              3. Verification & Payload
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">
                  Example HEC Payload
                </h4>
                <p className="text-sm text-slate-500 mb-2">
                  This is the JSON structure that will be sent to your HEC
                  endpoint.
                </p>
                <pre className="text-xs p-4 rounded-lg bg-slate-800 text-slate-200 whitespace-pre-wrap">
                  {examplePayload}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">
                  Connection Test
                </h4>
                <p className="text-sm text-slate-500 mb-2">
                  Send a sample event to your HEC endpoint to verify
                  connectivity and configuration.
                </p>
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={
                    !config.hecUrl ||
                    !config.hecToken ||
                    testStatus === "testing"
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
                  {testStatus === "testing" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RadioTower size={16} />
                  )}
                  Send Test Event
                </button>
                {testStatus !== "idle" && (
                  <div
                    className={clsx(
                      "mt-4 flex items-center gap-2 text-sm font-medium",
                      testStatus === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    )}>
                    {testStatus === "success" ? (
                      <CheckCircle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    {testStatus === "success"
                      ? "Test event sent successfully!"
                      : "Test failed. Check URL, Token, and Index permissions."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
