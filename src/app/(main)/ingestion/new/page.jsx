"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Database,
  Rss,
  Cloud,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  Lock,
  FileText,
  Puzzle,
  ShieldCheck,
  GitBranch,
  Building,
  Webhook,
  Server,
} from "lucide-react";
import clsx from "clsx";
import toast, { Toaster } from "react-hot-toast";

// --- Configuration Form Components ---
import CatalystAgentConfig from "./components/CatalystAgentConfig";
import SyslogConfig from "./components/SyslogConfig";
import S3Config from "./components/S3Config";

const PlaceholderConfig = ({ type, config, onConfigChange }) => (
  <div className="space-y-4">
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
      placeholder={`e.g., Primary ${type} Feed`}
      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      required
    />
    <div className="mt-6 p-8 text-center bg-slate-100 rounded-lg border">
      <p className="text-slate-500">
        Configuration form for '{type}' is not yet implemented.
      </p>
    </div>
  </div>
);

// --- Comprehensive Source Catalog ---
const SOURCE_CATALOG = {
  "AWS Ecosystem": [
    {
      id: "aws-s3-sqs",
      name: "AWS S3 via SQS",
      icon: Cloud,
      description: "Real-time log ingestion from S3 using SQS notifications.",
      tags: ["AWS", "CloudTrail", "Real-time"],
      docs: "Provide an SQS queue URL and an IAM role ARN with s3:GetObject and sqs:ReceiveMessage permissions.",
    },
    {
      id: "aws-cloudwatch",
      name: "AWS CloudWatch Logs",
      icon: Cloud,
      description: "Stream logs directly from CloudWatch log groups.",
      tags: ["AWS", "Lambda", "Serverless"],
      docs: "Provide an IAM role ARN with logs:CreateLogStream and logs:PutLogEvents permissions for the target log group.",
    },
    {
      id: "aws-kinesis",
      name: "AWS Kinesis Firehose",
      icon: Cloud,
      description: "Ingest high-volume streams from Kinesis Data Firehose.",
      tags: ["AWS", "Streaming", "High-Volume"],
      docs: "Configure Kinesis Firehose to deliver to an HTTP endpoint provided by Catalyst.",
    },
    {
      id: "aws-guardduty",
      name: "AWS GuardDuty",
      icon: ShieldCheck,
      description: "Ingest security findings from AWS GuardDuty.",
      tags: ["AWS", "Security", "Threats"],
      docs: "Set up an EventBridge rule to forward GuardDuty findings to an SQS queue and provide the queue URL.",
    },
  ],
  "Azure & GCP": [
    {
      id: "azure-eventhub",
      name: "Azure Event Hub",
      icon: Cloud,
      description: "Stream events from Azure services via an Event Hub.",
      tags: ["Azure", "Microsoft"],
      docs: "Provide the Event Hub connection string and consumer group information.",
    },
    {
      id: "gcp-pubsub",
      name: "GCP Pub/Sub",
      icon: Cloud,
      description:
        "Ingest Google Cloud audit and flow logs via a Pub/Sub subscription.",
      tags: ["GCP", "Google Cloud"],
      docs: "Provide a service account key with the Pub/Sub Subscriber role for the target subscription.",
    },
  ],
  "Endpoint & Host": [
    {
      id: "catalyst-agent",
      name: "Catalyst Universal Agent",
      icon: ShieldCheck,
      description:
        "Deploy a lightweight, universal agent to collect logs, file integrity data, and system events directly from your endpoints.",
      tags: ["Endpoint", "HIDS", "FIM", "Proprietary"],
      docs: "Download the agent package for your OS (Windows, Linux, macOS). Run the installer with your unique tenant ID and ingestion key to automatically register and begin forwarding events.",
    },
    {
      id: "mde",
      name: "Microsoft Defender",
      icon: ShieldCheck,
      description:
        "Stream advanced hunting events from Microsoft Defender for Endpoint.",
      tags: ["EDR", "XDR", "Microsoft"],
      docs: "Provide Azure AD App credentials with the AdvancedHunting.Read.All permission.",
    },
    {
      id: "crowdstrike-fdr",
      name: "CrowdStrike FDR",
      icon: ShieldCheck,
      description:
        "Ingest raw endpoint event data from Falcon Data Replicator.",
      tags: ["EDR", "Threat Hunting"],
      docs: "Provide CrowdStrike API credentials with the FDR scope and your AWS SQS queue URL.",
    },
  ],
  "Network & Infrastructure": [
    {
      id: "syslog",
      name: "Syslog",
      icon: Rss,
      description:
        "Standard UDP/TCP listener for firewalls, routers, and Linux systems.",
      tags: ["Network", "Firewall", "Legacy"],
      docs: "Configure your device to forward Syslog packets to the specified Catalyst port and IP address.",
    },
    {
      id: "gelf",
      name: "GELF",
      icon: Rss,
      description:
        "Ingest Graylog Extended Log Format messages over UDP or TCP.",
      tags: ["Graylog", "Structured Logs"],
      docs: "Configure your GELF source to send messages to the specified Catalyst port and IP address.",
    },
    {
      id: "zeek",
      name: "Zeek Logs",
      icon: Rss,
      description: "Ingest rich, structured network traffic logs from Zeek.",
      tags: ["Network", "NSM", "Threat Hunting"],
      docs: "Forward Zeek's JSON-formatted logs via a filebeat shipper or Syslog.",
    },
    {
      id: "tcp-udp-raw",
      name: "Raw TCP/UDP",
      icon: Server,
      description:
        "A raw socket listener for custom or unstructured text logs.",
      tags: ["Custom", "Legacy", "Plaintext"],
      docs: "Select a port and protocol (TCP or UDP) for Catalyst to listen on.",
    },
  ],
  "SaaS & Identity": [
    {
      id: "m365",
      name: "Microsoft 365",
      icon: Building,
      description:
        "Ingest unified audit logs from Azure AD, Exchange, and SharePoint.",
      tags: ["SaaS", "Compliance", "Microsoft"],
      docs: "Provide Azure AD App credentials with the ActivityFeed.Read permission.",
    },
    {
      id: "google-workspace",
      name: "Google Workspace",
      icon: Building,
      description:
        "Ingest audit logs for Admin, Drive, Login, and other activities.",
      tags: ["SaaS", "Compliance", "Google"],
      docs: "Provide a service account key with the appropriate Admin SDK API scopes enabled.",
    },
    {
      id: "okta-logs",
      name: "Okta System Log",
      icon: Building,
      description: "Stream user authentication and system events from Okta.",
      tags: ["IdP", "IAM", "Zero Trust"],
      docs: "Provide an Okta API token with the okta.logs.read permission.",
    },
    {
      id: "github-audit",
      name: "GitHub Audit Log",
      icon: GitBranch,
      description:
        "Stream your organization's audit log for security and compliance.",
      tags: ["DevSecOps", "Code", "Compliance"],
      docs: "Provide a personal access token (PAT) or GitHub App credentials with the read:org scope.",
    },
    {
      id: "salesforce-events",
      name: "Salesforce Events",
      icon: Building,
      description:
        "Monitor security events like logins, report exports, and permissions changes.",
      tags: ["SaaS", "CRM", "Compliance"],
      docs: "Provide Salesforce API credentials with the 'View All Data' and 'API Enabled' permissions.",
    },
  ],
  "Vulnerability Management": [
    {
      id: "tenable",
      name: "Tenable.io",
      icon: ShieldCheck,
      description: "Ingest vulnerability and asset data from Tenable.io.",
      tags: ["VM", "Assets", "Compliance"],
      docs: "Provide API keys (access and secret) from your Tenable.io account.",
    },
  ],
  Databases: [
    {
      id: "postgres",
      name: "PostgreSQL",
      icon: Database,
      description: "Connect to a PostgreSQL database to ingest table data.",
      tags: ["SQL", "Application Logs"],
      docs: "Provide the database connection string. For security, use a read-only user.",
    },
  ],
  "Custom & Generic": [
    {
      id: "http-json",
      name: "HTTP JSON Endpoint",
      icon: Webhook,
      description: "Receive structured JSON logs over a secure HTTP endpoint.",
      tags: ["Custom", "API", "Serverless"],
      docs: "Catalyst will generate a unique URL and secret key for you to send POST requests to.",
    },
    {
      id: "file-upload",
      name: "File Upload",
      icon: Upload,
      description: "Upload log files manually for one-time analysis.",
      tags: ["CSV", "JSON", "Manual"],
      docs: "Upload a file in a supported format (e.g., .csv, .json, .log). Maximum file size is 100MB.",
    },
  ],
};

