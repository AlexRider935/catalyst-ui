"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function CreateServicePanel({ isOpen, onClose, onUpdate }) {
  const [name, setName] = useState("");
  const [prefilter, setPrefilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reset form state when the panel opens or closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setName("");
        setPrefilter("");
        setError(null);
        setIsSubmitting(false);
      }, 300); // Delay to allow animation to finish
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, prefilter_keyword: prefilter }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create service");
      }
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      setError(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full">
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <form
                    onSubmit={handleSubmit}
                    className="flex h-full flex-col bg-white shadow-xl">
                    {/* --- HEADER --- */}
                    <div className="p-6 border-b border-slate-200 bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <Dialog.Title className="text-base font-semibold leading-6 text-slate-900">
                            Create New Service
                          </Dialog.Title>
                          <p className="mt-1 text-sm text-slate-500">
                            Define a new log source for the decoder engine.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="relative rounded-md text-slate-500 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={onClose}>
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    {/* --- FORM CONTENT --- */}
                    <div className="flex-1 overflow-y-auto px-6 py-8">
                      <div className="space-y-6">
                        <div>
                          <label
                            htmlFor="service-name"
                            className="block text-sm font-medium leading-6 text-slate-900">
                            Service Name
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              id="service-name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              placeholder="e.g., Nginx, AWS CloudTrail"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="prefilter-keyword"
                            className="block text-sm font-medium leading-6 text-slate-900">
                            Prefilter Keyword
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              id="prefilter-keyword"
                              value={prefilter}
                              onChange={(e) => setPrefilter(e.target.value)}
                              required
                              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              placeholder="e.g., nginx, cloudtrail.amazonaws.com"
                            />
                          </div>
                          <p className="mt-2 text-xs text-slate-500">
                            A unique keyword from the raw log used to quickly
                            identify and route it to this service's decoders.
                          </p>
                        </div>
                        {error && (
                          <div className="rounded-md bg-red-50 p-3">
                            <p className="text-sm font-medium text-red-700">
                              {error}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* --- FOOTER ACTIONS --- */}
                    <div className="flex flex-shrink-0 justify-end gap-3 px-6 py-4 border-t border-slate-200">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 bg-white py-2 px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                        onClick={onClose}>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={clsx(
                          "inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800",
                          "focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2",
                          "disabled:opacity-50"
                        )}>
                        {isSubmitting && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {isSubmitting ? "Creating..." : "Create Service"}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
