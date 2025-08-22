"use client";

import { useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import {
  Database,
  Play,
  Clock,
  BarChart2,
  List,
  Search,
  Star,
  History,
  HardDrive,
  Table,
  ChevronLeft,
  ChevronsLeft,
  Plus,
  Download,
  X,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import clsx from "clsx";

// --- MOCK DATA ---
const mockSchema = {
  wazuh_alerts: ["timestamp", "rule.id", "rule.level"],
  firewall_logs: ["timestamp", "source_ip", "dest_ip", "action"],
  cloudtrail_logs: ["eventTime", "eventName", "userIdentity.type"],
};
const mockSavedQueries = [
  {
    id: "sq-1",
    name: "Privileged User Logins",
    query: "source.type='cloudtrail' AND eventName='ConsoleLogin'",
  },
  {
    id: "sq-2",
    name: "Denied Outbound DNS",
    query: "source.type='firewall' AND action='DENY'",
  },
];
const mockHistory = [
  {
    ts: "5m ago",
    query: "source.type = 'firewall' | STATS count() BY dest_ip",
  },
  { ts: "22m ago", query: "source.type = 'wazuh_alerts' AND rule.level >= 12" },
];
const queryResults = [
  {
    timestamp: "2025-08-22 00:10:10",
    source_ip: "10.0.1.5",
    dest_ip: "1.1.1.1",
    action: "DENY",
  },
  {
    timestamp: "2025-08-22 00:10:15",
    source_ip: "192.168.1.102",
    dest_ip: "8.8.4.4",
    action: "ALLOW",
  },
];

// --- Reusable Slide-Over Panel Component ---
const SlideOverPanel = ({ isOpen, onClose, title, children }) => (
  <Transition.Root show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-in-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in-out duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0">
        <div className="fixed inset-0 bg-black/30" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300 sm:duration-400"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300 sm:duration-400"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full">
              <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  <div className="bg-slate-50 px-4 py-4 sm:px-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="text-base font-semibold leading-6 text-slate-900">
                        {title}
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="rounded-md bg-slate-50 text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-800"
                          onClick={onClose}>
                          <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex-1 px-4 sm:px-6">{children}</div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </div>
    </Dialog>
  </Transition.Root>
);

// --- Save Query Panel Content ---
const SaveQueryPanel = ({ query, onClose }) => (
  <div className="py-6 space-y-6">
    <div>
      <label
        htmlFor="queryName"
        className="block text-sm font-medium text-slate-700">
        Query Name
      </label>
      <input
        type="text"
        name="queryName"
        id="queryName"
        placeholder="e.g., Failed Privileged Logins"
        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label
        htmlFor="description"
        className="block text-sm font-medium text-slate-700">
        Description
      </label>
      <textarea
        name="description"
        id="description"
        rows={3}
        placeholder="A brief description of what this query does."
        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
    </div>
    <div className="font-mono text-xs bg-slate-100 p-3 rounded-md text-slate-600 border border-slate-200 whitespace-pre-wrap">
      {query}
    </div>
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
        Cancel
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
        Save Query
      </button>
    </div>
  </div>
);

// --- Delete Confirmation Modal ---
const DeleteConfirmationModal = ({ name, isOpen, onClose, onDelete }) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0">
        <div className="fixed inset-0 bg-black/30" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle
                    className="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-base font-semibold leading-6 text-slate-900">
                    Delete Saved Query
                  </Dialog.Title>
                  <p className="mt-2 text-sm text-slate-500">
                    Are you sure you want to delete{" "}
                    <span className="font-bold text-slate-700">{name}</span>?
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                  onClick={onDelete}>
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto"
                  onClick={onClose}>
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

// --- Main Data Lake Page ---
export default function DataLakePage() {
  const [activeTab, setActiveTab] = useState("explorer");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("Schema");
  const [query, setQuery] = useState(
    "source.type = 'firewall' AND action = 'DENY'\n| STATS count() BY dest_ip"
  );
  const [resultsTab, setResultsTab] = useState("Table");
  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState(null);

  const SidebarIcon = sidebarCollapsed ? ChevronsLeft : ChevronLeft;

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={clsx(
        "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none",
        activeTab === id
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
      )}>
      {label}
    </button>
  );

  return (
    <>
      <DeleteConfirmationModal
        isOpen={!!queryToDelete}
        onClose={() => setQueryToDelete(null)}
        onDelete={() => setQueryToDelete(null)}
        name={queryToDelete?.name}
      />
      <SlideOverPanel
        isOpen={isSavePanelOpen}
        onClose={() => setIsSavePanelOpen(false)}
        title="Save Query">
        <SaveQueryPanel
          query={query}
          onClose={() => setIsSavePanelOpen(false)}
        />
      </SlideOverPanel>

      <div className="flex flex-col h-full space-y-6">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-bold text-slate-800">Data Lake</h1>
          <p className="mt-1 text-slate-500">
            Explore raw data, build dashboards, and manage detection logic.
          </p>
        </div>

        <div className="flex-shrink-0 border-b border-slate-200">
          <nav className="-mb-px flex space-x-6">
            <TabButton id="explorer" label="Explorer" />
            <TabButton id="dashboards" label="Dashboards" />
          </nav>
        </div>

        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full">
              {activeTab === "explorer" && (
                <div className="flex h-full rounded-xl shadow-sm border border-slate-200/80 bg-white overflow-hidden">
                  {/* --- Explorer Sidebar --- */}
                  <div
                    className={clsx(
                      "flex flex-col bg-slate-50/75 border-r border-slate-200 transition-all duration-300",
                      sidebarCollapsed ? "w-12" : "w-80"
                    )}>
                    <div className="flex-shrink-0 p-2 border-b border-slate-200 flex items-center justify-between">
                      {!sidebarCollapsed && (
                        <h2 className="text-sm font-semibold text-slate-800 px-2">
                          Explorer
                        </h2>
                      )}
                      <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800">
                        <SidebarIcon size={16} />
                      </button>
                    </div>
                    {!sidebarCollapsed && (
                      <div className="p-2 border-b border-slate-200">
                        <div className="flex items-center gap-1 rounded-lg bg-slate-200/50 p-1">
                          <button
                            onClick={() => setSidebarTab("Schema")}
                            className={clsx(
                              "flex-1 flex justify-center items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold",
                              sidebarTab === "Schema"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-600"
                            )}>
                            <HardDrive size={14} /> Schema
                          </button>
                          <button
                            onClick={() => setSidebarTab("Saved")}
                            className={clsx(
                              "flex-1 flex justify-center items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold",
                              sidebarTab === "Saved"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-600"
                            )}>
                            <Star size={14} /> Saved
                          </button>
                          <button
                            onClick={() => setSidebarTab("History")}
                            className={clsx(
                              "flex-1 flex justify-center items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold",
                              sidebarTab === "History"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-600"
                            )}>
                            <History size={14} /> History
                          </button>
                        </div>
                      </div>
                    )}
                    {!sidebarCollapsed && (
                      <div className="flex-1 overflow-y-auto p-3 text-sm">
                        {sidebarTab === "Saved" && (
                          <ul className="space-y-1">
                            {mockSavedQueries.map((q) => (
                              <li
                                key={q.id}
                                className="group p-2 rounded-md hover:bg-slate-200/50 cursor-pointer flex justify-between items-center">
                                <div className="truncate">
                                  <p className="font-medium text-slate-800 truncate">
                                    {q.name}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate">
                                    {q.query}
                                  </p>
                                </div>
                                <button
                                  onClick={() => setQueryToDelete(q)}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50">
                                  <Trash2 size={14} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        {/* Other sidebar tabs here */}
                      </div>
                    )}
                  </div>
                  {/* --- Main Content: Editor + Results --- */}
                  <div className="flex flex-col flex-1 h-full p-6 gap-6">
                    <div className="flex-shrink-0 rounded-xl border border-slate-200/80 bg-white">
                      <div className="p-2">
                        <textarea
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="w-full h-28 p-4 font-mono text-sm bg-slate-900 text-green-400 rounded-lg border-slate-700 focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      <div className="p-3 border-t border-slate-200 bg-slate-50/70 rounded-b-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Clock size={16} /> Last 24 hours
                          </button>
                          <button
                            onClick={() => setIsSavePanelOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Star size={16} /> Save Query
                          </button>
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                          <Play size={16} /> Run Query
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex-shrink-0 flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
                          <button
                            onClick={() => setResultsTab("Table")}
                            className={clsx(
                              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold",
                              resultsTab === "Table"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-600"
                            )}>
                            <List size={16} /> Table
                          </button>
                          <button
                            onClick={() => setResultsTab("Visualization")}
                            className={clsx(
                              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold",
                              resultsTab === "Visualization"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-600"
                            )}>
                            <BarChart2 size={16} /> Visualization
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Download size={16} /> Export CSV
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Plus size={16} /> Create Rule
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto mt-4">
                        {resultsTab === "Table" && (
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm h-full">
                            <div className="p-3 text-xs text-slate-500 border-b border-slate-200 bg-slate-50">
                              Showing {queryResults.length} results.
                            </div>
                            <table className="w-full text-sm">...</table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "dashboards" && (
                <div className="flex items-center justify-center h-full text-slate-500 text-center">
                  <div>
                    <Database size={48} className="mx-auto text-slate-300" />
                    <h2 className="mt-4 text-lg font-semibold text-slate-700">
                      Dashboard View
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      A configurable dashboard of visualizations would render
                      here.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
