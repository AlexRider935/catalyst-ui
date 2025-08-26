"use client";

import { useState, Fragment, useEffect } from "react";
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
  ChevronLeft,
  ChevronsLeft,
  Plus,
  Download,
  X,
  AlertTriangle,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import clsx from "clsx";
import { format, formatDistanceToNow } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

// --- MOCK DATA (Schema will be replaced with an API call later) ---
const mockSchema = {
  raw_events: ["received_at", "hostname", "data"],
};

// --- Reusable Components ---
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
                      <button
                        type="button"
                        className="rounded-md bg-slate-50 text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-800"
                        onClick={onClose}>
                        <X className="h-6 w-6" aria-hidden="true" />
                      </button>
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

const SaveQueryPanel = ({ query, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name) {
      toast.error("Query name is required.");
      return;
    }
    onSave({ name, description, query_string: query });
  };

  return (
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
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
          Save Query
        </button>
      </div>
    </div>
  );
};

// --- Main Data Lake Page ---
export default function DataLakePage() {
  const [activeTab, setActiveTab] = useState("explorer");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("Schema");

  const [query, setQuery] = useState("");
  const [timeRange, setTimeRange] = useState("24h");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedQueries, setSavedQueries] = useState([]);
  const [queryHistory, setQueryHistory] = useState([]);

  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);

  const SidebarIcon = sidebarCollapsed ? ChevronsLeft : ChevronLeft;

  const fetchSavedQueries = async () => {
    try {
      const response = await fetch("/api/datalake/saved-queries");
      if (!response.ok) throw new Error("Failed to fetch saved queries");
      const data = await response.json();
      setSavedQueries(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchQueryHistory = async () => {
    try {
      const response = await fetch("/api/datalake/query-history");
      if (!response.ok) throw new Error("Failed to fetch query history");
      const data = await response.json();
      setQueryHistory(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRunQuery = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/datalake/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, timeRange }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "An unknown error occurred.");
      setResults(data);
      fetchQueryHistory(); // Refresh history after a query is run
    } catch (err) {
      setError(err.message);
      setResults([]);
      fetchQueryHistory(); // Still refresh history even on failure
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuery = async (queryData) => {
    const promise = fetch("/api/datalake/saved-queries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryData),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save.");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Saving query...",
      success: (newQuery) => {
        fetchSavedQueries();
        setIsSavePanelOpen(false);
        return `Query "${newQuery.name}" saved!`;
      },
      error: (err) => err.toString(),
    });
  };

  useEffect(() => {
    handleRunQuery();
    fetchSavedQueries();
    fetchQueryHistory();
  }, []);

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
      <Toaster position="bottom-right" />
      <SlideOverPanel
        isOpen={isSavePanelOpen}
        onClose={() => setIsSavePanelOpen(false)}
        title="Save Query">
        <SaveQueryPanel
          query={query}
          onClose={() => setIsSavePanelOpen(false)}
          onSave={handleSaveQuery}
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
                      <>
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
                        <div className="flex-1 overflow-y-auto p-3 text-sm">
                          {sidebarTab === "Schema" && (
                            <ul className="space-y-1">
                              {Object.entries(mockSchema).map(
                                ([table, fields]) => (
                                  <li key={table}>
                                    <p className="font-bold text-slate-800">
                                      {table}
                                    </p>
                                    <ul className="pl-4 space-y-1 mt-1">
                                      {fields.map((field) => (
                                        <li
                                          key={field}
                                          className="text-slate-600 font-mono text-xs">
                                          {field}
                                        </li>
                                      ))}
                                    </ul>
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                          {sidebarTab === "Saved" && (
                            <ul className="space-y-1">
                              {savedQueries.length > 0 ? (
                                savedQueries.map((q) => (
                                  <li
                                    key={q.id}
                                    className="group p-2 rounded-md hover:bg-slate-200/50 cursor-pointer"
                                    onClick={() => setQuery(q.query_string)}>
                                    <p className="font-medium text-slate-800 truncate">
                                      {q.name}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                      {q.query_string}
                                    </p>
                                  </li>
                                ))
                              ) : (
                                <p className="text-slate-500 text-center text-xs p-4">
                                  No saved queries.
                                </p>
                              )}
                            </ul>
                          )}
                          {sidebarTab === "History" && (
                            <ul className="space-y-1">
                              {queryHistory.length > 0 ? (
                                queryHistory.map((h) => (
                                  <li
                                    key={h.id}
                                    className="group p-2 rounded-md hover:bg-slate-200/50 cursor-pointer"
                                    onClick={() => setQuery(h.query_string)}>
                                    <div className="flex items-center justify-between">
                                      <p className="font-mono text-xs text-slate-700 truncate">
                                        {h.query_string || "No query text"}
                                      </p>
                                      {h.status === "Success" ? (
                                        <CheckCircle
                                          size={14}
                                          className="text-green-500 flex-shrink-0"
                                        />
                                      ) : (
                                        <XCircle
                                          size={14}
                                          className="text-red-500 flex-shrink-0"
                                        />
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                      {formatDistanceToNow(
                                        new Date(h.executed_at),
                                        { addSuffix: true }
                                      )}
                                    </p>
                                  </li>
                                ))
                              ) : (
                                <p className="text-slate-500 text-center text-xs p-4">
                                  No query history.
                                </p>
                              )}
                            </ul>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {/* --- Main Content: Editor + Results --- */}
                  <div className="flex flex-col flex-1 h-full p-6 gap-6">
                    <div className="flex-shrink-0 rounded-xl border border-slate-200/80 bg-white">
                      <div className="p-2">
                        <textarea
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="w-full h-28 p-4 font-mono text-sm bg-slate-900 text-green-400 rounded-lg border-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="e.g., hostname = 'prod-web-01'"
                        />
                      </div>
                      <div className="p-3 border-t border-slate-200 bg-slate-50/70 rounded-b-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="rounded-lg border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-blue-500">
                            <option value="24h">Last 24 hours</option>
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                          </select>
                          <button
                            onClick={() => setIsSavePanelOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Star size={16} /> Save Query
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleRunQuery}
                          disabled={isLoading}
                          className="inline-flex items-center justify-center gap-2 w-32 rounded-lg border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60">
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <Play size={16} /> Run Query
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex-shrink-0 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800">
                          Results
                        </h3>
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
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm h-full flex flex-col">
                          <div className="p-3 text-xs text-slate-500 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                            Showing {results.length} results.
                          </div>
                          <div className="overflow-auto flex-1">
                            {isLoading ? (
                              <div className="flex items-center justify-center h-full text-slate-500">
                                <Loader2 className="h-6 w-6 animate-spin" />
                              </div>
                            ) : error ? (
                              <div className="flex flex-col items-center justify-center h-full text-red-600 p-4">
                                <AlertTriangle className="h-8 w-8 mb-2" />
                                <span className="font-semibold">
                                  Query Failed
                                </span>
                                <p className="text-sm">{error}</p>
                              </div>
                            ) : results.length === 0 ? (
                              <div className="flex items-center justify-center h-full text-slate-500">
                                No results found for this query.
                              </div>
                            ) : (
                              <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-slate-100 z-10">
                                  <tr>
                                    <th className="p-3 text-left font-semibold text-slate-700">
                                      Timestamp
                                    </th>
                                    <th className="p-3 text-left font-semibold text-slate-700">
                                      Hostname
                                    </th>
                                    <th className="p-3 text-left font-semibold text-slate-700">
                                      Data
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {results.map((row) => (
                                    <tr
                                      key={row.id}
                                      className="hover:bg-slate-50">
                                      <td
                                        className="p-3 whitespace-nowrap font-mono text-xs"
                                        title={new Date(
                                          row.received_at
                                        ).toISOString()}>
                                        {format(
                                          new Date(row.received_at),
                                          "MMM dd, yyyy HH:mm:ss.SSS"
                                        )}
                                      </td>
                                      <td className="p-3 whitespace-nowrap font-mono text-xs">
                                        {row.hostname}
                                      </td>
                                      <td className="p-3 font-mono text-xs w-full">
                                        <pre className="whitespace-pre-wrap break-all">
                                          <code>
                                            {JSON.stringify(row.data, null, 2)}
                                          </code>
                                        </pre>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "dashboards" && <DashboardView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
