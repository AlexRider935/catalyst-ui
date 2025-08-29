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
  ShieldCheck,
  GitBranch,
  Building,
  Webhook,
  Server,
} from "lucide-react";
import clsx from "clsx";
import toast, { Toaster } from "react-hot-toast";

// --- Import all dedicated configuration components ---
import CatalystAgentConfig from "./components/CatalystAgentConfig";
// Example: import SyslogConfig from "./components/configs/SyslogConfig";

// --- Placeholder for unimplemented source types ---
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

// --- Comprehensive catalog of all supported source types ---
const SOURCE_CATALOG = {
  "Endpoint & Host": [
    {
      id: "catalyst-agent",
      name: "Catalyst Universal Agent",
      icon: ShieldCheck,
      description:
        "Deploy a lightweight, universal agent to collect logs, FIM data, and command output.",
      tags: ["Endpoint", "HIDS", "FIM"],
    },
    // Other source types...
  ],
  "Network & Infrastructure": [
    {
      id: "syslog",
      name: "Syslog",
      icon: Rss,
      description:
        "Standard UDP/TCP listener for firewalls, routers, and Linux systems.",
      tags: ["Network", "Firewall"],
    },
    // Other source types...
  ],
  "Cloud Platforms": [
    {
      id: "aws-s3-sqs",
      name: "AWS S3 via SQS",
      icon: Cloud,
      description: "Real-time log ingestion from S3 using SQS notifications.",
      tags: ["AWS", "CloudTrail"],
    },
    // Other source types...
  ],
};

// --- Map source type IDs to their dedicated configuration components ---
const CONFIG_COMPONENT_MAP = {
  "catalyst-agent": CatalystAgentConfig,
  // "syslog": SyslogConfig,
};

// --- Main Page Component ---
export default function NewSourceWorkbench() {
  const router = useRouter();
  const [selectedSourceTypeId, setSelectedSourceTypeId] =
    useState("catalyst-agent");
  const [configData, setConfigData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedSource = useMemo(() => {
    for (const category in SOURCE_CATALOG) {
      const found = SOURCE_CATALOG[category].find(
        (item) => item.id === selectedSourceTypeId
      );
      if (found) return found;
    }
    return null;
  }, [selectedSourceTypeId]);

  // --- DEFINITIVE SAVE FUNCTION ---
  const handleSave = async () => {
    if (!configData.name) {
      toast.error("Source name is required.");
      return;
    }
    setIsSaving(true);
    try {
      let result;
      // --- Agent Pre-Registration Logic ---
      if (selectedSourceTypeId === "catalyst-agent") {
        const response = await fetch("/api/agents/generate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: configData.name }),
        });
        result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Failed to pre-register agent.");
        }

        // Show a persistent toast with the token for the user to copy.
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <p className="text-sm font-medium text-gray-900">
                  Agent Pre-Registered!
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Copy the one-time registration token below to deploy your
                  agent.
                </p>
                <div className="mt-2 p-2 bg-slate-100 font-mono text-xs rounded break-all">
                  {result.registration_token}
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Close
                </button>
              </div>
            </div>
          ),
          { duration: 600000 } // Keep toast open for 10 minutes
        );

        // Redirect back to the main agent list after a short delay.
        setTimeout(() => {
          router.push(`/ingestion`);
        }, 1000);
      } else {
        // --- Logic for all other source types (Placeholder) ---
        toast.error(
          `Saving for '${selectedSource.name}' is not yet implemented.`
        );
      }
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
    <div className="flex flex-col h-full bg-slate-50">
      <Toaster position="bottom-right" />
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
              Select and configure a data source from the catalog.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !configData.name}
            className="inline-flex items-center justify-center gap-2 w-44 rounded-lg border border-transparent bg-blue-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save & Activate"
            )}
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
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <source.icon className="w-10 h-10 text-slate-700" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{source.name}</h2>
            <p className="text-slate-500">{source.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {source.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </header>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
