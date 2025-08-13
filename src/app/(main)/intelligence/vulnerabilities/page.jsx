"use client";

import { useState } from "react";
import {
  Bug,
  Search,
  Filter,
  HardDrive,
  X,
  Server,
  ExternalLink,
} from "lucide-react";

// --- Mock Data ---
const vulnerabilityData = [
  {
    id: "CVE-2025-12345",
    severity: "Critical",
    title: "Remote Code Execution in Apache Struts",
    description:
      "A deserialization vulnerability in Apache Struts allows a remote attacker to execute arbitrary code.",
    assets: [
      { name: "prod-web-01" },
      { name: "prod-web-02" },
      { name: "staging-web-server" },
    ],
    firstSeen: "2025-08-10",
  },
  {
    id: "CVE-2025-67890",
    severity: "High",
    title: "SQL Injection in Internal CRM",
    description:
      "Improper neutralization of special elements used in an SQL command allows for injection.",
    assets: [{ name: "internal-crm-db" }],
    firstSeen: "2025-08-12",
  },
  {
    id: "CVE-2025-24680",
    severity: "Medium",
    title: "Cross-Site Scripting (XSS) in Web Portal",
    description:
      "A stored XSS vulnerability allows attackers to inject malicious scripts into web pages viewed by other users.",
    assets: [{ name: "customer-portal-app" }, { name: "support-portal-vm" }],
    firstSeen: "2025-07-28",
  },
  {
    id: "CVE-2025-13579",
    severity: "Medium",
    title: "Outdated OpenSSL Version on Legacy Server",
    description:
      "The version of OpenSSL is outdated and is susceptible to multiple known vulnerabilities.",
    assets: [{ name: "legacy-ftp-server" }],
    firstSeen: "2025-06-01",
  },
];

const severityMap = {
  Critical: {
    badge: "bg-red-100 text-red-700 border-red-200",
    textColor: "text-red-600",
  },
  High: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    textColor: "text-amber-600",
  },
  Medium: {
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    textColor: "text-yellow-600",
  },
  Low: {
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    textColor: "text-blue-600",
  },
};

// --- Vulnerability Detail Panel ---
const VulnerabilityDetailPanel = ({ vuln, onClose }) => {
  if (!vuln) return null;
  const { textColor } = severityMap[vuln.severity];

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
                  <Bug size={16} /> {vuln.severity} Vulnerability
                </p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {vuln.title}
                </h2>
                <p className="font-mono text-sm text-blue-600 mt-1">
                  {vuln.id}
                </p>
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
              <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
              <p className="text-sm text-slate-600">{vuln.description}</p>
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:underline inline-flex items-center gap-1 mt-2">
                View Full CVE Details <ExternalLink size={14} />
              </a>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">
                Affected Assets ({vuln.assets.length})
              </h3>
              <div className="rounded-lg border border-slate-200 bg-white">
                <ul className="divide-y divide-slate-200">
                  {vuln.assets.map((asset) => (
                    <li
                      key={asset.name}
                      className="flex items-center gap-3 p-3">
                      <Server size={16} className="text-slate-500" />
                      <span className="font-mono text-sm text-slate-700">
                        {asset.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <button className="w-full text-center p-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md">
              Create Remediation Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Vulnerability Page ---
export default function VulnerabilityPage() {
  const [selectedVuln, setSelectedVuln] = useState(null);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Vulnerabilities</h1>
          <p className="mt-1 text-slate-500">
            A prioritized overview of vulnerabilities across your assets.
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
              placeholder="Search by CVE or title..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> Severity
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <HardDrive size={16} /> Asset
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  CVE / ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Vulnerability
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Severity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Affected Assets
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  First Seen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {vulnerabilityData.map((vuln) => {
                const { badge } = severityMap[vuln.severity];
                return (
                  <tr
                    key={vuln.id}
                    onClick={() => setSelectedVuln(vuln)}
                    className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {vuln.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {vuln.title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${badge}`}>
                        {vuln.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {vuln.assets.length}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {vuln.firstSeen}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <VulnerabilityDetailPanel
        vuln={selectedVuln}
        onClose={() => setSelectedVuln(null)}
      />
    </>
  );
}
