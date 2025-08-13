"use client";

import Link from "next/link";
import { ArrowLeft, Share2, Play } from "lucide-react";

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Input & Logic */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">
                1. Paste Raw Log Sample
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
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">
                2. Define Parsing Pattern (Grok)
              </h2>
            </div>
            <div className="p-4">
              <textarea
                className="w-full h-32 p-4 font-mono text-sm bg-slate-50 rounded-lg"
                defaultValue={samplePattern}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Output & Metadata */}
        <div className="space-y-6 lg:sticky lg:top-10">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">
                3. View Structured Output
              </h2>
              <button className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
                <Play size={14} /> Test
              </button>
            </div>
            <div className="p-4">
              <pre className="w-full h-64 p-4 font-mono text-xs bg-slate-900 text-green-400 rounded-lg overflow-auto">
                {JSON.stringify(sampleOutput, null, 2)}
              </pre>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
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
