"use client";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";

export default function CreateServicePanel({ isOpen, onClose, onUpdate }) {
  const [name, setName] = useState("");
  const [prefilter, setPrefilter] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, prefilter_keyword: prefilter }),
      });
      if (!response.ok) throw new Error("Failed to create service");
      onUpdate(); // Refresh the main page data
      onClose(); // Close the panel
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        {/* ... Backdrop ... */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full">
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <form
                    onSubmit={handleSubmit}
                    className="flex h-full flex-col divide-y divide-slate-200 bg-white shadow-xl">
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-slate-900">
                            Create New Service
                          </Dialog.Title>
                          <button
                            type="button"
                            className="relative rounded-md bg-white text-slate-400 hover:text-slate-500"
                            onClick={onClose}>
                            <X className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        <div className="space-y-6">
                          <div>
                            <label
                              htmlFor="service-name"
                              className="block text-sm font-medium leading-6 text-slate-900">
                              Service Name
                            </label>
                            <input
                              type="text"
                              id="service-name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="mt-2 block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                              placeholder="e.g., Apache"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="prefilter-keyword"
                              className="block text-sm font-medium leading-6 text-slate-900">
                              Prefilter Keyword
                            </label>
                            <input
                              type="text"
                              id="prefilter-keyword"
                              value={prefilter}
                              onChange={(e) => setPrefilter(e.target.value)}
                              required
                              className="mt-2 block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                              placeholder="e.g., HTTP"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      <button
                        type="button"
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                        onClick={onClose}>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-4 inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                        Create Service
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
