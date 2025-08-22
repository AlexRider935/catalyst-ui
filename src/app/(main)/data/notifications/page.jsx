"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  AlertTriangle,
  Trash2,
  Settings,
  TestTube2,
  Copy,
  Zap,
  Clock,
  ShieldAlert,
  GitBranch,
  Bell,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import clsx from "clsx";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Mail, Webhook } from "lucide-react";

// --- Silas: Standardize icon mapping across the application. ---
const RULE_SOURCE_ICONS = {
  "Detection Engine": ShieldAlert,
  "Vulnerability Scanner": GitBranch,
  "Compliance Monitor": ShieldAlert,
  Scheduler: Clock,
  Default: Bell,
};

const ACTION_ICONS = {
  Slack: { icon: MessageSquare, color: "text-slate-500" },
  Email: { icon: Mail, color: "text-slate-500" },
  Webhook: { icon: Webhook, color: "text-slate-500" },
};

// --- Mock Data (unchanged) ---
const notificationRulesData = [
  {
    id: "nr-1",
    name: "Notify SOC on Critical Security Events",
    description: "Triggers on any detection rule with 'Critical' severity.",
    status: true,
    trigger: {
      source: "Detection Engine",
      conditions: [{ field: "severity", operator: "is", value: "Critical" }],
    },
    actions: [
      { type: "Slack", target: "#soc-alerts" },
      { type: "Webhook", target: "SIEM Ingest URL" },
    ],
    tags: ["soc", "critical-severity", "threat-intel"],
    lastTriggered: "2025-08-21T10:30:00Z",
    triggerCount: 142,
  },
  {
    id: "nr-2",
    name: "Email CISO on High Severity Vulnerability",
    description: "Triggers when a new CVE with a CVSS score > 7.0 is found.",
    status: true,
    trigger: {
      source: "Vulnerability Scanner",
      conditions: [{ field: "cvss_score", operator: ">", value: "7.0" }],
    },
    actions: [{ type: "Email", target: "ciso@thecatalyst.io" }],
    tags: ["vulnerability", "reporting", "ciso"],
    lastTriggered: "2025-08-20T14:00:00Z",
    triggerCount: 12,
  },
  {
    id: "nr-3",
    name: "Notify Compliance on PCI Failures",
    description:
      "Triggers when any control mapped to PCI-DSS enters a failed state.",
    status: true,
    trigger: {
      source: "Compliance Monitor",
      conditions: [
        { field: "framework", operator: "is", value: "PCI-DSS" },
        { field: "status", operator: "is", value: "Violation" },
      ],
    },
    actions: [{ type: "Slack", target: "#compliance-violations" }],
    tags: ["compliance", "pci-dss"],
    lastTriggered: "2025-08-19T09:12:00Z",
    triggerCount: 4,
  },
  {
    id: "nr-4",
    name: "Weekly Security Summary",
    description:
      "Provides a summary of all high and critical events every Friday.",
    status: false,
    trigger: {
      source: "Scheduler",
      conditions: [{ field: "cron", operator: "is", value: "0 17 * * 5" }],
    },
    actions: [{ type: "Email", target: "security-team@thecatalyst.io" }],
    tags: ["reporting", "summary"],
    lastTriggered: "2025-08-15T17:00:00Z",
    triggerCount: 52,
  },
];

// --- Delete Confirmation Modal (Standardized) ---
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, ruleName }) {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[10000]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
          <div className="flex items-start gap-4">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle
                className="h-6 w-6 text-red-600"
                aria-hidden="true"
              />
            </div>
            <div className="mt-0 flex-1">
              <h3 className="text-lg font-semibold leading-6 text-slate-900">
                Delete Notification Rule
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Are you sure you want to delete the{" "}
                <span className="font-bold text-slate-700">{ruleName}</span>{" "}
                rule? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
              onClick={onConfirm}>
              Delete Rule
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// --- Portal-based Actions Menu (Standardized) ---
function ActionsMenu({
  anchorRect,
  onClose,
  onTest,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    transformOrigin: "top right",
  });

  useLayoutEffect(() => {
    if (!anchorRect) return;
    const GAP = 8;
    const width = 240;
    const height = 180;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = anchorRect.bottom + GAP;
    let left = anchorRect.right - width;
    if (top + height > vh) {
      top = Math.max(8, anchorRect.top - GAP - height);
      setPos((p) => ({ ...p, transformOrigin: "bottom right" }));
    } else {
      setPos((p) => ({ ...p, transformOrigin: "top right" }));
    }
    if (left < 8) left = Math.max(8, anchorRect.left);
    setPos((p) => ({ ...p, top, left }));
  }, [anchorRect]);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!menuRef.current.contains(e.target)) onClose?.();
    };
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      style={{
        top: pos.top,
        left: pos.left,
        transformOrigin: pos.transformOrigin,
      }}
      className="fixed z-[9999] w-60 select-none rounded-md border border-slate-200 bg-white p-1 shadow-xl">
      <button
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100"
        onClick={() => {
          onTest?.();
          onClose?.();
        }}>
        <TestTube2 size={16} /> Test Rule
      </button>
      <button
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100"
        onClick={() => {
          onEdit?.();
          onClose?.();
        }}>
        <Settings size={16} /> Edit Rule
      </button>
      <button
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100"
        onClick={() => {
          onDuplicate?.();
          onClose?.();
        }}>
        <Copy size={16} /> Duplicate Rule
      </button>
      <div className="my-1 h-px w-full bg-slate-200" />
      <button
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        onClick={() => {
          onDelete?.();
          onClose?.();
        }}>
        <Trash2 size={16} /> Delete Rule
      </button>
    </div>,
    document.body
  );
}

