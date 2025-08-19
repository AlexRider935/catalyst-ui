"use client";

import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { TestTube, ChevronDown, CheckCircle, XCircle } from "lucide-react";

// This is the self-contained component for the Test Bench UI and logic
export default function LiveTestBench() {
  const [batchLogs, setBatchLogs] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [expandedResults, setExpandedResults] = useState(new Set());

  // Effect to "stream" results in one by one
  useEffect(() => {
    if (batchResults.length > 0) {
      setDisplayedResults([]);
      const interval = setInterval(() => {
        setDisplayedResults((prev) => {
          if (prev.length < batchResults.length) {
            return [...prev, batchResults[prev.length]];
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [batchResults]);

  const handleProcessBatch = async () => {
    setIsProcessing(true);
    setBatchResults([]);
    setExpandedResults(new Set());
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

  const toggleRowExpansion = (index) => {
    setExpandedResults((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <main className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Paste Logs
          </h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Paste raw logs below. Each new line will be tested against all
            active decoders.
          </p>
          <div className="mt-4 rounded-lg border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
            <textarea
              value={batchLogs}
              onChange={(e) => setBatchLogs(e.target.value)}
              rows={25}
              className="w-full p-4 rounded-lg font-mono text-xs bg-transparent focus:outline-none resize-none"
              placeholder="Jan 1 05:33:01 myhost sshd[1234]: Failed password for root..."
            />
          </div>
          <button
            onClick={handleProcessBatch}
            disabled={isProcessing}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {isProcessing ? "Processing..." : "Process Logs"}
          </button>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Live Results Feed
          </h2>
          <div className="mt-4 rounded-lg h-[calc(100%-3rem)]">
            <div className="h-full overflow-y-auto pr-2">
              {displayedResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                  <TestTube size={48} className="mb-4 opacity-50" />
                  <p>Results will stream in here once processed.</p>
                </div>
              ) : (
                <div className="relative pl-6 before:absolute before:left-3 before:top-2 before:h-full before:w-px before:bg-slate-200">
                  <AnimatePresence>
                    {displayedResults.map((result, index) => (
                      <ResultCard
                        key={index}
                        result={result}
                        isExpanded={expandedResults.has(index)}
                        onToggle={() => toggleRowExpansion(index)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const ResultCard = ({ result, isExpanded, onToggle }) => {
  const isSuccess = result.status === "Success";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative mb-4">
      <div
        className={clsx(
          "absolute left-[-21px] top-2 h-5 w-5 rounded-full",
          isSuccess
            ? "bg-green-500 border-4 border-white"
            : "bg-red-500 border-4 border-white"
        )}></div>
      <div
        className={clsx(
          "bg-white rounded-lg border p-4 transition-all",
          isSuccess
            ? "cursor-pointer hover:border-blue-400 hover:shadow-md"
            : "border-slate-200"
        )}
        onClick={isSuccess ? onToggle : undefined}>
        <div className="flex items-start justify-between">
          <p
            className="font-mono text-xs text-slate-700 pr-4"
            title={result.log}>
            {result.log}
          </p>
          <span
            className={clsx(
              "inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
              isSuccess
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            )}>
            {result.status}
          </span>
        </div>
        {isSuccess && (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-semibold text-slate-800">
                {result.decoder}
              </span>
              <span className="text-slate-500"> / {result.service}</span>
            </div>
            <ChevronDown
              className={clsx(
                "h-5 w-5 text-slate-400 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </div>
        )}
      </div>
      <AnimatePresence>
        {isExpanded && result.data && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: "12px" }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden">
            <div className="bg-slate-100/50 p-4 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Extracted Fields
              </p>
              <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-xs">
                {Object.entries(result.data).map(([key, value]) => (
                  <Fragment key={key}>
                    <dt className="font-medium text-slate-500 text-right">
                      {key}
                    </dt>
                    <dd className="font-mono text-slate-800">
                      {String(value)}
                    </dd>
                  </Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
