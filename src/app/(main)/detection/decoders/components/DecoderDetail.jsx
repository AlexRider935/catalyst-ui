"use client";

import { useState, Fragment, useEffect } from "react";
import {
  Plus,
  FileCode2,
  Pencil,
  LayoutList,
  Trash2,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import { Disclosure, Transition } from "@headlessui/react";
import clsx from "clsx";
import StatusToggle from "./StatusToggle"; // Ensure this path is correct

const DecoderSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="bg-white p-4 rounded-lg border border-slate-200 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-slate-200 rounded w-1/2"></div>
          <div className="flex items-center gap-4">
            <div className="h-6 w-11 bg-slate-200 rounded-full"></div>
            <div className="h-8 w-16 bg-slate-200 rounded-md"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function DecoderDetail({
  service,
  onEditDecoder,
  onCreateDecoder,
  onDeleteDecoder,
  onUpdate,
}) {
  const [copiedStates, setCopiedStates] = useState({});
  // --- FIX: Internal state for optimistic updates ---
  const [internalDecoders, setInternalDecoders] = useState(service?.decoders);

  // --- FIX: Effect to sync internal state with props from parent ---
  useEffect(() => {
    setInternalDecoders(service?.decoders);
  }, [service]);

  const handleCopy = (text, decoderId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates((prev) => ({ ...prev, [decoderId]: true }));
      setTimeout(
        () => setCopiedStates((prev) => ({ ...prev, [decoderId]: false })),
        2000
      );
    });
  };

  // --- FIX: Re-architected with optimistic updates and rollback ---
  const handleStatusChange = async (decoderToUpdate, newStatus) => {
    const originalDecoders = internalDecoders;

    // 1. Optimistically update the UI for instant feedback
    setInternalDecoders(
      originalDecoders.map((d) =>
        d.id === decoderToUpdate.id ? { ...d, isActive: newStatus } : d
      )
    );

    try {
      // 2. Construct the payload for the API
      const payload = {
        name: decoderToUpdate.name,
        log_example: decoderToUpdate.log_example,
        regex_pattern: decoderToUpdate.regex,
        is_active: newStatus,
      };

      const response = await fetch(`/api/decoders/${decoderToUpdate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update decoder status");
      }

      // 3. On success, tell the parent to refresh its master list of data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Update Error:", error.message);
      // 4. On failure, roll back the UI to its original state
      setInternalDecoders(originalDecoders);
    }
  };

  if (!service) {
    return (
      <section className="flex-1 h-full flex items-center justify-center bg-slate-50 rounded-r-xl">
        <div className="text-center p-8">
          <LayoutList className="h-16 w-16 text-slate-300 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Select a Service
          </h2>
          <p className="mt-1 text-slate-500">
            Choose a service to view its decoders.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 h-full flex flex-col bg-slate-50/50 rounded-r-xl">
      <div className="p-4 sm:p-6 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {service.name} Decoders
            </h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
              <p>
                Prefilter:{" "}
                <code className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                  {service.prefilter}
                </code>
              </p>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <p>{internalDecoders?.length || 0} Decoders</p>
            </div>
          </div>
          <button
            onClick={onCreateDecoder}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
            <Plus className="h-5 w-5" />
            Create Decoder
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {internalDecoders === undefined ? (
          <DecoderSkeleton />
        ) : internalDecoders.length > 0 ? (
          <div className="space-y-3">
            {internalDecoders.map((decoder) => (
              <Disclosure
                key={decoder.id}
                as="div"
                className="group bg-white border border-slate-200 rounded-lg shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                {({ open }) => (
                  <>
                    <div className="flex w-full items-center justify-between p-4 text-left">
                      <Disclosure.Button
                        as="div"
                        className="flex flex-1 items-center gap-4 cursor-pointer">
                        <FileCode2 className="h-8 w-8 text-slate-400 flex-shrink-0" />
                        <div>
                          <h3 className="text-base font-semibold text-slate-800">
                            {decoder.name}
                          </h3>
                        </div>
                        <ChevronDown
                          className={clsx(
                            "h-5 w-5 text-slate-400 transition-transform ml-4",
                            open && "rotate-180"
                          )}
                        />
                      </Disclosure.Button>
                      <div className="flex items-center gap-2 pl-4">
                        <StatusToggle
                          isActive={decoder.isActive}
                          onChange={(newStatus) =>
                            handleStatusChange(decoder, newStatus)
                          }
                        />
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditDecoder(decoder)}
                            className="p-2 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                            title="Edit Decoder">
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteDecoder(decoder)}
                            className="p-2 rounded-md text-red-500 hover:bg-red-100 hover:text-red-700"
                            title="Delete Decoder">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0">
                      <Disclosure.Panel className="px-4 pb-4 pt-2 border-t border-slate-200">
                        <div className="pl-12 space-y-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              Example Log
                            </p>
                            <pre className="mt-1 w-full overflow-x-auto rounded-md bg-slate-50 p-2 text-xs text-slate-700 border border-slate-200 whitespace-pre-wrap break-all">
                              <code>{decoder.log_example}</code>
                            </pre>
                          </div>
                          <div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Regular Expression
                              </p>
                              <button
                                onClick={() =>
                                  handleCopy(decoder.regex, decoder.id)
                                }
                                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                                {copiedStates[decoder.id] ? (
                                  <Check size={14} className="text-green-500" />
                                ) : (
                                  <Copy size={14} />
                                )}
                                {copiedStates[decoder.id] ? "Copied!" : "Copy"}
                              </button>
                            </div>
                            <pre className="mt-1 w-full overflow-x-auto rounded-md bg-slate-50 p-2 text-xs text-slate-700 border border-slate-200 whitespace-pre-wrap break-all">
                              <code>{decoder.regex}</code>
                            </pre>
                          </div>
                        </div>
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileCode2 className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">
              No Decoders Found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Click "Create Decoder" to add the first one for this service.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
