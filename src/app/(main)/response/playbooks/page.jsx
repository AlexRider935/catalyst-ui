"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Zap,
  Plus,
  Search,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  Server,
  MoreHorizontal,
  FileClock,
  User,
} from "lucide-react";
import { Switch } from "@headlessui/react";
import clsx from "clsx";

// --- Advanced Mock Data ---
// This data structure reflects a production environment, including audit and metric fields.
const initialPlaybookData = [
  {
    id: "pb-1",
    name: "Isolate Endpoint on High-Severity Alert",
    description:
      "Automatically isolates endpoints via EDR when a high or critical severity alert is triggered.",
    trigger: { type: "Security Event", value: "Severity >= High" },
    status: true,
    version: 3,
    owner: "soc-automata",
    lastRun: "2023-10-26T10:00:00Z",
    runStats: { success: 128, failed: 2 },
  },
  {
    id: "pb-2",
    name: "Disable User on Impossible Travel",
    description:
      "Suspends user account in Active Directory if an impossible travel rule matches.",
    trigger: { type: "Detection Rule", value: "Impossible Travel" },
    status: true,
    version: 2,
    owner: "david.chen",
    lastRun: "2023-10-25T14:30:00Z",
    runStats: { success: 12, failed: 0 },
  },
  {
    id: "pb-3",
    name: "Compliance: Notify on S3 Bucket Public",
    description:
      "Creates a high-priority ticket in Jira and notifies the cloud security team in Slack.",
    trigger: { type: "Compliance Event", value: "AWS S3 Public" },
    status: false,
    version: 1,
    owner: "carol.danvers",
    lastRun: null,
    runStats: { success: 0, failed: 0 },
  },
  {
    id: "pb-4",
    name: "Enrich Phishing Alert with Threat Intel",
    description:
      "Queries VirusTotal and AbuseIPDB for indicators found in a reported phishing email.",
    trigger: { type: "Security Event", value: "Phishing Reported" },
    status: true,
    version: 5,
    owner: "soc-automata",
    lastRun: "2023-10-26T11:22:00Z",
    runStats: { success: 431, failed: 12 },
  },
];

const triggerMap = {
  "Security Event": { icon: ShieldAlert, color: "text-red-500" },
  "Detection Rule": { icon: GitBranch, color: "text-blue-500" },
  "Asset Discovery": { icon: Server, color: "text-green-500" },
  "Compliance Event": { icon: ShieldCheck, color: "text-purple-500" },
};

// --- Main Playbooks Page ---
export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState(initialPlaybookData);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // 'All', 'Active', 'Inactive'

  // Memoized filtering for performance. The UI only re-renders when dependencies change.
  const filteredPlaybooks = useMemo(() => {
    return playbooks
      .filter((p) => {
        if (activeFilter === "Active") return p.status;
        if (activeFilter === "Inactive") return !p.status;
        return true;
      })
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [playbooks, searchTerm, activeFilter]);

  const handleStatusChange = (playbookId, newStatus) => {
    // In a real app, this would be an API call with optimistic UI update.
    setPlaybooks(
      playbooks.map((p) =>
        p.id === playbookId ? { ...p, status: newStatus } : p
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Response Playbooks
          </h1>
          <p className="mt-1 text-slate-500">
            Automate, audit, and manage your security response workflows.
          </p>
        </div>
        <Link href="/response/playbooks/new">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
            <Plus size={18} />
            Create Playbook
          </button>
        </Link>
      </div>

      {/* Controls: Search and Filter */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-lg">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search playbooks by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border-slate-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center p-1 bg-slate-100 rounded-lg">
          {["All", "Active", "Inactive"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={clsx(
                "px-3 py-1 rounded-md text-sm font-semibold transition-colors",
                activeFilter === filter
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}>
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Playbook Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlaybooks.length > 0 ? (
          filteredPlaybooks.map((playbook) => {
            const { icon: TriggerIcon, color } = triggerMap[
              playbook.trigger.type
            ] || { icon: Zap, color: "text-slate-500" };
            const totalRuns =
              playbook.runStats.success + playbook.runStats.failed;
            const successRate =
              totalRuns > 0
                ? (playbook.runStats.success / totalRuns) * 100
                : 100;

            return (
              <div
                key={playbook.id}
                className="group relative flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-500 hover:shadow-lg">
                <div className="p-6 flex-grow">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-lg bg-slate-100 p-3 ${color}`}>
                      <TriggerIcon size={24} />
                    </div>
                    <Switch
                      checked={playbook.status}
                      onChange={(newStatus) =>
                        handleStatusChange(playbook.id, newStatus)
                      }
                      className={clsx(
                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                        playbook.status ? "bg-blue-600" : "bg-slate-300"
                      )}>
                      <span className="sr-only">Use setting</span>
                      <span
                        className={clsx(
                          "inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          playbook.status ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </Switch>
                  </div>
                  <div className="mt-4">
                    <h2 className="font-semibold text-lg text-slate-800 group-hover:text-blue-600">
                      {playbook.name}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 h-10">
                      {playbook.description}
                    </p>
                    <p className="text-xs font-medium text-slate-600 mt-2">
                      Trigger:{" "}
                      <span className="font-semibold">
                        {playbook.trigger.value}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Footer with Audit & Metric Info */}
                <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 rounded-b-xl text-xs text-slate-600 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Success Rate</span>
                    <span
                      className={clsx(
                        "font-semibold",
                        successRate > 95 ? "text-green-600" : "text-amber-600"
                      )}>
                      {successRate.toFixed(1)}% ({totalRuns} runs)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Last Run</span>
                    <span>
                      {playbook.lastRun
                        ? new Date(playbook.lastRun).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Owner</span>
                    <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded">
                      {playbook.owner}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16">
            <Zap className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-semibold text-slate-800">
              No playbooks found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Your search or filter criteria did not match any playbooks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
