"use client";

import { useState } from "react";
import { CaseSensitive, Plus, User, ShieldAlert } from "lucide-react";

// --- Mock Data ---
const caseData = {
  New: [
    {
      id: "case-1",
      title: "Anomalous Outbound Connection from prod-db-01",
      severity: "High",
      assignee: null,
    },
    {
      id: "case-2",
      title: "Potential Brute Force on Admin Account",
      severity: "Medium",
      assignee: null,
    },
  ],
  "In Progress": [
    {
      id: "case-3",
      title: "Investigate RCE Vulnerability (CVE-2025-12345)",
      severity: "Critical",
      assignee: "Jane Doe",
    },
  ],
  "On Hold": [],
  Resolved: [
    {
      id: "case-4",
      title: "User Login Outside Business Hours",
      severity: "Low",
      assignee: "Alex Rider",
    },
  ],
};

const severityMap = {
  Critical: "border-l-4 border-red-500",
  High: "border-l-4 border-amber-500",
  Medium: "border-l-4 border-yellow-500",
  Low: "border-l-4 border-blue-500",
};

// --- Case Card Component ---
const CaseCard = ({ caseItem }) => (
  <div
    className={`bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-4 ${
      severityMap[caseItem.severity]
    }`}>
    <p className="font-semibold text-sm text-slate-800">{caseItem.title}</p>
    <div className="flex items-center justify-between mt-3">
      <span className="text-xs font-medium text-slate-500">
        {caseItem.severity}
      </span>
      {caseItem.assignee ? (
        <div
          className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs"
          title={caseItem.assignee}>
          {caseItem.assignee.charAt(0)}
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-300" />
      )}
    </div>
  </div>
);

// --- Main Case Management Page ---
export default function CaseManagementPage() {
  const columns = ["New", "In Progress", "On Hold", "Resolved"];

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Case Management</h1>
          <p className="mt-1 text-slate-500">
            Track and manage investigations from discovery to resolution.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <Plus size={18} />
          New Case
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map((column) => (
          <div key={column} className="bg-slate-100/70 rounded-xl h-full">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                {column}
                <span className="text-sm font-normal text-slate-500 bg-slate-200 rounded-full px-2">
                  {caseData[column].length}
                </span>
              </h2>
            </div>
            <div className="p-4">
              {caseData[column].length > 0 ? (
                caseData[column].map((caseItem) => (
                  <CaseCard key={caseItem.id} caseItem={caseItem} />
                ))
              ) : (
                <div className="text-center text-sm text-slate-500 py-4">
                  No cases in this stage.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
