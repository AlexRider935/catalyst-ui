"use client";

import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  TestTube,
  ChevronDown,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Archive,
  ShieldAlert,
  Terminal,
  Search, // For pivot actions
} from "lucide-react";

// --- Helper to identify interesting fields for pivot actions ---
const isInterestingField = (key) => {
  const interestingKeys = ["ip", "host", "user", "id", "arn"];
  const lowerKey = key.toLowerCase();
  return interestingKeys.some((k) => lowerKey.includes(k));
};

// This is the self-contained component for the Test Bench UI and logic
export default function LiveTestBench() {
  const [batchLogs, setBatchLogs] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [displayedResults, setDisplayedResults] = useState([]);

  // Effect to "stream" results in one by one for a dynamic feel
  useEffect(() => {
    if (batchResults.length > 0) {
      setDisplayedResults([]);
      const interval = setInterval(() => {
        setDisplayedResults((prev) => {
          if (prev.length < batchResults.length) {
            const resultWithTimestamp = {
              ...batchResults[prev.length],
              timestamp: new Date(),
            };
            return [...prev, resultWithTimestamp];
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [batchResults]);

  const handleProcessBatch = async () => {
    setIsProcessing(true);
    setBatchResults([]);
    try {
      const response = await fetch("/api/decoders/process-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: batchLogs }),
      });
      if (!response.ok) throw new Error("Failed to process logs");
      const results = await response.json();
      setBatchResults(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setBatchLogs("");
    setBatchResults([]);
    setDisplayedResults([]);
  };

  return (
    <div className="flex flex-col h-full space-y-8">
      {/* --- HEADER --- */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Live Test Bench</h1>
          <p className="mt-1 text-slate-500">
            Test raw logs against all active decoders in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClear}
            className="rounded-lg border border-slate-300 bg-white py-2 px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50">
            Clear
          </button>
          <button
            onClick={handleProcessBatch}
            disabled={isProcessing || !batchLogs}
            className={clsx(
              "inline-flex w-36 items-center justify-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800",
              "focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2",
              "disabled:opacity-50"
            )}>
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            {isProcessing ? "Processing..." : "Process"}
          </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="flex flex-col rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <div className="p-4 border-b border-slate-200/80">
            <h2 className="font-semibold text-slate-800">Log Input</h2>
          </div>
          <div className="p-2 flex-1 bg-slate-50/50 rounded-b-xl">
            <textarea
              value={batchLogs}
              onChange={(e) => setBatchLogs(e.target.value)}
              className="w-full h-full p-2 rounded-lg font-mono text-xs bg-transparent border-none focus:outline-none focus:ring-0 resize-none"
              placeholder="Jan 1 05:33:01 myhost sshd[1234]: Failed password for root..."
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="flex flex-col rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <div className="p-4 border-b border-slate-200/80">
            <h2 className="font-semibold text-slate-800">Results</h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {displayedResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <Terminal size={48} className="mb-4 opacity-50" />
                <p className="font-medium">Results will stream in here</p>
                <p className="text-sm">
                  Paste logs on the left and click "Process"
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {displayedResults.map((result, index) => (
                    <ResultCard key={index} result={result} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ResultCard = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSuccess = result.status === "Success";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={clsx(
        "bg-white rounded-lg border transition-all overflow-hidden shadow-sm hover:shadow-md",
        isSuccess ? "border-slate-200/80" : "border-red-300/50 bg-red-50/30"
      )}>
      <div
        className={clsx("flex items-start p-4", isSuccess && "cursor-pointer")}
        onClick={() => isSuccess && setIsExpanded(!isExpanded)}>
        <div className="flex-shrink-0 pt-0.5">
          {isSuccess ? (
            <CheckCircle className="h-5 w-5 text-blue-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <p className="font-mono text-xs text-slate-800 pr-4 break-all">
            {result.log}
          </p>
          {isSuccess && (
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                  {result.decoder}
                </span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="font-medium text-slate-600">{result.service}</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronDown
                  className={clsx(
                    "h-5 w-5 text-slate-400 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && result.data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden">
            <div className="border-t border-slate-200/80 p-4 bg-slate-50/70">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Extracted Fields
              </p>
              <div className="space-y-2">
                {Object.entries(result.data).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4 items-start group">
                    <div className="text-right font-medium text-slate-500 text-xs py-1">
                      {key}
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div className="font-mono text-xs bg-white border border-slate-200/80 rounded-md px-3 py-1 w-full break-words">
                        <span
                          className={clsx(
                            isInterestingField(key) &&
                              "text-blue-600 font-semibold"
                          )}>
                          {String(value)}
                        </span>
                      </div>
                      {isInterestingField(key) && (
                        <button
                          className="ml-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity"
                          title={`Search for ${value}`}>
                          <Search size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 transition-colors">
                  <Archive size={14} /> Save as Evidence
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-slate-800 rounded-lg shadow-sm hover:bg-slate-700 transition-colors">
                  <ShieldAlert size={14} /> Escalate to Case
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
