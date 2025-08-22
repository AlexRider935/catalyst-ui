"use client";

import { useState, useEffect, useRef } from "react";
import {
  Info,
  Bot,
  RadioTower,
  CheckCircle,
  XCircle,
  Loader2,
  KeyRound,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import clsx from "clsx";
import * as AdaptiveCards from "adaptivecards";
import * as ACData from "adaptivecards-templating";

// This would be fetched from the playbook engine context
const TEMPLATE_VARIABLES = [
  {
    variable: "${alert_name}",
    description: "The name of the triggering alert.",
  },
  { variable: "${alert_severity}", description: "The severity of the alert." },
  { variable: "${endpoint_hostname}", description: "The affected endpoint." },
];

const initialAdaptiveCardTemplate = JSON.stringify(
  {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        text: "🚨 Security Alert: ${alert_name}",
        weight: "Bolder",
        size: "Medium",
      },
      {
        type: "FactSet",
        facts: [
          { title: "Severity:", value: "${alert_severity}" },
          { title: "Endpoint:", value: "${endpoint_hostname}" },
        ],
      },
    ],
  },
  null,
  2
);

export default function MSTeamsConfig({ onSave, isSaving }) {
  const [authMethod, setAuthMethod] = useState("oauth"); // 'oauth' or 'webhook'
  const [config, setConfig] = useState({
    name: "",
    webhookUrl: "",
    oauthToken: null,
    workspaceName: null,
    defaultChannel: "",
    messageTemplate: initialAdaptiveCardTemplate,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [testStatus, setTestStatus] = useState("idle");
  const [keyValid, setKeyValid] = useState(null);
  const cardPreviewRef = useRef(null);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (authMethod === "webhook" && config.webhookUrl) {
      const isValid = /^https:\/\/outlook\.office\.com\/webhook\/.*$/.test(
        config.webhookUrl
      );
      setKeyValid(isValid);
    } else {
      setKeyValid(null);
    }
  }, [config.webhookUrl, authMethod]);

  const handleTestConnection = async () => {
    setConnectionStatus("testing");
    await new Promise((res) => setTimeout(res, 1500));
    const success = Math.random() > 0.3;
    setConnectionStatus(success ? "success" : "failed");
    if (success) setIsConnected(true);
  };

  // ✅ FUNCTION DEFINITION ADDED
  const handleTest = async () => {
    setTestStatus("testing");
    // Simulate API call to the backend test endpoint
    await new Promise((res) => setTimeout(res, 1500));
    setTestStatus(Math.random() > 0.3 ? "success" : "failed");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ type: "msteams", ...config, authMethod });
  };

  const handleConnectSlack = async () => {
    /* Simulating for MS Teams */
  };

  useEffect(() => {
    if (cardPreviewRef.current) {
      try {
        const template = new ACData.Template(
          JSON.parse(config.messageTemplate)
        );
        const cardPayload = template.expand({
          $root: {
            alert_name: "Anomalous Process Execution",
            alert_severity: "High",
            endpoint_hostname: "prod-db-01.corp.local",
          },
        });
        const adaptiveCard = new AdaptiveCards.AdaptiveCard();
        adaptiveCard.parse(cardPayload);
        const renderedCard = adaptiveCard.render();
        cardPreviewRef.current.innerHTML = "";
        cardPreviewRef.current.appendChild(renderedCard);
      } catch (error) {
        cardPreviewRef.current.innerHTML = `<div class="text-red-500 text-xs">Invalid JSON or template format.</div>`;
      }
    }
  }, [config.messageTemplate]);

  return (
    <form
      id="integration-form"
      onSubmit={handleSubmit}
      className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bot size={32} className="text-slate-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Configure Microsoft Teams
          </h2>
          <p className="text-slate-500">
            Send rich notifications to Teams channels via an Azure AD App or
            Webhook.
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
                placeholder="e.g., Corp Security Alerts"
                className="block w-full rounded-lg border-slate-300 shadow-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              2. Authentication
            </h3>
            <div className="flex items-center p-1 bg-slate-100 rounded-lg w-full">
              <button
                type="button"
                onClick={() => setAuthMethod("oauth")}
                className={clsx(
                  "flex-1 text-center flex items-center justify-center gap-2 px-3 py-1 rounded-md text-sm font-semibold transition-colors",
                  authMethod === "oauth"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}>
                <KeyRound size={16} /> Azure AD App (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("webhook")}
                className={clsx(
                  "flex-1 text-center px-3 py-1 rounded-md text-sm font-semibold transition-colors",
                  authMethod === "webhook"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}>
                Incoming Webhook
              </button>
            </div>

            {authMethod === "oauth" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="tenantId"
                      className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Tenant ID
                    </label>
                    <input
                      type="text"
                      id="tenantId"
                      name="tenantId"
                      value={config.tenantId}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-slate-300 shadow-sm"
                      required
                    />
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
                    className="block w-full rounded-lg border-slate-300 shadow-sm"
                    required
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={
                      connectionStatus === "testing" ||
                      !config.tenantId ||
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
                        ? "Connection successful!"
                        : "Connection failed."}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="webhookUrl"
                    className="block text-sm font-semibold text-slate-700">
                    Incoming Webhook URL
                  </label>
                  <a
                    href="https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                    How to create a webhook <ExternalLink size={12} />
                  </a>
                </div>
                <input
                  type="password"
                  id="webhookUrl"
                  name="webhookUrl"
                  value={config.webhookUrl}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-slate-300 shadow-sm font-mono"
                  required
                />
              </div>
            )}
          </div>

          <div
            className={clsx(
              "space-y-4 transition-opacity duration-500",
              !isConnected &&
                authMethod === "oauth" &&
                "opacity-40 pointer-events-none"
            )}>
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              3. Default Configuration
            </h3>
            {authMethod === "oauth" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="defaultTeam"
                    className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Default Team
                  </label>
                  <select
                    id="defaultTeam"
                    name="defaultTeam"
                    value={config.defaultTeam}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-slate-300 shadow-sm">
                    <option>SOC Team</option>
                    <option>IT Alerts</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="defaultChannel"
                    className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Default Channel
                  </label>
                  <select
                    id="defaultChannel"
                    name="defaultChannel"
                    value={config.defaultChannel}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-slate-300 shadow-sm">
                    <option># general</option>
                    <option># critical-alerts</option>
                  </select>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="messageTemplate"
                  className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Adaptive Card Template (JSON)
                </label>
                <textarea
                  name="messageTemplate"
                  value={config.messageTemplate}
                  onChange={handleChange}
                  rows={12}
                  className="block w-full rounded-lg border-slate-300 shadow-sm font-mono text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Live Preview
                </label>
                <div
                  ref={cardPreviewRef}
                  className="p-4 border border-slate-200 rounded-lg bg-slate-50 min-h-[200px]"></div>
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={handleTest}
                disabled={testStatus === "testing"}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
                {testStatus === "testing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RadioTower size={16} />
                )}{" "}
                Send Test Notification
              </button>
              {testStatus !== "idle" && (
                <div
                  className={clsx(
                    "mt-4 flex items-center gap-2 text-sm font-medium",
                    testStatus === "success" ? "text-green-600" : "text-red-600"
                  )}>
                  {testStatus === "success" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  {testStatus === "success"
                    ? "Test sent successfully!"
                    : "Test failed."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
