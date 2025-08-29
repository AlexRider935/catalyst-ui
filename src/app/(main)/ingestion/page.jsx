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

// Custom hook to fetch and periodically refresh agent data
const useAgents = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const POLLING_INTERVAL = 10000; // Refresh every 10 seconds

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
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  return { agents, setAgents, isLoading, error, mutate: fetchData };
};

const ConfirmDeleteDialog = ({ source, isOpen, onClose, onDelete }) => (
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
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle
                    className="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-base font-semibold leading-6 text-slate-900">
                    Delete Agent
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-slate-500">
                      Are you sure you want to delete the agent{" "}
                      <span className="font-bold text-slate-700">
                        {source?.name}
                      </span>
                      ? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                  onClick={onDelete}>
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto"
                  onClick={onClose}>
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

export default function IngestionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { agents, setAgents, isLoading, error, mutate } = useAgents();
  const [sourceToDelete, setSourceToDelete] = useState(null);

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
      const newUrl = `${pathname}?source_id=${agents[0].id}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [isLoading, agents, selectedSourceId, pathname, router]);

  const handleSelectSource = (source) => {
    const newUrl = source ? `${pathname}?source_id=${source.id}` : pathname;
    router.push(newUrl, { scroll: false });
  };

  const handleDelete = async () => {
    if (!sourceToDelete) return;
    const agentName = sourceToDelete.name;
    const originalAgents = [...agents];
    setAgents((prev) => prev.filter((s) => s.id !== sourceToDelete.id));
    if (selectedSource?.id === sourceToDelete.id) {
      const firstAgent = agents.filter((s) => s.id !== sourceToDelete.id)[0];
      handleSelectSource(firstAgent || null);
    }
    setSourceToDelete(null);
    const deletePromise = fetch(`/api/agents/${sourceToDelete.id}`, {
      method: "DELETE",
    });
    toast.promise(deletePromise, {
      loading: `Deleting ${agentName}...`,
      success: (res) => {
        if (!res.ok) throw new Error("Failed to delete from server.");
        return `${agentName} deleted successfully.`;
      },
      error: (err) => {
        setAgents(originalAgents);
        return `Failed to delete ${agentName}: ${err.message}`;
      },
    });
  };

  const renderContent = () => {
    if (isLoading && agents.length === 0) {
      return (
        <div className="flex justify-center items-center h-full rounded-xl shadow-sm border border-slate-200/80 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      );
    }
    if (error && agents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center bg-white border-2 border-dashed border-red-300 rounded-lg p-16 h-full">
          <div className="p-4 mb-5 rounded-full bg-red-100 text-red-500">
            <ServerCrash size={48} />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800">
            Failed to Load Agents
          </h2>
          <p className="mt-2 max-w-lg text-slate-500">
            There was an error communicating with the API.
          </p>
          <p className="mt-2 text-xs text-red-600 font-mono bg-red-50 p-2 rounded">
            {error}
          </p>
        </div>
      );
    }
    if (agents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center bg-white border-2 border-dashed border-slate-300 rounded-lg p-16 h-full">
          <div className="p-4 mb-5 rounded-full bg-slate-100 text-slate-500">
            <ShieldCheck size={48} />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800">
            No Agents Enrolled
          </h2>
          <p className="mt-2 max-w-lg text-slate-500">
            Register your first agent to begin monitoring your endpoints.
          </p>
          <Link
            href="/ingestion/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            <Plus size={18} /> Register New Agent
          </Link>
        </div>
      );
    }
    return (
      <div className="flex h-full rounded-xl shadow-sm border border-slate-200/80 bg-white overflow-hidden">
        <SourceList
          sources={agents}
          selectedSource={selectedSource}
          onSelect={handleSelectSource}
        />
        <SourceDetail
          key={selectedSource ? selectedSource.id : "empty"}
          source={selectedSource}
          onDeleteInitiated={setSourceToDelete}
          onUpdate={mutate} // This prop is essential for the refresh button to work
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
      <div className="flex flex-col h-full bg-slate-50 space-y-8">
        <header className="flex-shrink-0 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Agent Fleet Management
            </h1>
            <p className="mt-1 text-slate-500">
              Manage and monitor all active endpoint agents in real-time.
            </p>
          </div>
          <Link
            href="/ingestion/new"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
            <Plus size={18} /> Register New Agent
          </Link>
        </header>
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
