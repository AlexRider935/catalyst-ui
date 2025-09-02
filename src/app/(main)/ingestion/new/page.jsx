"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Search,
  ShieldCheck,
  Rss,
  Cloud,
} from "lucide-react";
import clsx from "clsx";
import toast, { Toaster } from "react-hot-toast";

import CatalystAgentConfig from "./components/CatalystAgentConfig";

// --- Placeholder for unimplemented source types ---
const PlaceholderConfig = ({ type, config, onConfigChange }) => (
  <div className="space-y-4">
    <label
      htmlFor="name"
      className="block text-sm font-medium text-slate-700 mb-1"
    >
      Source Name
    </label>
    <input
      type="text"
      id="name"
      name="name"
      value={config.name || ""}
      onChange={(e) => onConfigChange({ ...config, name: e.target.value })}
      placeholder={`e.g., Primary ${type} Feed`}
      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm"
      required
    />
    <div className="mt-6 p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-slate-500">
        Configuration form for <span className="font-semibold">“{type}”</span>{" "}
        is not yet implemented.
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
  ],
  "Cloud Platforms": [
    {
      id: "aws-s3-sqs",
      name: "AWS S3 via SQS",
      icon: Cloud,
      description: "Real-time log ingestion from S3 using SQS notifications.",
      tags: ["AWS", "CloudTrail"],
    },
  ],
};

// --- Map IDs to dedicated configuration components ---
const CONFIG_COMPONENT_MAP = {
  "catalyst-agent": CatalystAgentConfig,
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

  const handleSave = async () => {
    if (!configData.name) {
      toast.error("Source name is required.");
      return;
    }
    setIsSaving(true);
    try {
      if (selectedSourceTypeId === "catalyst-agent") {
        const response = await fetch("/api/agents/generate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: configData.name }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        toast.success("Agent pre-registered successfully!");

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-slate-200`}
            >
              <div className="flex-1 w-0 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  One-Time Registration Token
                </p>
                <div className="mt-2 p-2 bg-slate-100 font-mono text-xs rounded break-all">
                  {result.registration_token}
                </div>
              </div>
              <div className="flex border-l border-slate-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="px-4 text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          ),
          { duration: 600000 }
        );

        setTimeout(() => {
          router.push("/ingestion");
        }, 1000);
      } else {
        toast.error(
          `Saving for “${selectedSource?.name || "this source"}” is not yet implemented.`
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
    const lower = searchTerm.toLowerCase();
    const filtered = {};
    for (const category in SOURCE_CATALOG) {
      const items = SOURCE_CATALOG[category].filter(
        (item) =>
          item.name.toLowerCase().includes(lower) ||
          item.tags.some((tag) => tag.toLowerCase().includes(lower))
      );
      if (items.length > 0) filtered[category] = items;
    }
    return filtered;
  }, [searchTerm]);

  const renderConfigComponent = () => {
    const Component =
      CONFIG_COMPONENT_MAP[selectedSourceTypeId] || PlaceholderConfig;
    return (
      <Component
        type={selectedSource?.name}
        config={configData}
        onConfigChange={setConfigData}
      />
    );
  };

  return (
    <>
      <Toaster position="bottom-right" containerClassName="font-sans" />
      <div className="flex flex-col h-full bg-slate-50 space-y-8">
        {/* Header */}
        <header className="flex-shrink-0 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/ingestion"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={22} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                New Ingestion Source
              </h1>
              <p className="mt-1 text-slate-500">
                Select and configure a data source from the catalog.
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || !configData.name}
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save & Activate"
            )}
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 min-h-0">
          <div className="flex h-full rounded-xl shadow-sm border border-slate-200/80 bg-white overflow-hidden">
            {/* Sidebar */}
            <aside className="w-80 border-r border-slate-200 flex flex-col bg-white">
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search sources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border-slate-300 pl-10 text-sm focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>
              <nav className="flex-1 p-2 overflow-y-auto">
                {Object.entries(filteredCatalog).map(([category, items]) => (
                  <div key={category} className="mb-4">
                    <h3 className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {category}
                    </h3>
                    <ul className="space-y-1 mt-1">
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
                                ? "bg-slate-200 text-slate-900"
                                : "text-slate-600 hover:bg-slate-100"
                            )}
                          >
                            {selectedSourceTypeId === item.id && (
                              <motion.div
                                layoutId="sidebar-active-indicator"
                                className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full"
                              />
                            )}
                            <item.icon size={18} className="flex-shrink-0" />
                            <span className="flex-1 truncate text-left">
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

            {/* Config panel */}
            <section className="flex-1 overflow-y-auto bg-slate-50/50">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedSourceTypeId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 p-6 lg:p-8"
                >
                  {selectedSource && (
                    <SourceConfigWrapper source={selectedSource}>
                      {renderConfigComponent()}
                    </SourceConfigWrapper>
                  )}
                </motion.div>
              </AnimatePresence>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

function SourceConfigWrapper({ source, children }) {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-4">
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
              className="text-xs bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-full"
            >
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