// --- Main Notification Rules Page ---
export default function NotificationRulesPage() {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRules, setSelectedRules] = useState(new Set());
  const [ruleToDelete, setRuleToDelete] = useState(null);

  // Actions menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchorRect, setMenuAnchorRect] = useState(null);
  const [menuRule, setMenuRule] = useState(null);

  // Silas: Simulate API fetch to align with standard page structure.
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setRules(notificationRulesData);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = () => {
    if (!ruleToDelete) return;
    setRules(rules.filter((r) => r.id !== ruleToDelete.id));
    setRuleToDelete(null);
  };

  const filteredRules = rules
    .filter(
      (r) =>
        statusFilter === "All" ||
        (statusFilter === "Enabled" && r.status) ||
        (statusFilter === "Disabled" && !r.status)
    )
    .filter((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const openActionsMenu = (e, rule) => {
    e.stopPropagation(); // Prevent row selection when opening menu
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuAnchorRect(rect);
    setMenuRule(rule);
    setMenuOpen(true);
  };

  const handleSelectRow = (ruleId) => {
    const newSelection = new Set(selectedRules);
    if (newSelection.has(ruleId)) newSelection.delete(ruleId);
    else newSelection.add(ruleId);
    setSelectedRules(newSelection);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked)
      setSelectedRules(new Set(filteredRules.map((r) => r.id)));
    else setSelectedRules(new Set());
  };

  return (
    <>
      <DeleteConfirmationModal
        isOpen={!!ruleToDelete}
        onClose={() => setRuleToDelete(null)}
        onConfirm={handleDelete}
        ruleName={ruleToDelete?.name}
      />
      {menuOpen && (
        <ActionsMenu
          anchorRect={menuAnchorRect}
          onClose={() => setMenuOpen(false)}
          onEdit={() => {}}
          onTest={() => {}}
          onDuplicate={() => {}}
          onDelete={() => setRuleToDelete(menuRule)}
        />
      )}

      <div className="space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Notification Rules
            </h1>
            <p className="mt-1 text-slate-500">
              Automate alerts and actions based on platform events.
            </p>
          </div>
          <Link href="/data/notifications/new">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              <Plus size={18} /> New Rule
            </button>
          </Link>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search rules by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border-slate-300 pl-10 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
            {["All", "Enabled", "Disabled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                  statusFilter === status
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-600 hover:bg-white/50"
                )}>
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <div className="flex h-full flex-col rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <AnimatePresence>
              {selectedRules.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0">
                  <div className="flex items-center gap-4 bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2">
                    <p className="text-sm font-medium text-slate-700">
                      {selectedRules.size} selected
                    </p>
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                      Enable
                    </button>
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                      Disable
                    </button>
                    <button className="text-sm font-semibold text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left w-12 sm:pl-6">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          filteredRules.length > 0 &&
                          selectedRules.size === filteredRules.length
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-3 pr-3 text-left text-sm font-semibold text-slate-900">
                      Rule
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Last Triggered
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-6 text-center text-slate-500">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </td>
                    </tr>
                  ) : filteredRules.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-6 text-center text-slate-500">
                        No rules found.
                      </td>
                    </tr>
                  ) : (
                    filteredRules.map((rule) => {
                      const Icon =
                        RULE_SOURCE_ICONS[rule.trigger.source] ||
                        RULE_SOURCE_ICONS.Default;
                      const isSelected = selectedRules.has(rule.id);
                      return (
                        <tr
                          key={rule.id}
                          onClick={() => handleSelectRow(rule.id)}
                          className={clsx(
                            "cursor-pointer",
                            isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                          )}>
                          <td className="py-4 pl-4 pr-3 sm:pl-6">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                            <div className="flex items-center">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                <Icon className="h-5 w-5 text-slate-600" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-slate-900">
                                  {rule.name}
                                </div>
                                <div className="text-slate-500">
                                  {rule.trigger.source}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                            <div
                              className={clsx(
                                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                                rule.status
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-700"
                              )}>
                              {rule.status ? (
                                <ToggleRight size={14} />
                              ) : (
                                <ToggleLeft size={14} />
                              )}{" "}
                              {rule.status ? "Enabled" : "Disabled"}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                            <div className="flex items-center space-x-2">
                              {rule.actions.map((action, i) => {
                                const AIcon = ACTION_ICONS[action.type];
                                return AIcon ? (
                                  <AIcon.icon
                                    key={i}
                                    className={AIcon.color}
                                    size={18}
                                    title={`${action.type}: ${action.target}`}
                                  />
                                ) : null;
                              })}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                            <div
                              className="flex items-center gap-1.5"
                              title="Last Triggered">
                              <Clock size={14} />
                              {new Date(
                                rule.lastTriggered
                              ).toLocaleDateString()}
                            </div>
                            <div
                              className="flex items-center gap-1.5 mt-1 text-slate-400"
                              title="Trigger Count">
                              <Zap size={14} />
                              {rule.triggerCount} executions
                            </div>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              type="button"
                              className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                              onClick={(e) => openActionsMenu(e, rule)}
                              aria-label={`Open actions for ${rule.name}`}>
                              <MoreHorizontal size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
