"use client";

import { useState } from "react";
import { FileBarChart, Plus, Download, MoreVertical } from "lucide-react";
import GenerateReportModal from "./components/GenerateReportModal";

// --- Mock Data ---
const reportData = [
  {
    id: "rep-1",
    name: "Q3 Vulnerability Summary",
    type: "Vulnerability Report",
    date: "2025-08-10",
    status: "Completed",
  },
  {
    id: "rep-2",
    name: "PCI-DSS Attestation Evidence",
    type: "Compliance Report",
    date: "2025-08-05",
    status: "Completed",
  },
  {
    id: "rep-3",
    name: "Weekly Security Events Digest",
    type: "Events Report",
    date: "2025-08-01",
    status: "Completed",
  },
  {
    id: "rep-4",
    name: "Endpoint Inventory Export",
    type: "Asset Report",
    date: "2025-07-28",
    status: "Completed",
  },
];

// --- Main Reporting Page ---
export default function ReportingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Reporting</h1>
            <p className="mt-1 text-slate-500">
              Generate and manage reports for compliance, operations, and
              executive review.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Plus size={18} />
            Generate Report
          </button>
        </div>

        {/* Reports Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Report Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Date Generated
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left font-semibold text-slate-600">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportData.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {report.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{report.type}</td>
                  <td className="px-6 py-4 text-slate-600">{report.date}</td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-green-600">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      {report.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                      <Download size={16} />
                    </button>
                    <button className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 ml-2">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* The Modal Component */}
      <GenerateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
