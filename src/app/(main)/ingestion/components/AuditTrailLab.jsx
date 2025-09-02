"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import {
  Loader2,
  GitCommit,
  User,
  PlusCircle,
  Trash2,
  Edit,
  Search,
  X,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";

// --- Sub-component: Audit Detail Modal ---
const AuditDetailModal = ({ event, isOpen, onClose }) => {
  if (!event || !event.details) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(event.details, null, 2));
    toast.success("Details copied to clipboard!");
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                  <Dialog.Title
                    as="h3"
                    className="text-base font-semibold text-slate-900">
                    Configuration Change Details
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6">
                  <pre className="text-xs bg-slate-50 text-slate-700 p-4 rounded-lg overflow-x-auto max-h-96">
                    <code>{JSON.stringify(event.details, null, 2)}</code>
                  </pre>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- Sub-component: Audit Event Timeline Item ---
const AuditEvent = ({ event, onSelectEvent }) => {
  const ACTION_ICONS = {
    "agent.created": {
      icon: PlusCircle,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    "agent.deleted": { icon: Trash2, color: "text-red-500", bg: "bg-red-100" },
    "agent.config.updated": {
      icon: Edit,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    default: { icon: GitCommit, color: "text-slate-500", bg: "bg-slate-100" },
  };
  const {
    icon: Icon,
    color,
    bg,
  } = ACTION_ICONS[event.action_type] || ACTION_ICONS.default;

  return (
    <div className="relative pl-10 py-4 group">
      <div className="absolute left-4 top-5 h-full border-l-2 border-slate-200 group-last:border-l-0"></div>
      <div
        className={`absolute left-0 top-4 h-8 w-8 rounded-full ${bg} flex items-center justify-center`}>
        <Icon size={16} className={color} />
      </div>
      <p className="font-medium text-slate-800 text-sm">{event.summary}</p>
      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
        <User size={12} />
        <span>
          by <span className="font-semibold text-slate-600">{event.actor}</span>
        </span>
        <span>•</span>
        <span title={new Date(event.created_at).toLocaleString()}>
          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
        </span>
      </div>
      {event.details && (
        <button
          onClick={() => onSelectEvent(event)}
          className="mt-2 text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
          <Eye size={12} /> View Details
        </button>
      )}
    </div>
  );
};

// --- Main AuditTrailTab Component ---
export default function AuditTrailTab({ agentId }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!agentId) return;
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/agents/${agentId}/audit`);
        if (!res.ok) throw new Error("Failed to fetch audit trail.");
        const data = await res.json();
        setLogs(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [agentId]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const searchTermMatch =
        searchTerm === "" ||
        log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchTerm.toLowerCase());

      const filterMatch = filter === "all" || log.action_type.includes(filter);

      return searchTermMatch && filterMatch;
    });
  }, [logs, searchTerm, filter]);

  const FilterButton = ({ type, label }) => (
    <button
      onClick={() => setFilter(type)}
      className={clsx(
        "px-3 py-1 text-sm font-semibold rounded-md transition-colors",
        filter === type
          ? "bg-slate-900 text-white"
          : "bg-white text-slate-600 hover:bg-slate-100"
      )}>
      {label}
    </button>
  );

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
      </div>
    );
  }

  return (
    <>
      {selectedEvent && (
        <AuditDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
        <div className="p-6 border-b border-slate-200/80">
          <h2 className="text-xl font-semibold text-slate-800">Audit Trail</h2>
          <p className="text-sm text-slate-500 mt-1">
            A permanent log of all administrative actions performed on this
            agent.
          </p>
        </div>
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg border">
            <FilterButton type="all" label="All" />
            <FilterButton type="created" label="Creations" />
            <FilterButton type="updated" label="Updates" />
            <FilterButton type="deleted" label="Deletions" />
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by summary or actor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
        <div className="p-6">
          {filteredLogs.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">
              No audit events match your criteria.
            </p>
          ) : (
            <div className="max-h-[30rem] overflow-y-auto">
              {filteredLogs.map((event) => (
                <AuditEvent
                  key={event.id}
                  event={event}
                  onSelectEvent={setSelectedEvent}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
