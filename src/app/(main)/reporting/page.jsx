"use client";

import { useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import {
  FileBarChart,
  Plus,
  Download,
  MoreVertical,
  Play,
  Clock,
  Calendar,
  Users,
  FileText,
  X, // <-- CORRECTED: Added missing icon dependency
} from "lucide-react";
import clsx from "clsx";

// --- MOCK DATA ---
const reportLibraryData = [
  {
    id: "rep-1",
    name: "Q3 Vulnerability Summary",
    type: "Vulnerability",
    date: "2025-08-20T14:30:00Z",
    status: "Completed",
    format: "PDF",
    generatedBy: "Alex Rider",
    recipients: ["ciso@...", "secops@..."],
  },
  {
    id: "rep-2",
    name: "PCI-DSS Attestation Evidence",
    type: "Compliance",
    date: "2025-08-18T09:00:00Z",
    status: "Completed",
    format: "PDF",
    generatedBy: "Schedule-PCI-Weekly",
    recipients: ["auditors@..."],
  },
  {
    id: "rep-3",
    name: "Failed Login Attempts",
    type: "Events",
    date: "2025-08-15T11:00:00Z",
    status: "Failed",
    format: "CSV",
    generatedBy: "Jane Shaw",
    recipients: ["jane.s@..."],
  },
  {
    id: "rep-4",
    name: "Weekly Security Events Digest",
    type: "Events",
    date: "2025-08-15T08:00:00Z",
    status: "Completed",
    format: "PDF",
    generatedBy: "Schedule-Events-Weekly",
    recipients: ["sec-team@..."],
  },
];

const schedulesData = [
  {
    id: "sch-1",
    name: "Schedule-PCI-Weekly",
    template: "PCI-DSS Attestation Evidence",
    frequency: "Weekly (Mon 9AM)",
    nextRun: "2025-08-25T09:00:00Z",
    lastRunStatus: "Completed",
    recipients: ["auditors@..."],
  },
  {
    id: "sch-2",
    name: "Schedule-Events-Weekly",
    template: "Weekly Security Events Digest",
    frequency: "Weekly (Fri 8AM)",
    nextRun: "2025-08-22T08:00:00Z",
    lastRunStatus: "Completed",
    recipients: ["sec-team@..."],
  },
  {
    id: "sch-3",
    name: "Daily Vulnerability Triage",
    template: "Daily Vuln Summary (Critical/High)",
    frequency: "Daily (7AM)",
    nextRun: "2025-08-22T07:00:00Z",
    lastRunStatus: "Pending",
    recipients: ["vuln-team@..."],
  },
];

// --- Status Badge Component ---
const StatusBadge = ({ status }) => {
  const styles = {
    Completed: "bg-green-100 text-green-700",
    Generating: "bg-blue-100 text-blue-700 animate-pulse",
    Failed: "bg-red-100 text-red-700",
    Scheduled: "bg-slate-100 text-slate-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        styles[status] || styles.Scheduled
      )}>
      {status}
    </span>
  );
};

// --- Slide-Over Panel for Report Generation ---
const GenerateReportPanel = ({ isOpen, onClose }) => (
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
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full">
              <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  <div className="bg-slate-50 px-4 py-4 sm:px-6 border-b border-slate-200">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-base font-semibold leading-6 text-slate-900">
                        Generate Report
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="relative rounded-md bg-slate-50 text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-800"
                          onClick={onClose}>
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex-1 px-6 py-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Report Template
                      </label>
                      <select className="mt-1 block w-full rounded-lg border-slate-300 text-sm">
                        <option>Vulnerability Summary</option>
                        <option>Compliance Evidence (PCI-DSS)</option>
                        <option>Executive Security Summary</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Time Range
                      </label>
                      <select className="mt-1 block w-full rounded-lg border-slate-300 text-sm">
                        <option>Last 24 hours</option>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Custom Range...</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Format
                      </label>
                      <div className="mt-1 flex gap-2 rounded-lg bg-slate-100 p-1">
                        <button className="flex-1 rounded-md bg-white shadow-sm py-1.5 text-sm font-semibold">
                          PDF
                        </button>
                        <button className="flex-1 text-slate-600 py-1.5 text-sm font-semibold">
                          CSV
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Recipients{" "}
                        <span className="text-slate-400">
                          (comma-separated)
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="secops@..., ciso@..."
                        className="mt-1 block w-full rounded-lg border-slate-300 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 justify-end gap-3 px-4 py-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                      Generate Now
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </div>
    </Dialog>
  </Transition.Root>
);

// --- Main Reporting Page Component ---
export default function ReportingPage() {
  const [activeTab, setActiveTab] = useState("library");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const renderIcon = (format) => {
    if (format === "PDF")
      return <FileText size={16} className="text-red-500" />;
    if (format === "CSV")
    return <FileBarChart size={16} />;
  };

  return (
    <>
      <GenerateReportPanel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="flex flex-col h-full space-y-6">
        <div className="flex-shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Reporting Center
            </h1>
            <p className="mt-1 text-slate-500">
              Generate, schedule, and manage reports for compliance and
              operations.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            <Plus size={18} /> Generate Report
          </button>
        </div>

        <div className="flex-shrink-0 border-b border-slate-200">
          <nav className="-mb-px flex space-x-6">
            <TabButton id="library" label="Report Library" />
            <TabButton id="schedules" label="Schedules & Templates" />
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
              {activeTab === "library" && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm h-full">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-slate-600">
                          Report Name
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-600">
                          Generated
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-600">
                          Recipients
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-600">
                          Status
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {reportLibraryData.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                {renderIcon(report.format)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800">
                                  {report.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {report.type} Report &middot; Generated by{" "}
                                  {report.generatedBy}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              {new Date(report.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            <div
                              className="flex items-center gap-2"
                              title={report.recipients.join(", ")}>
                              <Users size={14} />
                              {report.recipients.length} Recipient(s)
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={report.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100">
                              <Download size={16} />
                            </button>
                            <button className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 ml-2">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === "schedules" && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm h-full">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-slate-600">
                          Schedule Name
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-600">
                          Frequency
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-600">
                          Next Run
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-slate-600">
                          Last Run Status
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {schedulesData.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-800">
                              {s.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              Template: {s.template}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              {s.frequency}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              {new Date(s.nextRun).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={s.lastRunStatus} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100">
                              <Play size={16} title="Run Now" />
                            </button>
                            <button className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 ml-2">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
