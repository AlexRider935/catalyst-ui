'use client';

import Link from 'next/link';
import { ArrowLeft, GitBranch } from 'lucide-react';

export default function NewRulePage() {
  const ruleLogicPlaceholder = `source.type = 'aws_cloudtrail' AND\nevent.name = 'ConsoleLogin' AND\nresult = 'Failure' AND\nCOUNT(event.id) >= 5 BY source.ip DURATION 10m`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/detection/rules" className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                <ArrowLeft size={22} />
            </Link>
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Create New Detection Rule</h1>
                <p className="mt-1 text-slate-500">Define the logic and actions for a new detection rule.</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button type="button" className="rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                Cancel
            </button>
            <button
                type="button"
                className="rounded-lg border border-transparent bg-blue-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
                Save Rule
            </button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Rule Logic */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <GitBranch size={16}/> Rule Logic
                </h2>
                <p className="text-xs text-slate-500 mt-1">Write your detection logic using the Catalyst Query Language (CQL).</p>
            </div>
            <div className="p-4">
                <textarea 
                    className="w-full h-96 p-4 font-mono text-sm bg-slate-900 text-green-400 rounded-lg border-slate-700 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={ruleLogicPlaceholder}
                />
            </div>
        </div>

        {/* Right Column: Metadata & Conditions */}
        <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                <h3 className="font-semibold text-slate-800">Details</h3>
                <div className="space-y-4 mt-4">
                    <div>
                        <label htmlFor="ruleName" className="block text-sm font-medium text-slate-700">Rule Name</label>
                        <input type="text" name="ruleName" id="ruleName" placeholder="e.g., AWS Console Brute Force" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="ruleDescription" className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea name="ruleDescription" id="ruleDescription" rows={3} placeholder="A brief description of what this rule detects." className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm" />
                    </div>
                </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                <h3 className="font-semibold text-slate-800">Conditions</h3>
                 <div className="space-y-4 mt-4">
                    <div>
                        <label htmlFor="severity" className="block text-sm font-medium text-slate-700">Severity</label>
                        <select id="severity" name="severity" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Critical</option>
                        </select>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}