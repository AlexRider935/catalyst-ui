"use client";

import { useState } from "react";
import {
  X,
  FileBarChart,
  ShieldCheck,
  Bug,
  Server,
  ArrowLeft,
} from "lucide-react";

const reportTypes = [
  {
    name: "Compliance Report",
    description: "Evidence for a specific framework.",
    icon: ShieldCheck,
    step: "configureCompliance",
  },
  {
    name: "Vulnerability Report",
    description: "Summary of open vulnerabilities.",
    icon: Bug,
    step: "configureVulnerability",
  },
  {
    name: "Asset Inventory",
    description: "Export a list of all assets.",
    icon: Server,
    step: "configureAsset",
  },
];

const complianceFrameworks = ["PCI-DSS 4.0", "HIPAA", "SOC 2"];

export default function GenerateReportModal({ isOpen, onClose }) {
  const [step, setStep] = useState("selectType"); // 'selectType', 'configureCompliance', etc.

  const handleClose = () => {
    setStep("selectType"); // Reset state on close
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            {step !== "selectType" && (
              <button
                onClick={() => setStep("selectType")}
                className="p-1 text-slate-500 hover:text-slate-900">
                <ArrowLeft size={22} />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Generate a New Report
              </h2>
              <p className="mt-1 text-slate-500">
                {step === "selectType"
                  ? "Select the type of report you would like to generate."
                  : "Configure your report options."}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-800">
            <X size={24} />
          </button>
        </div>

        {/* Step 1: Select Report Type */}
        {step === "selectType" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {reportTypes.map((report) => (
              <button
                key={report.name}
                onClick={() => setStep(report.step)}
                className="group flex items-center gap-4 rounded-lg border border-slate-200 p-5 text-left hover:border-blue-500 hover:bg-slate-50 transition-all">
                <div className="rounded-md bg-slate-100 p-3 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600">
                  <report.icon size={24} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{report.name}</p>
                  <p className="text-sm text-slate-500">{report.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Configure Compliance Report */}
        {step === "configureCompliance" && (
          <div className="space-y-4">
            <label
              htmlFor="framework"
              className="block text-sm font-medium text-slate-700">
              Select Compliance Framework
            </label>
            <select
              id="framework"
              name="framework"
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              {complianceFrameworks.map((fw) => (
                <option key={fw}>{fw}</option>
              ))}
            </select>
            <div className="pt-4 text-right">
              <button
                type="button"
                className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                Generate
              </button>
            </div>
          </div>
        )}

        {/* Placeholder for other report configurations */}
        {(step === "configureVulnerability" || step === "configureAsset") && (
          <div className="text-center text-slate-500 py-8">
            <p>Configuration options for this report type would appear here.</p>
            <div className="pt-4">
              <button
                type="button"
                className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                Generate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
