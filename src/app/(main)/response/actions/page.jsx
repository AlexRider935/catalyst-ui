"use client";

import { useState, useMemo, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import {
  Zap,
  Search,
  CheckCircle,
  XCircle,
  Server,
  User,
  GitBranch,
  ChevronsUpDown,
  MoreHorizontal,
  Copy,
  RotateCcw,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Menu, Transition, Listbox } from "@headlessui/react";
import clsx from "clsx";

// --- Advanced Mock Data with Security & Compliance Context ---
const initialActiveResponseData = [
  {
    id: "ar-1",
    correlationId: "evt-9a8b7c6d",
    action: "ISOLATE_ENDPOINT",
    target: "prod-web-01",
    playbook: {
      id: "pb-1",
      name: "Isolate Endpoint on High-Severity Alert",
      version: 3,
    },
    initiator: { type: "system", name: "Automated Trigger" },
    status: "Success",
    isReversible: true,
    parameters: { reason: "High-severity malware alert" },
    output: {
      message: "Endpoint successfully moved to quarantine network group.",
    },
    timestamp: "2025-08-20T15:02:10Z",
  },
  {
    id: "ar-2",
    correlationId: "evt-5e4f3g2h",
    action: "DISABLE_USER",
    target: "john.doe",
    playbook: {
      id: "pb-2",
      name: "Disable User on Impossible Travel",
      version: 2,
    },
    initiator: { type: "user", name: "david.chen" },
    status: "Success",
    isReversible: true,
    parameters: { reason: "Manual escalation from SOC alert." },
    output: { message: "User account john.doe disabled in Active Directory." },
    timestamp: "2025-08-20T14:45:33Z",
  },
  {
    id: "ar-5",
    correlationId: "evt-1i2j3k4l",
    action: "ISOLATE_ENDPOINT",
    target: "legacy-ftp-server",
    playbook: {
      id: "pb-1",
      name: "Isolate Endpoint on High-Severity Alert",
      version: 2,
    },
    initiator: { type: "system", name: "Automated Trigger" },
    status: "Failed",
    isReversible: false,
    parameters: { reason: "Unusual outbound connection detected." },
    output: {
      error_code: 503,
      message:
        "EDR agent offline or not responding. Action could not be completed.",
    },
    timestamp: "2025-08-19T18:05:15Z",
  },
  {
    id: "ar-6",
    correlationId: "evt-9a8b7c6d",
    action: "SEND_SLACK",
    target: "#soc-alerts",
    playbook: {
      id: "pb-1",
      name: "Isolate Endpoint on High-Severity Alert",
      version: 3,
    },
    initiator: { type: "system", name: "Automated Trigger" },
    status: "Success",
    isReversible: false,
    parameters: {
      message:
        "Action `ISOLATE_ENDPOINT` on `prod-web-01` completed successfully.",
    },
    output: { message: "Slack API call successful." },
    timestamp: "2025-08-20T15:02:11Z",
  },
];

const STATUS_OPTIONS = ["All", "Success", "Failed", "Pending"];
const ACTION_TYPE_ICONS = {
  ISOLATE_ENDPOINT: <Server size={16} className="text-red-500" />,
  DISABLE_USER: <User size={16} className="text-red-500" />,
  SEND_SLACK: <MessageSquare size={16} className="text-blue-500" />,
  default: <Zap size={16} className="text-slate-500" />,
};

function LogRow({ log }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSuccess = log.status === "Success";
  const ActionIcon = ACTION_TYPE_ICONS[log.action] || ACTION_TYPE_ICONS.default;

  const handleRollback = () => {
    alert(
      `Initiating rollback for action ID: ${log.id} on target: ${log.target}`
    );
    // API call to rollback action would go here
  };

  const copyDetails = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    // Add a toast notification here in a real app
  };

  return (
    <>
      <tr
        className="hover:bg-slate-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            {ActionIcon}
            <span className="font-semibold text-slate-800">{log.action}</span>
          </div>
        </td>
        <td className="px-6 py-4 font-mono text-xs text-slate-600">
          {log.target}
        </td>
        <td className="px-6 py-4">
          <div
            className={`inline-flex items-center gap-2 text-sm font-medium ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}>
            {isSuccess ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {log.status}
          </div>
        </td>
        <td className="px-6 py-4 text-slate-600">
          <div className="flex items-center gap-2">
            {log.initiator.type === "user" ? (
              <User size={14} className="text-slate-500" />
            ) : (
              <Zap size={14} className="text-slate-500" />
            )}
            <span>{log.initiator.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-slate-600">
          {new Date(log.timestamp).toLocaleString()}
        </td>
        <td className="px-6 py-4 text-right">
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800">
              <MoreHorizontal size={18} />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95">
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-slate-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                <div className="px-1 py-1">
                  <Menu.Item>
                    <button className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      <ExternalLink size={14} className="mr-2" /> View
                      Triggering Event
                    </button>
                  </Menu.Item>
                  <Menu.Item>
                    <button className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      <GitBranch size={14} className="mr-2" /> View Playbook v
                      {log.playbook.version}
                    </button>
                  </Menu.Item>
                  <Menu.Item>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyDetails();
                      }}
                      className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      <Copy size={14} className="mr-2" /> Copy Details (JSON)
                    </button>
                  </Menu.Item>
                </div>
                {log.isReversible && (
                  <div className="px-1 py-1">
                    <Menu.Item>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRollback();
                        }}
                        className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold">
                        <RotateCcw size={14} className="mr-2" /> Rollback Action
                      </button>
                    </Menu.Item>
                  </div>
                )}
              </Menu.Items>
            </Transition>
          </Menu>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-slate-50">
          <td colSpan={6} className="p-0">
            <div className="grid grid-cols-3 gap-4 p-4 text-xs">
              <div className="space-y-2 rounded-md bg-white p-3 border border-slate-200">
                <p className="font-semibold text-slate-600">Context</p>
                <p>
                  <strong>Correlation ID:</strong>{" "}
                  <span className="font-mono text-blue-600">
                    {log.correlationId}
                  </span>
                </p>
                <p>
                  <strong>Playbook:</strong>{" "}
                  <span className="font-medium">
                    {log.playbook.name} (v{log.playbook.version})
                  </span>
                </p>
              </div>
              <div className="space-y-2 rounded-md bg-white p-3 border border-slate-200">
                <p className="font-semibold text-slate-600">Parameters</p>
                <pre className="whitespace-pre-wrap font-mono text-slate-700 bg-slate-100 p-2 rounded-md">
                  {JSON.stringify(log.parameters, null, 2)}
                </pre>
              </div>
              <div className="space-y-2 rounded-md bg-white p-3 border border-slate-200">
                <p className="font-semibold text-slate-600">Result Output</p>
                <pre className="whitespace-pre-wrap font-mono text-slate-700 bg-slate-100 p-2 rounded-md">
                  {JSON.stringify(log.output, null, 2)}
                </pre>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ActiveResponsePage() {
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState(initialActiveResponseData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "All"
  );

  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => statusFilter === "All" || log.status === statusFilter)
      .filter(
        (log) =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.target.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [logs, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Active Response Log
        </h1>
        <p className="mt-1 text-slate-500">
          An immutable audit trail of all automated actions taken by the
          Response Engine.
        </p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by action, target, or correlation ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border-slate-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Listbox value={statusFilter} onChange={setStatusFilter}>
            <div className="relative">
              <Listbox.Button className="relative w-40 cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-slate-300 shadow-sm focus:outline-none sm:text-sm">
                <span className="block truncate">{statusFilter}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronsUpDown className="h-5 w-5 text-slate-400" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0">
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                  {STATUS_OPTIONS.map((status, idx) => (
                    <Listbox.Option
                      key={idx}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 px-4 ${
                          active
                            ? "bg-blue-100 text-blue-900"
                            : "text-slate-900"
                        }`
                      }
                      value={status}>
                      {({ selected }) => (
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}>
                          {selected ? "✓ " : ""}
                          {status}
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Action
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Target
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Initiator
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left font-semibold text-slate-600">
                Timestamp
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => <LogRow key={log.id} log={log} />)
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <Zap className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-2 text-lg font-semibold text-slate-800">
                    No actions found
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Your search or filter criteria did not match any actions.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
