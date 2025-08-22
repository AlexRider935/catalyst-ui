// src/app/(main)/platform/integrations/new/page.jsx

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Mail,
  MessageSquare,
  Puzzle,
  Ticket,
  PhoneForwarded,
  Cloud,
  Shield,
  Users,
  Bot,
  Database,
  Search,
  CheckCircle2,
  XCircle,
  Lock,
  FileText,
} from "lucide-react";
import clsx from "clsx";

// Import your configuration components
import SlackConfig from "./components/SlackConfig";
import WebhookConfig from "./components/WebhookConfig";
import EmailConfig from "./components/EmailConfig";
import JiraConfig from "./components/JiraConfig";
import PagerDutyConfig from "./components/PagerDutyConfig";
import S3BucketConfig from "./components/S3BucketConfig";
import CrowdStrikeConfig from "./components/CrowdStrikeConfig";
import OktaConfig from "./components/OktaConfig";
import MSTeamsConfig from "./components/MSTeamsConfig";

const INTEGRATION_CATALOG = {
  "Collaboration & Notifications": [
    {
      id: "slack",
      name: "Slack",
      icon: MessageSquare,
      description: "Send real-time alerts and notifications to Slack channels.",
      tags: ["Alerting", "ChatOps"],
      status: "Official",
      scopes: [
        "chat:write - To post messages to channels.",
        "users:read - To map user identities for mentions.",
        "channels:read - To list available channels for configuration.",
      ],
    },
    {
      id: "msteams",
      name: "Microsoft Teams",
      icon: Bot,
      description:
        "Deliver notifications directly to your Microsoft Teams channels.",
      tags: ["Alerting", "Microsoft Ecosystem"],
      status: "Official",
      scopes: [
        "ChannelMessage.Send - To send messages to channels.",
        "Team.ReadBasic.All - To list available teams and channels.",
      ],
    },
  ],
  "Ticketing & Case Management": [
    {
      id: "jira",
      name: "Jira",
      icon: Ticket,
      description: "Create, update, and transition Jira issues automatically.",
      tags: ["Case Management", "SOX"],
      status: "Official",
      scopes: [
        "write:jira-work - To create and edit issues.",
        "read:jira-work - To read project and issue type metadata.",
      ],
    },
  ],
  "On-Call & Alerting": [
    {
      id: "pagerduty",
      name: "PagerDuty",
      icon: PhoneForwarded,
      description: "Trigger and resolve incidents in PagerDuty.",
      tags: ["Incident Response"],
      status: "Official",
      scopes: ["events.write - To send events to the PagerDuty Events API."],
    },
  ],
  "Endpoint Security (EDR)": [
    {
      id: "crowdstrike",
      name: "CrowdStrike Falcon",
      icon: Shield,
      description:
        "Enrich findings with endpoint data or initiate host containment.",
      tags: ["EDR", "Enrichment", "Response"],
      status: "Beta",
      scopes: [
        "hosts:read - To query for host information.",
        "hosts:write - To perform response actions like containment.",
      ],
    },
  ],
  "Identity & Access (IdP)": [
    {
      id: "okta",
      name: "Okta",
      icon: Users,
      description:
        "Query user information or suspend users as a response action.",
      tags: ["IAM", "Zero Trust", "Response"],
      status: "Official",
      scopes: [
        "okta.users.read - To read user profiles and group memberships.",
        "okta.users.manage - To suspend or deactivate users.",
      ],
    },
  ],
  "Cloud Storage & Data Export": [
    {
      id: "s3",
      name: "Amazon S3 Bucket",
      icon: Cloud,
      description: "Export evidence, logs, and reports to a secure S3 bucket.",
      tags: ["Log Export", "Evidence", "PCI-DSS"],
      status: "Official",
      scopes: [
        "s3:PutObject - To write objects to the specified bucket.",
        "s3:GetObject - To verify bucket write access.",
      ],
    },
  ],
  "Generic Connectors": [
    {
      id: "email",
      name: "Email (SMTP)",
      icon: Mail,
      description: "Send notifications to any email address via SMTP.",
      tags: ["Notifications"],
      status: "Official",
      scopes: ["N/A - Requires SMTP server credentials."],
    },
    {
      id: "webhook",
      name: "Custom Webhook",
      icon: Puzzle,
      description: "Send custom JSON payloads to any HTTP endpoint.",
      tags: ["Custom", "Automation"],
      status: "Official",
      scopes: ["N/A - Sends outbound HTTPS requests."],
    },
  ],
};

