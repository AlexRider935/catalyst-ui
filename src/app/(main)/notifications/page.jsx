"use client";

import React, { useState, useMemo } from "react";
import {
  Bell,
  Shield,
  Bug,
  MessageSquare,
  FileText,
  Search,
  Archive,
  CornerUpRight,
  Inbox,
  Check,
  X,
  Calendar,
  User,
  GitBranch,
} from "lucide-react";

// --- MOCK DATA (ENRICHED FOR DETAIL VIEW) ---
const allNotifications = [
  {
    id: 1,
    type: "alert",
    title: "Unusual login activity detected",
    details: "Login from new IP address (123.45.67.89) in Seoul, KR.",
    time: "2m ago",
    isNew: true,
    date: new Date(),
  },
  {
    id: 2,
    type: "vulnerability",
    title: "High-severity vulnerability found",
    details:
      "CVE-2025-12345 (Remote Code Execution) found on 3 endpoints: web-prod-01, web-prod-02, db-staging-01.",
    time: "1h ago",
    isNew: true,
    date: new Date(),
  },
  {
    id: 3,
    type: "mention",
    title: "Alex Rider mentioned you in Case #8421",
    details:
      '"@Director can you please review the attached logs and approve the escalation?"',
    time: "4h ago",
    isNew: false,
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: 4,
    type: "report",
    title: "Weekly compliance report is ready",
    details:
      "SOC 2 Type II compliance report for week ending Aug 15, 2025 is now available for download.",
    time: "1d ago",
    isNew: false,
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: 5,
    type: "alert",
    title: "Firewall rule modified",
    details:
      'Rule "Block-External-SSH" was modified by an administrator (admin@catalyst.io).',
    time: "2d ago",
    isNew: false,
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
  },
  {
    id: 6,
    type: "vulnerability",
    title: "Low-severity vulnerability found",
    details:
      'CVE-2025-67890 (Cross-Site Scripting) found on asset "dev-server-01".',
    time: "3d ago",
    isNew: false,
    date: new Date(new Date().setDate(new Date().getDate() - 3)),
  },
];

// --- SUB-COMPONENTS ---

const FilterButton = ({ text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
      active
        ? "bg-white text-slate-800 shadow-sm"
        : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
    }`}>
    {text}
  </button>
);

const NotificationIcon = ({ type }) => {
  switch (type) {
    case "alert":
      return <Shield className="text-red-500" size={20} />;
    case "vulnerability":
      return <Bug className="text-orange-500" size={20} />;
    case "mention":
      return <MessageSquare className="text-blue-500" size={20} />;
    case "report":
      return <FileText className="text-slate-500" size={20} />;
    default:
      return <Bell className="text-slate-500" size={20} />;
  }
};

const NotificationDetailView = ({ notification }) => {
  if (!notification) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 rounded-r-2xl">
        <Inbox size={48} className="text-slate-300" />
        <h3 className="mt-4 text-lg font-semibold text-slate-700">
          Select an item to view details
        </h3>
        <p className="mt-1 text-sm text-slate-500">Nothing selected</p>
      </div>
    );
  }

  return (
    <div className="bg-white h-full flex flex-col rounded-r-2xl border-l border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">
          {notification.title}
        </h2>
        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
          <Calendar size={14} />
          <span>{notification.time}</span>
        </div>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        <h4 className="font-semibold text-slate-800 mb-2">Details</h4>
        <p className="text-sm text-slate-600 leading-relaxed">
          {notification.details}
        </p>
        {notification.type === "vulnerability" && (
          <div className="mt-6 bg-slate-50 p-4 rounded-lg">
            <h5 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
              <GitBranch size={16} /> Affected Assets
            </h5>
            <ul className="text-xs text-slate-600 space-y-1">
              <li className="font-mono">web-prod-01</li>
              <li className="font-mono">web-prod-02</li>
              <li className="font-mono">db-staging-01</li>
            </ul>
          </div>
        )}
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
          <Check size={16} /> Mark as Resolved
        </button>
        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-200">
          <Archive size={16} />
        </button>
        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-200">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const filteredNotifications = useMemo(
    () =>
      allNotifications
        .filter((n) => filter === "All" || (filter === "Unread" && n.isNew))
        .filter((n) =>
          n.title.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [filter, searchTerm]
  );

  const groupedNotifications = useMemo(() => {
    const groups = { Today: [], Yesterday: [], Older: [] };
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(today).setDate(new Date(today).getDate() - 1);

    filteredNotifications.forEach((n) => {
      const nDate = new Date(n.date).setHours(0, 0, 0, 0);
      if (nDate === today) groups.Today.push(n);
      else if (nDate === yesterday) groups.Yesterday.push(n);
      else groups.Older.push(n);
    });
    return groups;
  }, [filteredNotifications]);

  const selectedNotification = useMemo(
    () => allNotifications.find((n) => n.id === selectedId),
    [selectedId]
  );

  return (
    <div className="h-full flex flex-col bg-slate-100 p-4 sm:p-6 rounded-2xl">
      {/* Page Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Inbox
          </h1>
          <p className="mt-1 text-slate-500">
            You have {allNotifications.filter((n) => n.isNew).length} unread
            notifications.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <div className="relative w-full sm:w-auto">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
          <button className="px-3 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50">
            Mark all as read
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left Column: List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-200">
            <div className="flex items-center gap-2 p-1">
              <FilterButton
                text="All"
                active={filter === "All"}
                onClick={() => setFilter("All")}
              />
              <FilterButton
                text="Unread"
                active={filter === "Unread"}
                onClick={() => setFilter("Unread")}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {Object.entries(groupedNotifications).map(
              ([groupName, notifications]) =>
                notifications.length > 0 && (
                  <div key={groupName} className="p-2">
                    <h3 className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase">
                      {groupName}
                    </h3>
                    <ul>
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          onClick={() => setSelectedId(n.id)}
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedId === n.id
                              ? "bg-blue-50"
                              : "hover:bg-slate-50"
                          }`}>
                          <div className="mt-0.5">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex-shrink-0 mt-0.5">
                            <NotificationIcon type={n.type} />
                          </div>
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                selectedId === n.id
                                  ? "text-slate-800"
                                  : "text-slate-700"
                              }`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500">{n.time}</p>
                          </div>
                          {n.isNew && (
                            <div className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </div>
        </div>

        {/* Right Column: Detail View */}
        <div className="hidden lg:block lg:col-span-2 overflow-hidden">
          <NotificationDetailView notification={selectedNotification} />
        </div>
      </div>
    </div>
  );
}
