"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Play,
  HelpCircle,
  GitBranch,
  Map,
  ChevronsRight,
} from "lucide-react";

export default function NewDecoderPage() {
  const sampleLog = `127.0.0.1 - - [13/Aug/2025:15:30:00 +0000] "GET /api/v1/users HTTP/1.1" 200 1452 "-" "Mozilla/5.0"`;
  const samplePattern = `%{IPORHOST:client.ip} %{USER:user.name} %{USER:user.auth} \\[%{HTTPDATE:timestamp}\\] "%{WORD:http.request.method} %{DATA:url.path} HTTP/%{NUMBER:http.version}" %{NUMBER:http.response.status_code} %{NUMBER:http.response.body.bytes} "%{DATA:http.request.referrer}" "%{DATA:user_agent.original}"`;
  const sampleOutput = {
    "client.ip": "127.0.0.1",
    "user.name": "-",
    "user.auth": "-",
    timestamp: "13/Aug/2025:15:30:00 +0000",
    "http.request.method": "GET",
    "url.path": "/api/v1/users",
    "http.version": "1.1",
    "http.response.status_code": "200",
    "http.response.body.bytes": "1452",
    "http.request.referrer": "-",
    "user_agent.original": "Mozilla/5.0",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/detection/decoders"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Create New Decoder
            </h1>
            <p className="mt-1 text-slate-500">
              Parse and structure raw logs into the Catalyst Schema.
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
            Save Decoder
          </button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: The Workbench */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">
                1. Raw Log Samples
              </h2>
            </div>
            <div className="p-4">
              <textarea
                className="w-full h-32 p-4 font-mono text-sm bg-slate-50 rounded-lg"
                defaultValue={sampleLog}
              />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">
                2. Parsing Engine (Grok)
              </h2>
              <a
                href="#"
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                <HelpCircle size={14} /> Pattern Help
              </a>
            </div>
            <div className="p-4">
              <textarea
                className="w-full h-40 p-4 font-mono text-sm bg-slate-900 text-green-400 rounded-lg"
                defaultValue={samplePattern}
              />
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50/70 rounded-b-xl text-right">
              <button className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900">
                <Play size={14} /> Test Pattern
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Configuration */}
        <div className="space-y-6 lg:sticky lg:top-10">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">
                3. Structured Output
              </h2>
            </div>
            <div className="p-4">
              <pre className="w-full h-48 p-4 font-mono text-xs bg-slate-900 text-white rounded-lg overflow-auto">
                {JSON.stringify(sampleOutput, null, 2)}
              </pre>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Map size={16} /> 4. Schema Mapping
              </h2>
            </div>
            <div className="p-4 text-sm">
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                <span>Extracted Field</span>
                <span />
                <span>Catalyst Schema Field</span>
              </div>
              <div className="space-y-2">
                {Object.keys(sampleOutput)
                  .slice(0, 4)
                  .map((key) => (
                    <div
                      key={key}
                      className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        defaultValue={key}
                        className="w-full rounded-md border-slate-300 bg-slate-100 font-mono text-xs p-2"
                      />
                      <ChevronsRight size={16} className="text-slate-400" />
                      <select className="w-full rounded-md border-slate-300 text-xs p-2 focus:border-blue-500 focus:ring-blue-500">
                        <option>source.ip</option>
                        <option>destination.ip</option>
                        <option>user.name</option>
                        <option>timestamp</option>
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
            <h3 className="font-semibold text-slate-800">Decoder Details</h3>
            <div className="space-y-4 mt-4">
              <div>
                <label
                  htmlFor="decoderName"
                  className="block text-sm font-medium text-slate-700">
                  Decoder Name
                </label>
                <input
                  type="text"
                  name="decoderName"
                  id="decoderName"
                  placeholder="e.g., custom-nginx-access"
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