export default function NewIntegrationWorkbench() {
  const router = useRouter();
  const [selectedTypeId, setSelectedTypeId] = useState("slack");
  const [configData, setConfigData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [testState, setTestState] = useState({ status: "idle", message: "" });

  const selectedIntegration = useMemo(() => {
    for (const category in INTEGRATION_CATALOG) {
      const found = INTEGRATION_CATALOG[category].find(
        (item) => item.id === selectedTypeId
      );
      if (found) return found;
    }
    return null;
  }, [selectedTypeId]);

  // --- THIS FUNCTION WAS MISSING ---
  const handleTestConnection = async () => {
    if (!selectedIntegration) return;
    setTestState({ status: "testing", message: "Verifying connection..." });
    try {
      const response = await fetch("/api/integrations/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedTypeId, config: configData }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Test connection failed.");
      }
      setTestState({
        status: "success",
        message: result.message || "Connection successful!",
      });
    } catch (error) {
      setTestState({ status: "error", message: error.message });
    }
  };

  const handleSave = async () => {
    if (testState.status !== "success") {
      alert("Cannot save: connection must be tested successfully first.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        type: selectedTypeId,
        name: configData.name || selectedIntegration.name,
        config: configData,
      };
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save integration");
      }
      router.push("/platform/integrations");
    } catch (error) {
      console.error("Save Integration Error:", error);
      alert(`Save Failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCatalog = useMemo(() => {
    if (!searchTerm) return INTEGRATION_CATALOG;
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = {};
    for (const category in INTEGRATION_CATALOG) {
      const items = INTEGRATION_CATALOG[category].filter(
        (item) =>
          item.name.toLowerCase().includes(lowercasedFilter) ||
          item.tags.some((tag) => tag.toLowerCase().includes(lowercasedFilter))
      );
      if (items.length > 0) {
        filtered[category] = items;
      }
    }
    return filtered;
  }, [searchTerm]);

  const renderConfigComponent = () => {
    const components = {
      slack: SlackConfig,
      jira: JiraConfig,
      pagerduty: PagerDutyConfig,
      s3: S3BucketConfig,
      email: EmailConfig,
      webhook: WebhookConfig,
      crowdstrike: CrowdStrikeConfig,
      okta: OktaConfig,
      msteams: MSTeamsConfig,
    };
    const Component = components[selectedTypeId];
    if (Component) {
      return <Component config={configData} onConfigChange={setConfigData} />;
    }
    return (
      <div className="p-8 text-center bg-slate-100 rounded-lg m-4">
        <p className="text-slate-500">
          Configuration for '{selectedIntegration?.name}' is not yet
          implemented.
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-4">
          <Link
            href="/platform/integrations"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              New Integration
            </h1>
            <p className="text-sm text-slate-500">
              Securely connect and configure a new service.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testState.status === "testing"}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60">
            {testState.status === "testing" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Test Connection
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || testState.status !== "success"}
            className="inline-flex items-center justify-center gap-2 w-40 rounded-lg border border-transparent bg-blue-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save & Activate"}
          </button>
        </div>
      </header>
      <div className="flex-1 p-6 min-h-0">
        <div className="flex h-full rounded-xl shadow-sm border border-slate-200/80 bg-white overflow-hidden">
          <aside className="w-80 border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search by name or tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border-slate-300 pl-10 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
              {Object.entries(filteredCatalog).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                    {category}
                  </h2>
                  <ul className="space-y-1">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setSelectedTypeId(item.id);
                            setTestState({ status: "idle", message: "" });
                            setConfigData({});
                          }}
                          className={clsx(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative",
                            selectedTypeId === item.id
                              ? "bg-slate-100 text-slate-900"
                              : "text-slate-600 hover:bg-slate-50"
                          )}>
                          {selectedTypeId === item.id && (
                            <motion.div
                              layoutId="sidebar-active-indicator"
                              className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full"
                            />
                          )}
                          <item.icon size={18} className="flex-shrink-0" />
                          <span className="flex-grow text-left">
                            {item.name}
                          </span>
                          {item.status === "Beta" && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-full">
                              Beta
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
          <main className="flex-1 overflow-y-auto bg-slate-50/50 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTypeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
                className="relative z-10 p-6 lg:p-8">
                {selectedIntegration && (
                  <IntegrationConfigWrapper
                    integration={selectedIntegration}
                    testState={testState}>
                    {renderConfigComponent()}
                  </IntegrationConfigWrapper>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function IntegrationConfigWrapper({ integration, testState, children }) {
  const [activeTab, setActiveTab] = useState("config");
  const tabs = [
    { id: "config", label: "Configuration", icon: Puzzle },
    { id: "security", label: "Security & Scopes", icon: Lock },
    { id: "docs", label: "Documentation", icon: FileText },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <integration.icon className="w-10 h-10 text-slate-700" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {integration.name}
            </h2>
            <p className="text-slate-500">{integration.description}</p>
          </div>
        </div>
        <div className="flex space-x-2 mt-2">
          {integration.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </header>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <nav className="flex items-center justify-between">
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors",
                    activeTab === tab.id
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-100/70"
                  )}>
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={testState.status}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 text-sm">
                {testState.status === "success" && (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />{" "}
                    <span className="text-green-700 font-medium">
                      {testState.message}
                    </span>
                  </>
                )}
                {testState.status === "error" && (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />{" "}
                    <span className="text-red-700 font-medium">
                      {testState.message}
                    </span>
                  </>
                )}
                {testState.status === "testing" && (
                  <>
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />{" "}
                    <span className="text-slate-600">{testState.message}</span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </nav>
        </div>
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}>
              {activeTab === "config" && children}
              {activeTab === "security" && (
                <SecurityTabContent integration={integration} />
              )}
              {activeTab === "docs" && (
                <DocsTabContent integration={integration} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SecurityTabContent({ integration }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Required Permissions
      </h3>
      <p className="text-sm text-slate-600 mb-4">
        To function correctly, this integration requires the following
        permissions (scopes) to be granted in {integration.name}.
      </p>
      <ul className="space-y-2 text-sm list-none bg-slate-50 border border-slate-200 rounded-lg p-4">
        {integration.scopes.map((scope) => (
          <li key={scope} className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-slate-700 font-mono text-xs bg-slate-200 px-1.5 py-0.5 rounded">
              {scope.split(" - ")[0]}
            </span>
            <span className="text-slate-600">- {scope.split(" - ")[1]}</span>
          </li>
        ))}
      </ul>
      <hr className="my-6 border-slate-200" />
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Metadata & Tagging
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <label
            htmlFor="env"
            className="block font-medium text-slate-700 mb-1">
            Environment
          </label>
          <select
            id="env"
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option>Production</option>
            <option>Staging</option>
            <option>Development</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Tagging the environment helps prevent accidental actions.
          </p>
        </div>
        <div>
          <label
            htmlFor="purpose"
            className="block font-medium text-slate-700 mb-1">
            Purpose / Owner
          </label>
          <input
            type="text"
            id="purpose"
            placeholder="e.g., Critical alerts for SOC team"
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Provide a brief description for audit purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

function DocsTabContent({ integration }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Setup Guide: {integration.name}
      </h3>
      <div className="prose prose-sm prose-slate max-w-none">
        <p>
          Follow these steps to configure the {integration.name} integration:
        </p>
        <ol>
          <li>
            Navigate to the App Directory in your {integration.name} workspace.
          </li>
          <li>Create a new application named "Project Catalyst".</li>
          <li>
            Under the "Permissions" or "Scopes" section, grant the required
            permissions listed in the "Security & Scopes" tab.
          </li>
          <li>Generate an API token or OAuth credentials.</li>
          <li>
            Copy the credentials and paste them into the fields on the
            "Configuration" tab.
          </li>
          <li>
            Click "Test Connection" to verify the credentials are correct before
            saving.
          </li>
        </ol>
      </div>
    </div>
  );
}
