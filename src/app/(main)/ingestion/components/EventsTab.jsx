"use client";

import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  Loader2,
  FileText,
  ShieldAlert,
  Terminal,
  Eye,
  Copy,
  X,
  ArrowUpDown,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";

// --- Sub-component: Event Detail Modal ---
const EventDetailModal = ({ event, isOpen, onClose }) => {
  const [sortOrders, setSortOrders] = useState({
    Stdout: "asc",
    Stderr: "asc",
    Output: "asc",
  });

  const toggleSortOrder = (label) => {
    setSortOrders((prev) => ({
      ...prev,
      [label]: prev[label] === "asc" ? "desc" : "asc",
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(event.data, null, 2));
    toast.success("Event data copied!");
  };

  const renderCommandOutput = () => {
    const { output, stdout, stderr } = event.data || {};
    const hasStdout = stdout && stdout.trim().length > 0;
    const hasStderr = stderr && stderr.trim().length > 0;
    const hasOutput = output && output.trim().length > 0;

    if (!hasStdout && !hasStderr && !hasOutput) {
      return (
        <p className="text-sm text-slate-500 italic">(no output captured)</p>
      );
    }

    const rows = [];
    if (hasStdout)
      rows.push({ label: "Stdout", value: stdout, color: "text-green-600" });
    if (hasStderr)
      rows.push({ label: "Stderr", value: stderr, color: "text-red-600" });
    if (hasOutput)
      rows.push({ label: "Output", value: output, color: "text-blue-600" });

    // --- helper: extract leading number ---
    const getLineNumber = (line) => {
      const match = line.trim().match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };

    return (
      <div className="overflow-auto rounded-lg border border-slate-200 bg-slate-50 max-h-[70vh]">
        <table className="w-full text-xs font-mono text-slate-800 table-fixed border-collapse">
          <thead className="bg-slate-100 text-slate-700 uppercase text-[0.7rem] tracking-wide sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left w-28 border-r border-slate-200">
                Stream
              </th>
              <th className="px-3 py-2 text-left">Content</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              let lines = row.value.split("\n");

              // sort lines by leading number if present
              lines = lines.sort((a, b) => {
                const na = getLineNumber(a);
                const nb = getLineNumber(b);
                if (na !== null && nb !== null) {
                  return sortOrders[row.label] === "asc" ? na - nb : nb - na;
                }
                if (na !== null) return -1;
                if (nb !== null) return 1;
                return 0;
              });

              return (
                <div className="overflow-auto rounded-lg border border-slate-200 bg-slate-50 max-h-[70vh]">
                  <table className="w-full text-xs font-mono text-slate-800 table-fixed border-collapse">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[0.7rem] tracking-wide sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left w-24 border-r border-slate-200">
                          Stream
                        </th>
                        <th className="px-3 py-2 text-left flex items-center gap-1">
                          Content
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rowIdx) => {
                        let lines = row.value.split("\n");

                        // sort lines by leading number if present
                        lines = lines.sort((a, b) => {
                          const na = getLineNumber(a);
                          const nb = getLineNumber(b);
                          if (na !== null && nb !== null) {
                            return sortOrders[row.label] === "asc"
                              ? na - nb
                              : nb - na;
                          }
                          if (na !== null) return -1;
                          if (nb !== null) return 1;
                          return 0;
                        });

                        return lines.map((line, lineIdx) => (
                          <tr
                            key={`${row.label}-${rowIdx}-${lineIdx}-${line}`}
                            className="border-t border-slate-200 align-top hover:bg-slate-100/70">
                            {lineIdx === 0 ? (
                              <td
                                rowSpan={lines.length}
                                className={`px-3 py-2 font-semibold ${row.color} border-r border-slate-200`}>
                                {row.label}
                                <button
                                  onClick={() =>
                                    setSortOrders((prev) => ({
                                      ...prev,
                                      [row.label]:
                                        prev[row.label] === "asc"
                                          ? "desc"
                                          : "asc",
                                    }))
                                  }
                                  className="ml-2 text-slate-500 hover:text-slate-700">
                                  <ArrowUpDown size={12} />
                                </button>
                              </td>
                            ) : null}
                            <td className="px-3 py-1 whitespace-pre break-words">
                              {line || (
                                <span className="text-slate-400">·</span>
                              )}
                            </td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-4xl h-[90vh] transform overflow-hidden rounded-xl bg-white shadow-lg transition-all flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-200">
                  <Dialog.Title className="text-lg font-semibold text-slate-800">
                    Event Details
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition">
                    <X size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="relative p-6 flex-1 overflow-y-auto">
                  <button
                    onClick={handleCopy}
                    className="absolute top-6 right-6 flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200">
                    <Copy size={14} /> Copy JSON
                  </button>

                  {event.data?.type === "command_output" ? (
                    <div>
                      <p className="mb-3 text-sm font-medium text-slate-700">
                        Command Output
                      </p>
                      {renderCommandOutput()}
                    </div>
                  ) : (
                    <pre className="text-xs bg-slate-50 text-slate-700 p-4 rounded-lg overflow-x-auto max-h-[28rem]">
                      <code>{JSON.stringify(event.data, null, 2)}</code>
                    </pre>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- Sub-component: Event Renderer ---
const Event = ({ event, onSelectEvent }) => {
  const eventType = event.data?.type || "log";
  const eventInfo = {
    log: {
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
      title: "Log Entry Recorded",
    },
    fim: {
      icon: ShieldAlert,
      color: "bg-amber-100 text-amber-600",
      title: `File ${event.data.action}`,
    },
    command_output: {
      icon: Terminal,
      color: "bg-indigo-100 text-indigo-600",
      title: `Command Executed: ${event.data.alias}`,
    },
    default: {
      icon: FileText,
      color: "bg-slate-100 text-slate-500",
      title: "Generic Event",
    },
  };
  const {
    icon: Icon,
    color,
    title,
  } = eventInfo[eventType] || eventInfo.default;

  let description = "";
  if (eventType === "log") description = event.data.message;
  if (eventType === "fim") description = event.data.path;
  if (eventType === "command_output") description = event.data.command;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="group flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-slate-50 transition">
      <div className={clsx("p-2 rounded-full", color)}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm truncate">{title}</p>
        <p className="text-xs text-slate-500 truncate">{description}</p>
      </div>
      <div className="text-xs text-slate-400 font-mono shrink-0">
        {format(new Date(event.received_at), "HH:mm:ss")}
      </div>
      <button
        onClick={() => onSelectEvent(event)}
        className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 transition">
        <Eye size={14} /> View
      </button>
    </motion.div>
  );
};

// --- Main EventsTab Component ---
export default function EventsTab({ agentId }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (!agentId) return;
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/agents/${agentId}/events`);
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        toast.error(error.message, { id: "fetch-events-error" });
      } finally {
        if (isLoading) setIsLoading(false);
      }
    };

    fetchEvents();
    const intervalId = setInterval(fetchEvents, 15000);
    return () => clearInterval(intervalId);
  }, [agentId]);

  return (
    <>
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Live Event Stream
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Showing the 20 most recent events from this agent, updating every
            15s.
          </p>
        </div>

        {/* Body */}
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span>Loading events...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">
                No recent events found for this agent.
              </p>
            </div>
          ) : (
            <div className="max-h-[30rem] overflow-y-auto divide-y divide-slate-100">
              <AnimatePresence>
                {events.map((event) => (
                  <Event
                    key={event.id}
                    event={event}
                    onSelectEvent={setSelectedEvent}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
