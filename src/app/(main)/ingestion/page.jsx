"use client";

import { useState, useMemo, Fragment, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import {
  ShieldCheck,
  Plus,
  Loader2,
  AlertTriangle,
  ServerCrash,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

import SourceList from "./components/SourceList";
import SourceDetail from "./components/SourceDetail";

// --- Custom hook: fetch + polling ---
const useAgents = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const POLLING_INTERVAL = 10000;

  const fetchData = async () => {
    try {
      const response = await fetch("/api/agents");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Could not load agents.");
      }
      const data = await response.json();
      setAgents(data);
      if (error) setError(null);
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to refresh agents: ${err.message}`, {
        id: "fetch-error",
      });
    } finally {
      if (isLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return { agents, setAgents, isLoading, error, mutate: fetchData };
};

// --- Confirm Delete Modal ---
const ConfirmDeleteDialog = ({ source, isOpen, onClose, onDelete }) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      {/* Overlay */}
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0">
        <div className="fixed inset-0 bg-black/40" />
      </Transition.Child>

      {/* Dialog Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95">
          <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <Dialog.Title className="text-lg font-semibold text-slate-900">
                  Delete Agent
                </Dialog.Title>
                <p className="mt-2 text-sm text-slate-600">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-800">
                    {source?.name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={onDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500">
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
);

// --- Page ---
export default function IngestionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { agents, setAgents, isLoading, error, mutate } = useAgents();
  const [sourceToDelete, setSourceToDelete] = useState(null);

  // --- selection logic ---
  const selectedSourceId = searchParams.get("source_id");
  const selectedSource = useMemo(() => {
    if (!selectedSourceId || agents.length === 0) return agents[0] || null;
    return agents.find((s) => s.id === selectedSourceId) || agents[0] || null;
  }, [agents, selectedSourceId]);

  useEffect(() => {
    if (
      !isLoading &&
      agents.length > 0 &&
      !agents.some((s) => s.id === selectedSourceId)
    ) {
      router.replace(`${pathname}?source_id=${agents[0].id}`, {
        scroll: false,
      });
    }
  }, [isLoading, agents, selectedSourceId, pathname, router]);

  // --- handlers ---
  const handleSelectSource = (source) => {
    router.push(source ? `${pathname}?source_id=${source.id}` : pathname, {
      scroll: false,
    });
  };

  const handleDelete = async () => {
    if (!sourceToDelete) return;
    const agentName = sourceToDelete.name;
    const originalAgents = [...agents];

    setAgents((prev) => prev.filter((s) => s.id !== sourceToDelete.id));
    if (selectedSource?.id === sourceToDelete.id) {
      const next = agents.filter((s) => s.id !== sourceToDelete.id)[0];
      handleSelectSource(next || null);
    }
    setSourceToDelete(null);

    const deletePromise = fetch(`/api/agents/${sourceToDelete.id}`, {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: `Deleting ${agentName}...`,
      success: (res) => {
        if (!res.ok) throw new Error("Failed to delete on server.");
        return `${agentName} deleted successfully.`;
      },
      error: (err) => {
        setAgents(originalAgents);
        return `Failed to delete ${agentName}: ${err.message}`;
      },
    });
  };

  // --- states UI ---
  const renderContent = () => {
    if (isLoading && agents.length === 0) {
      return (
        <div className="flex items-center justify-center h-full rounded-xl border border-slate-200 bg-white shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      );
    }

    if (error && agents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-12 text-center rounded-xl border-2 border-dashed border-red-300 bg-white">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
            <ServerCrash size={32} />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">
            Failed to Load Agents
          </h2>
          <p className="mt-2 text-slate-500">
            There was an error communicating with the API.
          </p>
          <pre className="mt-4 text-xs text-red-600 font-mono bg-red-50 px-3 py-2 rounded">
            {error}
          </pre>
        </div>
      );
    }

    if (agents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-12 text-center rounded-xl border-2 border-dashed border-slate-300 bg-white">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">
            No Agents Enrolled
          </h2>
          <p className="mt-2 text-slate-500">
            Register your first agent to begin monitoring endpoints.
          </p>
          <Link
            href="/ingestion/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            <Plus size={16} /> Register New Agent
          </Link>
        </div>
      );
    }

    return (
      <div className="flex h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <SourceList
          sources={agents}
          selectedSource={selectedSource}
          onSelect={handleSelectSource}
        />
        <SourceDetail
          key={selectedSource ? selectedSource.id : "empty"}
          source={selectedSource}
          onDeleteInitiated={setSourceToDelete}
          onUpdate={mutate}
        />
      </div>
    );
  };

  return (
    <>
      <Toaster position="bottom-right" containerClassName="font-sans" />
      <ConfirmDeleteDialog
        isOpen={!!sourceToDelete}
        onClose={() => setSourceToDelete(null)}
        onDelete={handleDelete}
        source={sourceToDelete}
      />

      <div className="flex flex-col h-full bg-slate-50 space-y-6">
        {/* Page Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Agent Fleet Management
            </h1>
            <p className="mt-1 text-slate-500">
              Manage and monitor all enrolled endpoint agents in real-time.
            </p>
          </div>
          <Link
            href="/ingestion/new"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
            <Plus size={16} /> Register New Agent
          </Link>
        </header>

        {/* Main content */}
        <main className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLoading && agents.length === 0 ? "loading" : "content"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full">
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
