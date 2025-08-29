"use client";

import { useState, useEffect } from "react";
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
  FileText, // Icon for log events
  ShieldAlert, // Icon for FIM events
  Loader2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import clsx from "clsx";
// --- Sub-components for the Advanced View ---

function StatusBadge({ status }) {
  const statusInfo = {
    Online: {
      icon: CheckCircle,
      color: "bg-green-100 text-green-700",
      label: "Online",
    },
    Offline: {
      icon: XCircle,
      color: "bg-red-100 text-red-700",
      label: "Offline",
    },
    "Never Connected": {
      icon: Clock,
      color: "bg-slate-200 text-slate-600",
      label: "Never Connected",
    },
  };
  const currentStatus = statusInfo[status] || statusInfo["Never Connected"];
  const Icon = currentStatus.icon;
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full ${currentStatus.color}`}>
      <Icon size={14} />
      <span>{currentStatus.label}</span>
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
    <div className="group flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
      <div className="text-sm text-slate-500 flex items-center gap-3">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-slate-700 text-sm ${isMono ? "font-mono" : ""}`}>
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
  <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
    <h4 className="font-semibold text-slate-800 text-base">Agent Vitals</h4>
    <div className="mt-4 space-y-3 text-sm">
      <div className="flex justify-between items-center">
        <span className="text-slate-500">IP Address</span>
        <span className="font-medium text-slate-800 font-mono">
          {agent.ip_address || "N/A"}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-500">Operating System</span>
        <span className="font-medium text-slate-800">
          {agent.os_name || "Unknown"}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-500">Agent Version</span>
        <span className="font-medium text-slate-800">
          {agent.version || "1.0.0"}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-500">Last Seen</span>
        <span className="font-medium text-slate-800">
          {agent.last_seen_at
            ? formatDistanceToNow(new Date(agent.last_seen_at), {
                addSuffix: true,
              })
            : "Never"}
        </span>
      </div>
    </div>
  </div>
);

const ComplianceCard = ({ agent }) => {
  const isCompliant = agent.status === "Online";
  const Icon = isCompliant ? CheckCircle : AlertCircle;
  const color = isCompliant ? "text-green-600" : "text-amber-600";
  const text = isCompliant ? "Compliant" : "Needs Attention";
  const description = isCompliant
    ? "Agent is online and reporting as expected."
    : "Agent is offline or has never connected.";
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
      <Icon size={32} className={color} />
      <div>
        <h4 className="font-semibold text-slate-800 text-base">
          Compliance Status
        </h4>
        <p className={`font-semibold ${color}`}>{text}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
};

// --- UPDATED EventsTab with Live Polling and Better Styling ---
const Event = ({ event }) => {
  // Determine icon and color based on the event type for better visual parsing
  const eventType = event.data?.type || "log";
  const eventInfo = {
    log: { icon: FileText, color: "text-blue-500" },
    fim: { icon: ShieldAlert, color: "text-amber-500" },
    default: { icon: FileText, color: "text-slate-500" },
  };
  const { icon: Icon, color } = eventInfo[eventType] || eventInfo.default;

  return (
    <div className="flex items-start py-2.5 border-b border-slate-100 last:border-b-0">
      <Icon size={16} className={`mr-4 mt-0.5 shrink-0 ${color}`} />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-700 text-sm capitalize">
            {eventType} Event
          </span>
          <span className="text-slate-400 font-mono text-xs">
            {format(new Date(event.received_at), "HH:mm:ss")}
          </span>
        </div>
        <code className="text-xs text-slate-500 mt-1 block whitespace-pre-wrap">
          {JSON.stringify(event.data, null, 2)}
        </code>
      </div>
    </div>
  );
};

const EventsTab = ({ agentId }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!agentId) return;
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/agents/${agentId}/events`);
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        toast.error(error.message, { id: "fetch-events-error" });
      } finally {
        if (isLoading) setIsLoading(false);
      }
    };

    fetchEvents(); // Fetch on initial load
    const intervalId = setInterval(fetchEvents, 15000); // Poll for new events every 15 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [agentId]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800">
        Live Event Stream
      </h3>
      <div className="mt-4 border-t border-slate-200 -mx-6">
        {isLoading ? (
          <div className="text-center p-8 text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            <span>Loading initial events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-slate-500 text-sm">
              No recent events found for this agent.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[30rem] overflow-y-auto px-6">
            {events.map((event) => (
              <Event key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- The Main Detail Component ---
export default function SourceDetail({ source, onDeleteInitiated, onUpdate }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const handleManualCheck = async () => {
    setIsCheckingStatus(true);
    toast.loading("Checking agent status...", { id: "status-check" });
    try {
      await fetch("/api/agents/check-status", { method: "POST" });
      if (onUpdate) {
        await onUpdate();
      }
      toast.success("Status check complete.", { id: "status-check" });
    } catch (error) {
      toast.error("Failed to check status.", { id: "status-check" });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  if (!source) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-center p-8">
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
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{source.name}</h1>
            <p className="mt-1 text-slate-500">
              Agent Health & Event Monitoring Dashboard
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* --- UPDATED REFRESH BUTTON LOGIC --- */}
            <div
              title={
                source.status !== "Online"
                  ? "Agent must be Online to check for disconnection."
                  : "Force a server-side check for this agent's status."
              }>
              <button
                onClick={handleManualCheck}
                disabled={isCheckingStatus || source.status !== "Online"}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <RefreshCw
                  size={16}
                  className={isCheckingStatus ? "animate-spin" : ""}
                />
                Refresh Status
              </button>
            </div>
            <button
              onClick={() => onDeleteInitiated(source)}
              className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              <Trash2 size={16} /> Delete Agent
            </button>
          </div>
        </header>

        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none",
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )}>
                {tab}
              </button>
            ))}
          </nav>
        </div>

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
                  <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
                    <h4 className="font-semibold text-slate-800 text-base mb-2">
                      Key Identifiers
                    </h4>
                    <DetailItem
                      icon={Fingerprint}
                      label="Agent ID"
                      value={source.id}
                      isMono={true}
                    />
                    <DetailItem
                      icon={Server}
                      label="Device ID"
                      value={source.device_identifier}
                      isMono={true}
                    />
                    <DetailItem
                      icon={Shield}
                      label="API Key"
                      value={redactedApiKey}
                      isMono={true}
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
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200/80 shadow-sm">
                  <p className="text-slate-500">
                    Agent's reported configuration will be displayed here.
                  </p>
                </div>
              )}
              {activeTab === "Audit Trail" && (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200/80 shadow-sm">
                  <p className="text-slate-500">
                    Actions performed on this agent will be logged here.
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
