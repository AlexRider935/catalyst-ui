"use client";

import Link from "next/link";
import {
  ArrowLeft,
  GitBranch,
  ShieldAlert,
  Server,
  User,
  Zap,
  Mail,
  MessageSquare,
  Terminal,
} from "lucide-react";

// --- Node Component ---
const Node = ({ icon: Icon, title, description, color }) => (
  <div
    className={`relative bg-white p-4 rounded-lg border-2 ${color} shadow-sm w-64`}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
        <Icon size={18} className="text-slate-600" />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
    {/* Input/Output Handles */}
    <div className="absolute -left-1.5 top-1/2 -mt-1.5 w-3 h-3 rounded-full bg-slate-400 border-2 border-white" />
    <div className="absolute -right-1.5 top-1/2 -mt-1.5 w-3 h-3 rounded-full bg-slate-400 border-2 border-white" />
  </div>
);

// --- Main Playbook Editor Page ---
export default function NewPlaybookPage() {
  return (
    <div className="flex flex-col h-full -m-6 md:-m-10">
      {/* Page Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <Link
            href="/response/playbooks"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">New Playbook</h1>
            <p className="text-sm text-slate-500">
              Isolate Endpoint on High-Severity Alert
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg border border-transparent bg-blue-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            Save & Activate
          </button>
        </div>
      </header>

      {/* Main Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Node Library */}
        <aside className="w-72 bg-white border-r border-slate-200 p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Triggers
          </h2>
          <div className="space-y-2">
            <Node
              icon={ShieldAlert}
              title="Event Trigger"
              description="On security event"
              color="border-slate-200"
            />
            <Node
              icon={GitBranch}
              title="Rule Trigger"
              description="On detection rule match"
              color="border-slate-200"
            />
          </div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-4">
            Actions
          </h2>
          <div className="space-y-2">
            <Node
              icon={Server}
              title="Isolate Endpoint"
              description="Block network access"
              color="border-slate-200"
            />
            <Node
              icon={User}
              title="Disable User"
              description="Suspend user account"
              color="border-slate-200"
            />
            <Node
              icon={Mail}
              title="Send Email"
              description="Notify via email"
              color="border-slate-200"
            />
            <Node
              icon={MessageSquare}
              title="Send Slack Message"
              description="Notify a channel"
              color="border-slate-200"
            />
            <Node
              icon={Terminal}
              title="Run Command"
              description="Execute a script"
              color="border-slate-200"
            />
          </div>
        </aside>

        {/* Center Canvas: The Workflow */}
        <main className="flex-1 bg-slate-50/50 relative overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>

          {/* Static representation of the node-based workflow */}
          <div className="relative p-16 space-y-16 flex flex-col items-center">
            <Node
              icon={ShieldAlert}
              title="Event Trigger"
              description="Severity is High"
              color="border-blue-500"
            />
            <Node
              icon={Server}
              title="Isolate Endpoint"
              description="Block network access"
              color="border-blue-500"
            />
            <Node
              icon={Mail}
              title="Send Email"
              description="To: soc@thecatalyst.io"
              color="border-blue-500"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
