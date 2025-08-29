"use client";

import { useState, useMemo, Fragment } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Transition } from "@headlessui/react";
import {
  Loader2,
  HardDrive,
  MoreVertical,
  Trash2,
  Copy,
  AlertTriangle,
  Search,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import toast from "react-hot-toast";

// --- STYLES and CONFIG for STATUS ---
const STATUS_CLASSES = {
  Online: "bg-green-100 text-green-800",
  Offline: "bg-red-100 text-red-800",
  "Never Connected": "bg-gray-200 text-gray-700",
};

const STATUS_ICONS = {
  Online: CheckCircle,
  Offline: XCircle,
  "Never Connected": Clock,
};

// --- MAIN COMPONENT ---
export default function CatalystAgentDetailView({
  agents,
  isLoading, // This prop can be passed down if needed
  error, // This prop can be passed down if needed
  onDeleteInitiated,
  onUpdate,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });

  const processedAgents = useMemo(() => {
    let sortableAgents = [...agents];
    if (sortConfig.key) {
      sortableAgents.sort((a, b) => {
        const valA = a[sortConfig.key] || "";
        const valB = b[sortConfig.key] || "";
        if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableAgents.filter(
      (agent) =>
        (agent.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (agent.device_identifier?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        )
    );
  }, [agents, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} Copied!`);
  };

  const vitals = useMemo(
    () => ({
      total: agents.length,
      online: agents.filter((a) => a.status === "Online").length,
      offline: agents.filter((a) => a.status === "Offline").length,
      neverConnected: agents.filter((a) => a.status === "Never Connected")
        .length,
    }),
    [agents]
  );

  return (
    <main className="flex-1 h-full flex flex-col bg-slate-50/50">
      <header className="p-4 sm:p-6 border-b border-slate-200 flex-shrink-0 bg-white space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} /> Catalyst Agent Fleet
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Endpoint Management
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div
              className="flex items-center gap-2 text-slate-600"
              title="Total agents registered.">
              <span className="font-semibold text-slate-900">
                {vitals.total}
              </span>{" "}
              Total
            </div>
            <div
              className="flex items-center gap-2 text-slate-600"
              title="Agents currently sending heartbeats.">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="font-semibold text-slate-900">
                {vitals.online}
              </span>{" "}
              Online
            </div>
            <div
              className="flex items-center gap-2 text-slate-600"
              title="Agents that were online but have stopped sending heartbeats.">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="font-semibold text-slate-900">
                {vitals.offline}
              </span>{" "}
              Offline
            </div>
            <div
              className="flex items-center gap-2 text-slate-600"
              title="Agents that have been registered but have never connected.">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span className="font-semibold text-slate-900">
                {vitals.neverConnected}
              </span>{" "}
              Never Connected
            </div>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name or device ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-0 py-1.5 pl-9 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            />
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {processedAgents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-10 flex flex-col items-center">
              <div className="mx-auto p-4 mb-5 rounded-full bg-slate-100 text-slate-500 w-fit">
                <HardDrive size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">
                {searchTerm ? "No Matching Agents" : "No Agents Registered"}
              </h3>
              <p className="mt-2 text-slate-500">
                {searchTerm
                  ? "Clear your filter to see all agents."
                  : "Register your first agent to get started."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 lg:p-6">
              <div className="flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr>
                          {[
                            { key: "name", label: "Agent Name" },
                            {
                              key: "device_identifier",
                              label: "Device ID (MAC)",
                            },
                            { key: "status", label: "Status" },
                            { key: "last_seen_at", label: "Last Seen" },
                          ].map((col) => (
                            <th
                              key={col.key}
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-0 cursor-pointer hover:bg-slate-50"
                              onClick={() => requestSort(col.key)}>
                              <div className="flex items-center gap-2">
                                {col.label}
                                {sortConfig.key === col.key && (
                                  <ArrowUpDown
                                    size={14}
                                    className="text-slate-400"
                                  />
                                )}
                              </div>
                            </th>
                          ))}
                          <th
                            scope="col"
                            className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {processedAgents.map((agent) => {
                          const StatusIcon =
                            STATUS_ICONS[agent.status] || Clock;
                          return (
                            <tr key={agent.id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-0">
                                {agent.name}
                              </td>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-500 font-mono">
                                {agent.device_identifier || "—"}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                <span
                                  className={clsx(
                                    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
                                    STATUS_CLASSES[agent.status]
                                  )}>
                                  <StatusIcon size={12} /> {agent.status}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                {agent.last_seen_at
                                  ? formatDistanceToNow(
                                      new Date(agent.last_seen_at),
                                      { addSuffix: true }
                                    )
                                  : "Never"}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                <Menu
                                  as="div"
                                  className="relative inline-block text-left">
                                  <Menu.Button className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200/60">
                                    <MoreVertical size={16} />
                                  </Menu.Button>
                                  <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95">
                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                      <div className="py-1">
                                        <Menu.Item>
                                          <button
                                            onClick={() =>
                                              handleCopy(agent.id, "Agent ID")
                                            }
                                            className={
                                              "group flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                            }>
                                            <Copy className="mr-3 h-4 w-4 text-slate-500" />{" "}
                                            Copy Agent ID
                                          </button>
                                        </Menu.Item>
                                        <Menu.Item>
                                          <button
                                            onClick={() =>
                                              onDeleteInitiated(agent)
                                            }
                                            className={
                                              "group flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                            }>
                                            <Trash2 className="mr-3 h-4 w-4 text-red-500" />{" "}
                                            Delete Agent
                                          </button>
                                        </Menu.Item>
                                      </div>
                                    </Menu.Items>
                                  </Transition>
                                </Menu>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
