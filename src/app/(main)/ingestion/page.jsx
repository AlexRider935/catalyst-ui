"use client";

import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { Rss, Plus, Loader2, AlertTriangle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

import SourceList from "./components/SourceList";
import SourceDetail from "./components/SourceDetail";

// --- Reusable Delete Confirmation Modal ---
const DeleteConfirmationModal = ({ source, isOpen, onClose, onDelete }) => (
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
                    Delete Source
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-slate-500">
                      Are you sure you want to delete the source{" "}
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
                  onClick={onDelete}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto">
                  Delete
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto">
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
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sourceToDelete, setSourceToDelete] = useState(null);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ingestion/sources");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not load ingestion sources.");
      }
      setSources(data);

      if (selectedSource) {
        const updatedSelected = data.find((s) => s.id === selectedSource.id);
        setSelectedSource(
          updatedSelected || (data.length > 0 ? data[0] : null)
        );
      } else if (data.length > 0) {
        setSelectedSource(data[0]);
      } else {
        setSelectedSource(null);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleDelete = () => {
    if (!sourceToDelete) return;

    const apiPromise = fetch(`/api/ingestion/sources/${sourceToDelete.id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to delete source.");
      }
      return res.json();
    });

    toast.promise(apiPromise, {
      loading: `Deleting ${sourceToDelete.name}...`,
      success: (result) => {
        setSourceToDelete(null);
        refreshData(); // Refresh data after deletion
        return result.message || "Source deleted!";
      },
      error: (err) => {
        setSourceToDelete(null);
        return `Failed: ${err.toString()}`;
      },
    });
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <DeleteConfirmationModal
        isOpen={!!sourceToDelete}
        onClose={() => setSourceToDelete(null)}
        onDelete={handleDelete}
        source={sourceToDelete}
      />

      <div className="flex flex-col h-full space-y-6">
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Ingestion Studio
            </h1>
            <p className="mt-1 text-slate-500">
              Manage and monitor your data sources in real-time.
            </p>
          </div>
          <Link href="/ingestion/new">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              <Plus size={18} /> New Source
            </button>
          </Link>
        </div>

        <div className="flex-1 min-h-0">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full">
              {isLoading ? (
                <div className="flex justify-center items-center h-full rounded-xl shadow-sm border border-slate-200/80 bg-white">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : sources.length > 0 ? (
                <div className="flex h-full rounded-xl shadow-sm border border-slate-200/80 bg-white overflow-hidden">
                  <SourceList
                    sources={sources}
                    selectedSource={selectedSource}
                    onSelect={setSelectedSource}
                    isLoading={isLoading}
                    onDeleteSource={setSourceToDelete}
                  />
                  <SourceDetail
                    key={selectedSource ? selectedSource.id : "empty"}
                    source={selectedSource}
                    onUpdate={refreshData}
                    onDelete={setSourceToDelete}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center bg-white border-2 border-dashed border-slate-300 rounded-lg p-16 h-full">
                  <div className="p-4 mb-5 rounded-full bg-slate-100 text-slate-500">
                    <Rss size={48} />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-800">
                    No Data Sources Connected
                  </h2>
                  <p className="mt-2 max-w-lg text-slate-500">
                    Connect your first source to begin ingesting and analyzing
                    security data.
                  </p>
                  <Link
                    href="/ingestion/new"
                    className="mt-6 inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
                    <Plus size={18} /> Add New Source
                  </Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
