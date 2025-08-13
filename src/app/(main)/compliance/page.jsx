"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";

// --- Mock Data (Updated) ---
const complianceData = {
  "PCI-DSS 4.0": {
    score: 95,
    controls: [
      {
        id: "1.2.1",
        description: "Firewall and router configurations are restricted.",
        status: "Compliant",
        lastChecked: "1h ago",
      },
      {
        id: "3.1",
        description: "Stored cardholder data is kept to a minimum.",
        status: "Compliant",
        lastChecked: "1h ago",
      },
      {
        id: "6.2",
        description: "Protect system components from known vulnerabilities.",
        status: "Violation",
        lastChecked: "2d ago",
      },
      {
        id: "8.2.1",
        description: "Use strong cryptography and security protocols.",
        status: "Compliant",
        lastChecked: "1h ago",
      },
      {
        id: "10.2.1",
        description: "Implement audit trails for all system components.",
        status: "Warning",
        lastChecked: "8h ago",
      },
    ],
  },
  HIPAA: {
    score: 82,
    controls: [
      {
        id: "164.312(a)(1)",
        description: "Implement a security management process.",
        status: "Compliant",
        lastChecked: "3h ago",
      },
      {
        id: "164.308(a)(1)",
        description: "Risk Analysis: Conduct an accurate assessment.",
        status: "Compliant",
        lastChecked: "3h ago",
      },
      {
        id: "164.312(c)(1)",
        description: "Integrity: Implement policies to protect EPHI.",
        status: "Violation",
        lastChecked: "1d ago",
      },
    ],
  },
};

const statusMap = {
  Compliant: { Icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  Violation: { Icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
  Warning: { Icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100" },
};

// --- Radial Progress Component for Compliance Score ---
const ComplianceScore = ({ score }) => {
  const circumference = 2 * Math.PI * 52; // 2 * pi * radius
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const progress = circumference - (score / 100) * circumference;
    setOffset(progress);
  }, [score, circumference]);

  const color =
    score > 90
      ? "stroke-green-500"
      : score > 75
      ? "stroke-amber-500"
      : "stroke-red-500";

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="stroke-slate-200"
          strokeWidth="10"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
        />
        <circle
          className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${color}`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-slate-800">{score}%</span>
      </div>
    </div>
  );
};

// --- Main Compliance Page ---
export default function CompliancePage() {
  const [activeFramework, setActiveFramework] = useState("PCI-DSS 4.0");
  const frameworks = Object.keys(complianceData);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Auditor's Console</h1>
        <p className="mt-1.5 text-slate-500">
          Review compliance status against security frameworks.
        </p>
      </div>

      {/* Posture Summary */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            {activeFramework}
          </h2>
          <p className="text-sm text-slate-500">Overall compliance score</p>
        </div>
        <ComplianceScore score={complianceData[activeFramework].score} />
      </div>

      {/* Framework Selector */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {frameworks.map((framework) => (
            <button
              key={framework}
              onClick={() => setActiveFramework(framework)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${
                activeFramework === framework
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}>
              {framework}
            </button>
          ))}
        </nav>
      </div>

      {/* Controls List */}
      <div className="space-y-3">
        {complianceData[activeFramework].controls.map((control) => {
          const { Icon, color, bg } = statusMap[control.status];
          return (
            <div
              key={control.id}
              className="bg-white border border-slate-200/80 rounded-lg p-4 flex items-center justify-between hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {control.description}
                  </p>
                  <p className="font-mono text-xs text-slate-500">
                    {control.id} &middot; Last checked: {control.lastChecked}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${bg} ${color}`}>
                {control.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
