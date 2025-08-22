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
  MoreHorizontal,
  Clock,
  UserCheck,
  Tag,
  Filter,
  ChevronDown,
  Link as LinkIcon,
  AlertTriangle,
  Info,
  ShieldCheck,
} from "lucide-react";

// Silas: The data model must reflect the complexity of a real security event.
// This is the new standard: severity, status, assignee, and a full audit trail are mandatory.
const mockUsers = ["Alex Rider", "Jane Shaw", "Ken Daniels", "Unassigned"];

const allNotifications = [
  {
    id: 1,
    type: "alert",
    severity: "Critical",
    status: "New",
    assignee: "Unassigned",
    title: "Unusual login activity detected",
    details:
      "Anomalous login from a new IP address (123.45.67.89) in Seoul, KR, targeting a privileged account 'root'. The attempt bypassed primary authentication but was blocked by MFA.",
    time: "2m ago",
    isNew: true,
    source: "Wazuh Agent (ID: 001)",
    tags: ["auth", "brute-force-attempt"],
    date: new Date(),
    auditTrail: [
      {
        user: "System",
        action: "Event detected and notification created.",
        timestamp: new Date(),
      },
    ],
  },
  {
    id: 2,
    type: "vulnerability",
    severity: "High",
    status: "Investigating",
    assignee: "Alex Rider",
    title: "High-severity vulnerability found",
    details:
      "CVE-2025-12345 (Remote Code Execution) has been detected on 3 production endpoints.",
    time: "1h ago",
    isNew: true,
    source: "Drata Monitor",
    tags: ["cve", "patch-required", "production"],
    date: new Date(),
    cveDetails: {
      id: "CVE-2025-12345",
      cvssScore: 9.8,
      link: "https://nvd.nist.gov/vuln/detail/CVE-2025-12345",
    },
    affectedAssets: ["web-prod-01", "web-prod-02", "db-staging-01"],
    auditTrail: [
      {
        user: "System",
        action: "Vulnerability scan completed. Notification created.",
        timestamp: new Date(new Date().setHours(new Date().getHours() - 1)),
      },
      {
        user: "Silas",
        action: "Assigned to Alex Rider.",
        timestamp: new Date(
          new Date().setMinutes(new Date().getMinutes() - 30)
        ),
      },
    ],
  },
  {
    id: 3,
    type: "mention",
    severity: "Info",
    status: "Resolved",
    assignee: "Director",
    title: "Alex Rider mentioned you in Case #8421",
    details:
      '"@Director can you please review the attached logs and approve the escalation? The issue has been contained and resolution steps are documented."',
    time: "4h ago",
    isNew: false,
    source: "Internal Case Mgmt",
    tags: ["review-required"],
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    auditTrail: [
      {
        user: "Alex Rider",
        action: "Mentioned Director.",
        timestamp: new Date(new Date().setHours(new Date().getHours() - 4)),
      },
      {
        user: "Director",
        action: "Marked as Resolved.",
        timestamp: new Date(new Date().setHours(new Date().getHours() - 2)),
      },
    ],
  },
  {
    id: 4,
    type: "report",
    severity: "Low",
    status: "Archived",
    assignee: "Jane Shaw",
    title: "Weekly compliance report is ready",
    details:
      "SOC 2 Type II compliance report for week ending Aug 15, 2025 is now available for download. All controls are passing.",
    time: "1d ago",
    isNew: false,
    source: "Drata Reporter",
    tags: ["compliance", "soc2"],
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    auditTrail: [
      {
        user: "System",
        action: "Report generated.",
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
      {
        user: "Jane Shaw",
        action: "Reviewed and archived.",
        timestamp: new Date(),
      },
    ],
  },
];

// --- ADVANCED SUB-COMPONENTS ---

const SeverityBadge = ({ severity }) => {
  const styles = {
    Critical: "bg-red-100 text-red-800 border-red-200",
    High: "bg-orange-100 text-orange-800 border-orange-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Low: "bg-sky-100 text-sky-800 border-sky-200",
    Info: "bg-slate-100 text-slate-800 border-slate-200",
  };
  return (
    <span
      className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
        styles[severity] || styles.Info
      }`}>
      {severity}
    </span>
  );
};

const StatusDropdown = ({ status, setStatus }) => {
  const styles = {
    New: "bg-blue-100 text-blue-800",
    Investigating: "bg-yellow-100 text-yellow-800",
    Resolved: "bg-green-100 text-green-800",
    Archived: "bg-slate-100 text-slate-800",
  };
  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className={`appearance-none text-sm font-semibold rounded-md pl-3 pr-8 py-1 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${styles[status]}`}>
        <option value="New">New</option>
        <option value="Investigating">Investigating</option>
        <option value="Resolved">Resolved</option>
        <option value="Archived">Archived</option>
      </select>
      <ChevronDown
        size={16}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
      />
    </div>
  );
};

const NotificationIcon = ({ type }) => {
  const icons = {
    alert: <Shield className="text-red-500" size={20} />,
    vulnerability: <Bug className="text-orange-500" size={20} />,
    mention: <MessageSquare className="text-blue-500" size={20} />,
    report: <FileText className="text-slate-500" size={20} />,
  };
  return icons[type] || <Bell className="text-slate-500" size={20} />;
};

const NotificationDetailView = ({ notification, onUpdate }) => {
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

  // Silas: Direct manipulation of state via callbacks is essential for an interactive console.
  const handleStatusChange = (newStatus) => {
    onUpdate(notification.id, { status: newStatus, isNew: false });
  };

  const handleAssigneeChange = (newAssignee) => {
    onUpdate(notification.id, { assignee: newAssignee });
  };

  return (
    <div className="bg-white h-full flex flex-col rounded-r-2xl border-l border-slate-200">
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <SeverityBadge severity={notification.severity} />
          <div className="flex items-center gap-2">
            <StatusDropdown
              status={notification.status}
              setStatus={handleStatusChange}
            />
            <button
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              title="More actions">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-3">
          {notification.title}
        </h2>
        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
          <Clock size={14} />
          <span>
            {notification.time} via {notification.source}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-sm">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-slate-500">
              ASSIGNEE
            </label>
            <select
              value={notification.assignee}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
              {mockUsers.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">TAGS</label>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {notification.tags?.map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <h4 className="font-semibold text-slate-800 mb-2">Details</h4>
        <p className="text-slate-600 leading-relaxed mb-6">
          {notification.details}
        </p>

        {notification.cveDetails && (
          <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h5 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
              <AlertTriangle size={16} /> Vulnerability Intel
            </h5>
            <p>
              <strong>ID:</strong> {notification.cveDetails.id}
            </p>
            <p>
              <strong>CVSS Score:</strong>{" "}
              <span className="font-bold text-red-600">
                {notification.cveDetails.cvssScore}
              </span>
            </p>
            <a
              href={notification.cveDetails.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1 mt-1">
              View on NVD <LinkIcon size={14} />
            </a>
          </div>
        )}

        {notification.affectedAssets && (
          <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h5 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
              <GitBranch size={16} /> Affected Assets
            </h5>
            <ul className="text-xs text-slate-600 space-y-1 font-mono">
              {notification.affectedAssets.map((asset) => (
                <li key={asset}>{asset}</li>
              ))}
            </ul>
          </div>
        )}

        <h4 className="font-semibold text-slate-800 mb-3">Activity</h4>
        <ul className="space-y-4 border-l-2 border-slate-200 ml-1">
          {notification.auditTrail.map((entry, index) => (
            <li key={index} className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-2 border-slate-300 rounded-full"></div>
              <p className="text-slate-700">{entry.action}</p>
              <p className="text-xs text-slate-500">
                {entry.user} - {entry.timestamp.toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          placeholder="Add a note..."
          className="flex-1 rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
        />
        <button className="px-3 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50">
          Comment
        </button>
      </div>
    </div>
  );
};

const NotificationListItem = ({ notification, isSelected, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
      isSelected
        ? "bg-blue-50 border-blue-500"
        : `border-transparent hover:bg-slate-50 ${
            notification.isNew ? "bg-slate-50/50" : ""
          }`
    }`}>
    <div className="flex-shrink-0 mt-0.5">
      <NotificationIcon type={notification.type} />
    </div>
    <div className="flex-1 overflow-hidden">
      <div className="flex items-center gap-2">
        <SeverityBadge severity={notification.severity} />
        <p className="text-sm font-semibold text-slate-800 truncate">
          {notification.title}
        </p>
      </div>
      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
        <div className="flex items-center gap-1.5" title="Assignee">
          <User size={12} /> {notification.assignee}
        </div>
        <div className="flex items-center gap-1.5" title="Time">
          <Clock size={12} /> {notification.time}
        </div>
      </div>
    </div>
    {notification.isNew && (
      <div
        className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
        title="Unread"
      />
    )}
  </li>
);

