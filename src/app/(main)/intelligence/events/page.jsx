"use client";

import { useState } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  X,
  User,
  HardDrive,
  Globe,
} from "lucide-react";

// --- Mock Data ---
const eventData = [
  {
    id: "evt_1",
    severity: "High",
    title: "Unusual Login Activity",
    source: "AWS CloudTrail",
    asset: "Customer Database",
    timestamp: "2025-08-13 14:30:15",
    details: {
      user: "John Doe (Terminated)",
      ip: "91.203.14.15",
      country: "Germany",
      host: "prod-db-01",
    },
  },
  {
    id: "evt_2",
    severity: "Medium",
    title: "Privilege Escalation",
    source: "prod-web-01",
    asset: "analyst-01",
    timestamp: "2025-08-13 13:45:10",
    details: { user: "analyst-01", command: "sudo su -", host: "prod-web-01" },
  },
  {
    id: "evt_3",
    severity: "Low",
    title: "Security Policy Updated",
    source: "Okta",
    asset: "Password Policy",
    timestamp: "2025-08-13 12:10:00",
    details: {
      user: "Alex Rider",
      change: "Set minimum password length to 14",
    },
  },
  {
    id: "evt_4",
    severity: "High",
    title: "Potential Data Exfiltration",
    source: "Palo Alto Firewall",
    asset: "1.2.3.4 -> ext.server",
    timestamp: "2025-08-13 11:55:23",
    details: {
      source_ip: "10.1.1.50",
      dest_ip: "198.51.100.22",
      bytes_out: "5.2 GB",
    },
  },
  {
    id: "evt_5",
    severity: "Medium",
    title: "Anomalous Process Started",
    source: "win-dc-02",
    asset: "powershell.exe",
    timestamp: "2025-08-13 10:20:45",
    details: {
      user: "SYSTEM",
      process: "powershell.exe -enc ...",
      host: "win-dc-02",
    },
  },
];

const severityMap = {
  High: { Icon: ShieldAlert, color: "bg-red-500", textColor: "text-red-600" },
  Medium: {
    Icon: ShieldCheck,
    color: "bg-amber-500",
    textColor: "text-amber-600",
  },
  Low: { Icon: ShieldCheck, color: "bg-blue-500", textColor: "text-blue-600" },
};

// --- Event Detail Panel Component ---
const EventDetailPanel = ({ event, onClose }) => {
  if (!event) return null;
  const { Icon, textColor } = severityMap[event.severity];

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose}></div>
      <div className="absolute inset-y-0 right-0 flex max-w-2xl w-full">
        <div className="w-full bg-white shadow-xl flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={`font-semibold text-sm flex items-center gap-2 ${textColor}`}>
                  <Icon size={16} /> {event.severity} Severity Event
                </p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {event.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-800">
                <X size={24} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-6 space-y-6 bg-slate-50/70 overflow-y-auto">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">
                Entities Involved
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-slate-500" />{" "}
                  <span className="font-medium text-slate-700">
                    {event.details.user || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <HardDrive size={16} className="text-slate-500" />{" "}
                  <span className="font-medium text-slate-700">
                    {event.details.host || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-slate-500" />{" "}
                  <span className="font-medium text-slate-700">
                    {event.details.ip || event.details.source_ip || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">
                Raw Event Data
              </h3>
              <div className="p-4 font-mono text-xs bg-slate-900 text-white rounded-lg overflow-x-auto">
                <pre className="text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(
                    {
                      id: event.id,
                      timestamp: event.timestamp,
                      source: event.source,
                      ...event.details,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">
                Suggested Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md">
                  Isolate Host
                </button>
                <button className="w-full text-left p-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md">
                  Disable User Account
                </button>
                <button className="w-full text-left p-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md">
                  View Related Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Security Events Page ---
export default function SecurityEventsPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Security Events</h1>
          <p className="mt-1 text-slate-500">
            A real-time feed of notable security-related activities across your
            infrastructure.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> Severity
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Calendar size={16} /> Date Range
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600 w-16"></th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Event
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Source
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Asset / Identity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {eventData.map((event) => {
                const { color } = severityMap[event.severity];
                return (
                  <tr
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-6 py-3">
                      <div
                        className={`w-3 h-3 rounded-full ${color}`}
                        title={event.severity}></div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {event.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{event.source}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {event.asset}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {event.timestamp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <EventDetailPanel
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
