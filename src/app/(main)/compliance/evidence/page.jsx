"use client";

import { useState } from "react";
import { FileText, Search, Filter, ShieldCheck, Server, X } from "lucide-react";

// --- Mock Data ---
// Updated with raw data for the detail panel
const evidenceData = [
  {
    id: "evd-1",
    name: "Firewall Rule Snapshot",
    type: "Configuration",
    control: "PCI-DSS 1.2.1",
    source: "prod-fw-01",
    collected: "2025-08-13 15:00:00",
    raw: `ACCEPT tcp -- 0.0.0.0/0 10.0.1.10 tcp dpt:443\nDROP   all  -- 0.0.0.0/0 0.0.0.0/0`,
  },
  {
    id: "evd-2",
    name: "Admin Login Log (Outside Hours)",
    type: "Log Data",
    control: "SOC 2 CC6.2",
    source: "Okta",
    collected: "2025-08-13 14:45:10",
    raw: `{"timestamp":"2025-08-13T14:45:10Z", "user":"jane.doe", "event":"user.session.start", "outcome":"SUCCESS", "source_ip":"8.8.8.8"}`,
  },
  {
    id: "evd-3",
    name: "Vulnerability Scan Report (Q3)",
    type: "Scan Report",
    control: "PCI-DSS 6.2",
    source: "Vulnerability Scanner",
    collected: "2025-08-10 10:00:00",
    raw: `Vulnerability: CVE-2025-12345\nHost: prod-web-01\nSeverity: Critical\nStatus: Unpatched`,
  },
  {
    id: "evd-4",
    name: "Employee Security Training Attestation",
    type: "Attestation",
    control: "PCI-DSS 12.2",
    source: "HR System",
    collected: "2025-08-01 12:00:00",
    raw: `{"user":"john.smith", "course":"Security Awareness 2025", "status":"Completed", "date":"2025-02-15"}`,
  },
  {
    id: "evd-5",
    name: "EPHI Access Log",
    type: "Log Data",
    control: "HIPAA 164.312(b)",
    source: "Customer Database",
    collected: "2025-08-13 15:10:25",
    raw: `{"timestamp":"2025-08-13T15:10:25Z", "user":"dr_jane_doe", "action":"VIEW_RECORD", "patient_id":"PAT-789"}`,
  },
];

// --- Evidence Detail Panel ---
const EvidenceDetailPanel = ({ evidence, onClose }) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose}></div>
      <div className="absolute inset-y-0 right-0 flex max-w-2xl w-full">
        <div className="w-full bg-white shadow-xl flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm text-blue-600 flex items-center gap-2">
                  <FileText size={16} /> {evidence.type}
                </p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  {evidence.name}
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
              <h3 className="font-semibold text-slate-800 mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm rounded-lg bg-white border border-slate-200 p-4">
                <div className="font-medium text-slate-500">Control</div>
                <div className="font-mono text-slate-800">
                  {evidence.control}
                </div>
                <div className="font-medium text-slate-500">Source</div>
                <div className="font-mono text-slate-800">
                  {evidence.source}
                </div>
                <div className="font-medium text-slate-500">Date Collected</div>
                <div className="text-slate-800">{evidence.collected}</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">
                Raw Evidence Artifact
              </h3>
              <div className="p-4 font-mono text-xs bg-slate-900 text-white rounded-lg overflow-x-auto">
                <pre className="text-slate-300 whitespace-pre-wrap">
                  {evidence.raw}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Evidence Library Page ---
export default function EvidenceLibraryPage() {
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Evidence Library
          </h1>
          <p className="mt-1 text-slate-500">
            A central repository of all collected compliance artifacts and
            evidence.
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
              placeholder="Search evidence..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> Framework
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> Type
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Evidence
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Control
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Source
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Date Collected
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {evidenceData.map((evidence) => (
                <tr
                  key={evidence.id}
                  onClick={() => setSelectedEvidence(evidence)}
                  className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {evidence.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{evidence.type}</td>
                  <td className="px-6 py-4 font-mono text-xs text-blue-600">
                    {evidence.control}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {evidence.source}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {evidence.collected}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <EvidenceDetailPanel
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </>
  );
}