const CONFIG_COMPONENT_MAP = {
  "catalyst-agent": CatalystAgentConfig,
  syslog: SyslogConfig,
  "aws-s3-sqs": S3Config,
};

export default function NewSourceWorkbench() {
  const router = useRouter();
  const [selectedSourceTypeId, setSelectedSourceTypeId] =
    useState("catalyst-agent");
  const [configData, setConfigData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [testState, setTestState] = useState({ status: "idle", message: "" });

  const selectedSource = useMemo(() => {
    for (const category in SOURCE_CATALOG) {
      const found = SOURCE_CATALOG[category].find(
        (item) => item.id === selectedSourceTypeId
      );
      if (found) return found;
    }
    return null;
  }, [selectedSourceTypeId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        type: selectedSourceTypeId,
        name: configData.name,
        config: configData,
      };
      const response = await fetch("/api/ingestion/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save source");
      }
      toast.success("Source created successfully!");
      router.push("/ingestion");
    } catch (error) {
      toast.error(`Save Failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCatalog = useMemo(() => {
    if (!searchTerm) return SOURCE_CATALOG;
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = {};
    for (const category in SOURCE_CATALOG) {
      const items = SOURCE_CATALOG[category].filter(
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
    const Component =
      CONFIG_COMPONENT_MAP[selectedSourceTypeId] || PlaceholderConfig;
    return (
      <Component
        type={selectedSource.name}
        config={configData}
        onConfigChange={setConfigData}
      />
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-4">
          <Link
            href="/ingestion"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              New Ingestion Source
            </h1>
            <p className="text-sm text-slate-500">
              Select and configure a data source.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !configData.name}
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
                  placeholder="Search sources..."
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
                            setSelectedSourceTypeId(item.id);
                            setConfigData({});
                          }}
                          className={clsx(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative",
                            selectedSourceTypeId === item.id
                              ? "bg-slate-100 text-slate-900"
                              : "text-slate-600 hover:bg-slate-50"
                          )}>
                          {selectedSourceTypeId === item.id && (
                            <motion.div
                              layoutId="sidebar-active-indicator"
                              className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full"
                            />
                          )}
                          <item.icon size={18} className="flex-shrink-0" />
                          <span className="flex-grow text-left">
                            {item.name}
                          </span>
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
                key={selectedSourceTypeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
                className="relative z-10 p-6 lg:p-8">
                {selectedSource && (
                  <SourceConfigWrapper source={selectedSource}>
                    {renderConfigComponent()}
                  </SourceConfigWrapper>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function SourceConfigWrapper({ source, children }) {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <source.icon className="w-10 h-10 text-slate-700" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{source.name}</h2>
            <p className="text-slate-500">{source.description}</p>
          </div>
        </div>
        <div className="flex space-x-2 mt-2">
          {source.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </header>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {children}
      </div>
    </div>
  );
}