// --- MAIN PAGE COMPONENT ---

export default function SecurityInboxPage() {
  const [notifications, setNotifications] = useState(allNotifications);
  const [filters, setFilters] = useState({
    severity: "All",
    status: "All",
    searchTerm: "",
  });
  const [selectedId, setSelectedId] = useState(2);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const handleUpdateNotification = (id, updates) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((n) =>
        n.id === id
          ? {
              ...n,
              ...updates,
              auditTrail: [
                ...n.auditTrail,
                {
                  user: "Director",
                  action: `Updated status to ${updates.status || n.status}.`,
                  timestamp: new Date(),
                },
              ],
            }
          : n
      )
    );
  };

  const filteredNotifications = useMemo(
    () =>
      notifications
        .filter(
          (n) => filters.severity === "All" || n.severity === filters.severity
        )
        .filter((n) => filters.status === "All" || n.status === filters.status)
        .filter((n) =>
          n.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
        ),
    [notifications, filters]
  );

  const selectedNotification = useMemo(
    () => notifications.find((n) => n.id === selectedId),
    [selectedId, notifications]
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(new Set(filteredNotifications.map((n) => n.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 p-4 sm:p-6 rounded-2xl">
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Security Inbox
          </h1>
          <p className="mt-1 text-slate-500">
            {notifications.filter((n) => n.isNew).length} unread events.{" "}
            {selectedItems.size > 0 ? `${selectedItems.size} selected.` : ""}
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Silas: Filters are instruments. They must be precise and readily available. */}
          <div className="p-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, searchTerm: e.target.value }))
                  }
                  className="w-full rounded-lg border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
              <select
                onChange={(e) =>
                  setFilters((f) => ({ ...f, severity: e.target.value }))
                }
                className="rounded-lg border-slate-200 text-sm py-1.5">
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
                className="rounded-lg border-slate-200 text-sm py-1.5">
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Investigating">Investigating</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Silas: Bulk actions are mandatory for an efficient workflow. */}
            <div className="flex items-center p-3 border-b border-slate-200">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  selectedItems.size === filteredNotifications.length &&
                  filteredNotifications.length > 0
                }
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-4"
              />
              {selectedItems.size > 0 ? (
                <div className="flex items-center gap-2">
                  <button className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200">
                    Resolve
                  </button>
                  <button className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200">
                    Archive
                  </button>
                  <button className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200">
                    Assign...
                  </button>
                </div>
              ) : (
                <span className="text-sm text-slate-500">
                  Select items for bulk actions
                </span>
              )}
            </div>

            <ul className="p-2 space-y-1">
              {filteredNotifications.map((n) => (
                <div key={n.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(n.id)}
                    onChange={() => handleSelectItem(n.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mx-2"
                  />
                  <div className="flex-1">
                    <NotificationListItem
                      notification={n}
                      isSelected={selectedId === n.id}
                      onClick={() => setSelectedId(n.id)}
                    />
                  </div>
                </div>
              ))}
            </ul>
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-2 overflow-hidden">
          <NotificationDetailView
            notification={selectedNotification}
            onUpdate={handleUpdateNotification}
          />
        </div>
      </div>
    </div>
  );
}
