"use client";

import { useState } from "react";
import { ToyBrick, Plus } from "lucide-react";

// --- Mock Data ---
const frameworksData = [
  {
    id: "fw-1",
    name: "PCI-DSS 4.0",
    description: "Payment Card Industry Data Security Standard.",
    controls: 254,
    activeControls: 250,
    status: true,
  },
  {
    id: "fw-2",
    name: "HIPAA",
    description: "Health Insurance Portability and Accountability Act.",
    controls: 78,
    activeControls: 78,
    status: true,
  },
  {
    id: "fw-3",
    name: "SOC 2",
    description: "System and Organization Controls 2.",
    controls: 61,
    activeControls: 55,
    status: true,
  },
  {
    id: "fw-4",
    name: "ISO 27001",
    description: "Information Security Management.",
    controls: 114,
    activeControls: 0,
    status: false,
  },
];

// --- Toggle Switch Component ---
const ToggleSwitch = ({ enabled }) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsEnabled(!isEnabled);
      }}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
        isEnabled ? "bg-blue-600" : "bg-slate-300"
      }`}>
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isEnabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

// --- Main Frameworks Page ---
export default function FrameworksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Compliance Frameworks
          </h1>
          <p className="mt-1 text-slate-500">
            Manage and customize the compliance frameworks monitored by the
            platform.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <Plus size={18} />
          Add Framework
        </button>
      </div>

      {/* Frameworks Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {frameworksData.map((framework) => (
          <div
            key={framework.id}
            className="group relative rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-500 hover:shadow-md cursor-pointer">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-slate-100 p-3 text-slate-600">
                  <ToyBrick size={24} />
                </div>
                <ToggleSwitch enabled={framework.status} />
              </div>
              <div className="mt-4">
                <h2 className="font-semibold text-lg text-slate-800">
                  {framework.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1 h-10">
                  {framework.description}
                </p>
              </div>
            </div>
            <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-3 rounded-b-xl">
              <p className="text-xs font-medium text-slate-600">
                {framework.activeControls} / {framework.controls} Controls
                Active
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
