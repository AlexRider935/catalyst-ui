

"use client";

import { useState, Fragment, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Dialog, Switch, Transition } from "@headlessui/react";
import Link from "next/link";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

// --- Reusable Components ---

const SettingsCard = ({ children }) => (
  <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm flex flex-col h-full">
    {children}
  </div>
);

const SeverityBadge = ({ severity }) => {
  const severityMap = {
    Critical: "bg-red-100 text-red-700",
    High: "bg-amber-100 text-amber-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-blue-100 text-blue-700",
  };
  const colorClass = severityMap[severity] || "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${colorClass}`}
    >
      {severity}
    </span>
  );
};

// --- Delete Confirmation Modal ---

const DeleteConfirmationModal = ({ rule, isOpen, onClose, onDelete }) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
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
            leaveTo="opacity-0 scale-95"
          >
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
                    className="text-base font-semibold leading-6 text-slate-900"
                  >
                    Delete Rule
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-slate-500">
                      Are you sure you want to delete the rule{" "}
                      <span className="font-bold text-slate-700">
                        {rule?.name}
                      </span>
                      ? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                  onClick={() => onDelete(rule?.id)}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto"
                  onClick={onClose}
                >
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

// --- Main Rules Page Component ---

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  useEffect(() => {
    const fetchRules = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/rules");
        if (!response.ok) throw new Error("Failed to fetch rules");
        const data = await response.json();
        setRules(data);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRules();
  }, []);

  const handleStatusChange = async (ruleId, newStatus) => {
    const originalRules = [...rules];
    const ruleToUpdate = rules.find((r) => r.id === ruleId);
    if (!ruleToUpdate) return;

    setRules(
      rules.map((r) => (r.id === ruleId ? { ...r, isActive: newStatus } : r))
    );

    const payload = { ...ruleToUpdate, isActive: newStatus };

    try {
      const response = await fetch(`/api/rules/${ruleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update rule status");
      await response.json();
    } catch (error) {
      console.error("Update Error:", error);
      setRules(originalRules);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    const originalRules = [...rules];
    setRules(rules.filter((r) => r.id !== ruleId));
    setRuleToDelete(null);

    try {
      const response = await fetch(`/api/rules/${ruleId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete rule");
    } catch (error) {
      console.error("Delete Error:", error);
      setRules(originalRules);
    }
  };

  return (
    <>
      <DeleteConfirmationModal
        isOpen={!!ruleToDelete}
        onClose={() => setRuleToDelete(null)}
        onDelete={handleDeleteRule}
        rule={ruleToDelete}
      />
      <div className="flex flex-col h-full space-y-8">
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Detection Rules
            </h1>
            <p className="mt-1 text-slate-500">
              Manage the custom logic that powers the intelligence engine.
            </p>
          </div>
          <Link href="/detection/rules/new">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              <Plus size={18} /> New Rule
            </button>
          </Link>
        </div>

        <div className="flex-1 min-h-0">
          <SettingsCard>
            <div className="p-4 border-b border-slate-200/80 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by name or source..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <Filter size={16} /> Source
                </button>
              </div>
            </div>
            
            <div className="overflow-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Rule Name
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="w-24 px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8">
                        <p className="text-slate-500">Loading rules...</p>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {rules.map((rule) => (
                        <motion.tr
                          layout
                          key={rule.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="group hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">
                              {rule.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Version {rule.version} &middot; by{" "}
                              {rule.lastModifiedBy || "system"}
                            </p>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">
                            {rule.source}
                          </td>
                          <td className="px-6 py-4">
                            <SeverityBadge severity={rule.severity} />
                          </td>
                          <td className="px-6 py-4">
                            <Switch
                              checked={rule.isActive}
                              onChange={(newStatus) =>
                                handleStatusChange(rule.id, newStatus)
                              }
                              className={clsx(
                                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                rule.isActive
                                  ? "bg-blue-600"
                                  : "bg-slate-300"
                              )}
                            >
                              <span
                                className={clsx(
                                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                  rule.isActive
                                    ? "translate-x-5"
                                    : "translate-x-0"
                                )}
                              />
                            </Switch>
                          </td>
                          {/* --- NEW ACTION CELL --- */}
                          <td className="px-6 py-4 text-right relative">
                            {/* Action buttons: fade in on hover */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-end gap-1">
                              <a
                                href="#"
                                className="p-2 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                                title="Edit Rule"
                              >
                                <Edit size={16} />
                              </a>
                              <button
                                onClick={() => setRuleToDelete(rule)}
                                className="p-2 rounded-md text-red-500 hover:bg-red-100 hover:text-red-700"
                                title="Delete Rule"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {/* More icon: fade out on hover */}
                            <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-100 group-hover:opacity-0 transition-opacity duration-200 pointer-events-none">
                              <MoreVertical size={16} className="text-slate-400" />
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </SettingsCard>
        </div>
      </div>
    </>
  );
}