"use client";

import { useState } from "react";
import { Rss, Plus } from "lucide-react";
import AddSourceModal from "./components/AddSourceModal";
import SourceCard from "../../components/SourceCard";

// Mock data to simulate connected sources. An empty array will show the empty state.
const mockSources = [
  {
    id: 1,
    name: "Production PostgreSQL",
    type: "Database",
    status: "Online",
    eventCount: 1_283_492,
  },
  {
    id: 2,
    name: "AWS CloudTrail",
    type: "Cloud API",
    status: "Online",
    eventCount: 8_492_104,
  },
  {
    id: 3,
    name: "Primary Firewall (Palo Alto)",
    type: "Syslog / Network",
    status: "Offline",
    eventCount: 0,
  },
];

export default function IngestionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sources, setSources] = useState(mockSources);

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Ingestion Manager
          </h1>
          <p className="mt-1 text-slate-500">
            Connect and manage your {sources.length} data sources.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-100">
          <Plus size={18} />
          Add Source
        </button>
      </div>

      {/* Content Area */}
      {sources.length > 0 ? (
        // Grid View
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <SourceCard key={source.id} {...source} />
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center text-center bg-white border-2 border-dashed border-slate-300 rounded-lg p-16 h-full">
          <div className="p-4 mb-5 rounded-full bg-slate-100 text-slate-500">
            <Rss size={48} />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800">
            No Data Sources Connected
          </h2>
          <p className="mt-2 max-w-lg text-slate-500">
            The Catalyst gains its intelligence from the data you provide.
            Connect your first source to begin the analysis.
          </p>
        </div>
      )}

      {/* The Modal Component */}
      <AddSourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
