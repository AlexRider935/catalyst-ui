"use client";

import { useState, useEffect, Fragment, useCallback } from "react";
import {
  Zap,
  Plus,
  Search,
  Filter,
  ChevronsUpDown,
  Check,
  X,
  MoreVertical,
  FileClock,
  Edit,
  Trash2,
  RefreshCw,
  Hash,
  Globe,
  AtSign,
  Loader2,
} from "lucide-react";
import { Switch, Menu, Transition, Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import toast from "react-hot-toast";

// --- Reusable Components ---
const DashboardStatCard = ({ title, value, icon: Icon }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Icon className="h-6 w-6 text-slate-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  </div>
);

const StatusIndicator = ({ status }) => (
  <div className="flex items-center gap-2">
    <span
      className={clsx("h-2.5 w-2.5 rounded-full", {
        "bg-green-500": status === "Healthy",
        "bg-amber-500": status === "Stale",
        "bg-red-500": status === "Error",
        "bg-sky-500": status === "Info",
        "bg-slate-400": !status,
      })}
    />
    <span className="font-medium text-slate-700">{status || "Unknown"}</span>
  </div>
);

const ToggleSwitch = ({ enabled, onChange, isLoading }) => (
  <Switch
    checked={enabled}
    onChange={onChange}
    disabled={isLoading}
    className={clsx(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
      enabled ? "bg-blue-600" : "bg-slate-300",
      isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
    )}>
    <span
      className={clsx(
        "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
        enabled ? "translate-x-5" : "translate-x-0"
      )}
    />
    {isLoading && (
      <Loader2 className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin text-slate-500" />
    )}
  </Switch>
);

const AddFeedModal = ({ isOpen, onClose, onFeedAdded }) => {
  const [newFeed, setNewFeed] = useState({
    name: "",
    description: "",
    type: "OSINT",
    source_url: "",
    confidence: 80,
    update_interval_minutes: 60,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setNewFeed((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const promise = fetch("/api/threat-intel/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFeed),
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to add feed.");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Adding new feed...",
      success: () => {
        onFeedAdded();
        onClose();
        setNewFeed({
          name: "",
          description: "",
          type: "OSINT",
          source_url: "",
          confidence: 80,
          update_interval_minutes: 60,
        });
        return "Feed added successfully!";
      },
      error: (err) => err.message,
    });

    try {
      await promise;
    } catch (error) {
      /* Toast handles error */
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onClose}>
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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-slate-900">
                  Add New Threat Feed
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <input
                    name="name"
                    value={newFeed.name}
                    onChange={handleChange}
                    placeholder="Feed Name (e.g., Abuse.ch)"
                    required
                    className="w-full rounded-lg border-slate-300 text-sm"
                  />
                  <textarea
                    name="description"
                    value={newFeed.description}
                    onChange={handleChange}
                    placeholder="Description"
                    className="w-full rounded-lg border-slate-300 text-sm"
                  />
                  <input
                    name="source_url"
                    value={newFeed.source_url}
                    onChange={handleChange}
                    placeholder="Source URL (e.g., https://bazaar.abuse.ch/...)"
                    className="w-full rounded-lg border-slate-300 text-sm"
                  />
                  <select
                    name="type"
                    value={newFeed.type}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-300 text-sm">
                    <option>OSINT</option>
                    <option>Commercial</option>
                    <option>Internal</option>
                  </select>
                  <div className="flex gap-4">
                    <input
                      name="confidence"
                      type="number"
                      value={newFeed.confidence}
                      onChange={handleChange}
                      placeholder="Confidence (0-100)"
                      className="w-full rounded-lg border-slate-300 text-sm"
                    />
                    <input
                      name="update_interval_minutes"
                      type="number"
                      value={newFeed.update_interval_minutes}
                      onChange={handleChange}
                      placeholder="Update Interval (min)"
                      className="w-full rounded-lg border-slate-300 text-sm"
                    />
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isSubmitting ? "Adding..." : "Add Feed"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const FeedDetailPanel = ({ feedId, onClose }) => {
  const [feed, setFeed] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!feedId) return;
    setIsLoading(true);
    setFeed(null);
    const fetchFeedDetails = async () => {
      try {
        const res = await fetch(`/api/threat-intel/feeds/${feedId}`);
        if (!res.ok) throw new Error("Failed to fetch feed details.");
        const data = await res.json();
        setFeed(data);
      } catch (error) {
        toast.error(error.message);
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedDetails();
  }, [feedId, onClose]);

  return (
    <AnimatePresence>
      {feedId && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-20 border-l border-slate-200">
          <div className="flex h-full flex-col">
            <div className="flex-shrink-0 border-b border-slate-200 p-6">
              {isLoading || !feed ? (
                <div className="h-[42px] w-3/4 animate-pulse rounded-md bg-slate-200"></div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {feed.name}
                    </h2>
                    <p className="text-sm text-slate-500">{feed.description}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
            {isLoading || !feed ? (
              <div className="flex h-full items-center justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="flex-grow space-y-8 overflow-y-auto p-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Configuration
                  </h3>
                  <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex justify-between p-3 text-sm">
                      <span className="font-medium text-slate-500">
                        Update Interval
                      </span>
                      <span className="font-semibold text-slate-700">
                        {feed.update_interval_minutes} minutes
                      </span>
                    </div>
                    <div className="flex justify-between p-3 text-sm">
                      <span className="font-medium text-slate-500">
                        Source URL
                      </span>
                      <span className="font-semibold text-slate-700 font-mono">
                        {feed.source_url}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 text-sm">
                      <span className="font-medium text-slate-500">
                        Confidence Score
                      </span>
                      <span className="font-semibold text-slate-700">
                        {feed.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {feed.indicator_types &&
                  Object.keys(feed.indicator_types).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">
                        Indicator Breakdown
                      </h3>
                      <div className="flex gap-2 text-sm font-medium">
                        {feed.indicator_types.ip > 0 && (
                          <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                            <AtSign size={14} /> IPs (
                            {Math.round(feed.indicator_types.ip * 100)}%)
                          </span>
                        )}
                        {feed.indicator_types.domain > 0 && (
                          <span className="flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-sky-700">
                            <Globe size={14} /> Domains (
                            {Math.round(feed.indicator_types.domain * 100)}%)
                          </span>
                        )}
                        {feed.indicator_types.hash > 0 && (
                          <span className="flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-violet-700">
                            <Hash size={14} /> Hashes (
                            {Math.round(feed.indicator_types.hash * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Recent Activity
                  </h3>
                  <ul className="space-y-3">
                    {feed.activity_log.map((log, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="mt-1">
                          <StatusIndicator status={log.status} />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-700">{log.message}</p>
                          <p className="text-xs text-slate-400">{log.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Recent Matches (Live)
                  </h3>
                  {feed.recent_matches?.length > 0 ? (
                    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                      {feed.recent_matches.map((match, i) => (
                        <li key={i} className="p-3 text-sm">
                          <p className="font-semibold font-mono text-slate-800">
                            {match.indicator}
                          </p>
                          <p className="text-slate-500">
                            Matched{" "}
                            <span className="font-medium text-slate-600">
                              {match.event_type}
                            </span>{" "}
                            on agent{" "}
                            <span className="font-medium text-slate-600">
                              {match.agent}
                            </span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg">
                      No matches found from this feed yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main Page Component ---
export default function ThreatIntelFeedsPage() {
  const [feeds, setFeeds] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedId, setSelectedFeedId] = useState(null);
  const [togglingFeedId, setTogglingFeedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [feedsRes, statsRes] = await Promise.all([
        fetch("/api/threat-intel/feeds"),
        fetch("/api/threat-intel/stats"),
      ]);
      if (!feedsRes.ok || !statsRes.ok)
        throw new Error("Failed to fetch initial data.");
      const feedsData = await feedsRes.json();
      const statsData = await statsRes.json();
      setFeeds(feedsData);
      setStats(statsData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleStatus = async (feed, currentStatus) => {
    setTogglingFeedId(feed.id);
    setFeeds((currentFeeds) =>
      currentFeeds.map((f) =>
        f.id === feed.id ? { ...f, status: !currentStatus } : f
      )
    );
    try {
      const res = await fetch(`/api/threat-intel/feeds/${feed.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      toast.success(
        `Feed "${feed.name}" ${!currentStatus ? "enabled" : "disabled"}.`
      );
      await fetchData();
    } catch (error) {
      toast.error(error.message);
      setFeeds((currentFeeds) =>
        currentFeeds.map((f) =>
          f.id === feed.id ? { ...f, status: currentStatus } : f
        )
      );
    } finally {
      setTogglingFeedId(null);
    }
  };

  const handleForceRefresh = async (feed) => {
    const promise = fetch(`/api/threat-intel/feeds/${feed.id}/refresh`, {
      method: "POST",
    }).then((res) => {
      if (!res.ok) throw new Error("Refresh command failed.");
      return res.json();
    });

    toast.promise(promise, {
      loading: `Refreshing "${feed.name}"...`,
      success: "Feed refreshed successfully!",
      error: (err) => err.message,
    });

    try {
      await promise;
      await fetchData();
    } catch (error) {
      /* Toast handles error */
    }
  };

  const handleDeleteFeed = async (feed) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the feed "${feed.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    const promise = fetch(`/api/threat-intel/feeds/${feed.id}`, {
      method: "DELETE",
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to delete feed.");
      return res.json();
    });

    toast.promise(promise, {
      loading: `Deleting "${feed.name}"...`,
      success: "Feed deleted successfully.",
      error: (err) => err.message,
    });

    try {
      await promise;
      await fetchData();
    } catch (error) {
      /* Toast handles error */
    }
  };

  if (isLoading && !feeds.length) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Threat Intelligence Feeds
          </h1>
          <p className="mt-1 text-slate-500">
            Manage and monitor intelligence sources to enrich security event
            data.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
          <Plus size={18} /> Add Feed
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatCard
          title="Total Active Indicators"
          value={stats?.totalIndicators?.toLocaleString() ?? "..."}
          icon={Zap}
        />
        <DashboardStatCard
          title="Feeds Enabled"
          value={`${stats?.enabledFeeds ?? ".."} / ${
            stats?.totalFeeds ?? ".."
          }`}
          icon={Zap}
        />
        <DashboardStatCard
          title="Feeds with Errors"
          value={stats?.errorFeeds ?? "..."}
          icon={Zap}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Feed Name",
                "Health",
                "Confidence",
                "Indicators",
                "Last Updated",
                "Status",
                "",
              ].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {feeds.map((feed) => (
              <tr
                key={feed.id}
                onClick={() => setSelectedFeedId(feed.id)}
                className="hover:bg-slate-50 cursor-pointer">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-800">
                    {feed.name}
                  </div>
                  <div className="text-xs text-slate-500">{feed.type}</div>
                </td>
                <td className="px-6 py-4">
                  <StatusIndicator status={feed.health} />
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {feed.confidence}%
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {Number(feed.indicators).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {feed.last_updated_at
                    ? new Date(feed.last_updated_at).toLocaleString()
                    : "Never"}
                </td>
                <td className="px-6 py-4">
                  <div onClick={(e) => e.stopPropagation()}>
                    <ToggleSwitch
                      enabled={feed.status}
                      isLoading={togglingFeedId === feed.id}
                      onChange={() => handleToggleStatus(feed, feed.status)}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                      <MoreVertical size={18} />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95">
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleForceRefresh(feed);
                            }}
                            className="group flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100">
                            <RefreshCw size={14} /> Force Refresh
                          </button>
                        </Menu.Item>
                        <Menu.Item>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="group flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100">
                            <Edit size={14} /> Edit
                          </button>
                        </Menu.Item>
                        <Menu.Item>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFeed(feed);
                            }}
                            className="group flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 size={14} /> Delete
                          </button>
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedFeedId && (
          <FeedDetailPanel
            feedId={selectedFeedId}
            onClose={() => setSelectedFeedId(null)}
          />
        )}
      </AnimatePresence>

      <AddFeedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFeedAdded={fetchData}
      />
    </div>
  );
}
