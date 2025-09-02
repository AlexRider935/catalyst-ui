"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Fingerprint,
  Calendar,
  Trash2,
  Copy,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import clsx from "clsx";
import EventsTab from "./EventsTab";
import ConfigurationTab from "./ConfigurationTab";

function StatusBadge({ status }) {
  const statusInfo = {
    Online: {
      icon: CheckCircle,
      color: "bg-green-100 text-green-700 ring-1 ring-green-200",
      label: "Online",
    },
    Offline: {
      icon: XCircle,
      color: "bg-red-100 text-red-700 ring-1 ring-red-200",
      label: "Offline",
    },
    "Never Connected": {
      icon: Clock,
      color: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
      label: "Never Connected",
    },
  };
  const currentStatus = statusInfo[status] || statusInfo["Never Connected"];
  const Icon = currentStatus.icon;
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${currentStatus.color}`}>
      <Icon size={14} />
      {currentStatus.label}
    </div>
  );
}

const DetailItem = ({ icon, label, value, isMono = false }) => {
  const Icon = icon;
  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      toast.success(`${label} copied!`);
    }
  };
  return (
    <div className="group flex items-center justify-between py-2.5 border-b border-slate-100 last:border-none">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon size={16} />
        {label}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            "text-sm text-slate-800",
            isMono && "font-mono tracking-tight"
          )}>
          {value || "—"}
        </span>
        {value && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600">
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

const VitalsCard = ({ agent }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
    <h4 className="font-semibold text-slate-800 text-base">Agent Vitals</h4>
    <dl className="mt-4 space-y-3 text-sm">
      <div className="flex justify-between">
        <dt className="text-slate-500">IP Address</dt>
        <dd className="font-mono text-slate-800">
          {agent.ip_address || "N/A"}
        </dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-slate-500">Operating System</dt>
        <dd className="text-slate-800">{agent.os_name || "Unknown"}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-slate-500">Agent Version</dt>
        <dd className="text-slate-800">{agent.version || "1.0.0"}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-slate-500">Last Seen</dt>
        <dd className="text-slate-800">
          {agent.last_seen_at
            ? formatDistanceToNow(new Date(agent.last_seen_at), {
                addSuffix: true,
              })
            : "Never"}
        </dd>
      </div>
    </dl>
  </div>
);

const ComplianceCard = ({ agent }) => {
  const isCompliant = agent.status === "Online";
  const Icon = isCompliant ? CheckCircle : AlertCircle;
  const color = isCompliant ? "text-green-600" : "text-amber-600";
  const text = isCompliant ? "Compliant" : "Needs Attention";
  const description = isCompliant
    ? "Agent is online and reporting normally."
    : "Agent is offline or has never connected.";
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start gap-3">
      <Icon size={28} className={color} />
      <div>
        <h4 className="font-semibold text-slate-800 text-base">
          Compliance Status
        </h4>
        <p className={`font-medium ${color}`}>{text}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
};

// --- Main Detail Component ---
export default function SourceDetail({ source, onDeleteInitiated, onUpdate }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const handleManualCheck = async () => {
    setIsCheckingStatus(true);
    toast.loading("Checking agent status...", { id: "status-check" });
    try {
      await fetch("/api/agents/check-status", { method: "POST" });
      if (onUpdate) await onUpdate();
      toast.success("Status check complete.", { id: "status-check" });
    } catch {
      toast.error("Failed to check status.", { id: "status-check" });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  if (!source) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-10 text-center">
        <Shield size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">
          No Agent Selected
        </h2>
        <p className="mt-1 text-slate-500">
          Select an agent from the list to view its details.
        </p>
      </div>
    );
  }

  const redactedApiKey = source.api_key
    ? `${source.api_key.substring(0, 15)}...`
    : "—";
  const tabs = ["Overview", "Events", "Configuration", "Audit Trail"];

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <motion.div
        key={source.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 flex items-center gap-3">
              {source.name}
              <StatusBadge status={source.status} />
            </h1>
            <p className="mt-1 text-slate-500 text-sm">
              Agent Health & Event Monitoring Dashboard
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualCheck}
              disabled={isCheckingStatus || source.status !== "Online"}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <RefreshCw
                size={16}
                className={isCheckingStatus ? "animate-spin" : ""}
              />
              Refresh
            </button>
            <button
              onClick={() => onDeleteInitiated(source)}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 py-2 px-3 text-sm font-medium text-white shadow-sm hover:bg-red-700">
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )}>
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}>
              {activeTab === "Overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <VitalsCard agent={source} />
                    <ComplianceCard agent={source} />
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="font-semibold text-slate-800 text-base mb-3">
                      Key Identifiers
                    </h4>
                    <DetailItem
                      icon={Fingerprint}
                      label="Agent ID"
                      value={source.id}
                      isMono
                    />
                    <DetailItem
                      icon={Server}
                      label="Device ID"
                      value={source.device_identifier}
                      isMono
                    />
                    <DetailItem
                      icon={Shield}
                      label="API Key"
                      value={redactedApiKey}
                      isMono
                    />
                    <DetailItem
                      icon={Calendar}
                      label="Registered"
                      value={new Date(source.created_at).toLocaleDateString()}
                    />
                  </div>
                </div>
              )}
              {activeTab === "Events" && <EventsTab agentId={source.id} />}
              {activeTab === "Configuration" && (
                <ConfigurationTab agentId={source.id} />
              )}
              {activeTab === "Audit Trail" && (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500">
                    Actions performed on this agent will appear here.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
