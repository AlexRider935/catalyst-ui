"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function TestResultsModal({ results, isOpen, onClose }) {
  if (!results) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div
                      className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                        results.failed > 0 ? "bg-red-100" : "bg-green-100"
                      } sm:mx-0 sm:h-10 sm:w-10`}>
                      {results.failed > 0 ? (
                        <XCircle className="h-6 w-6 text-red-600" />
                      ) : (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-slate-900">
                        Integrity Test Results
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-slate-500">
                          The test suite has completed. Here is the summary.
                        </p>
                        <div className="mt-4 flex justify-around text-center">
                          <div className="px-4">
                            <p className="text-2xl font-bold text-green-600">
                              {results.passed}
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                              PASSED
                            </p>
                          </div>
                          <div className="px-4">
                            <p className="text-2xl font-bold text-red-600">
                              {results.failed}
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                              FAILED
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {results.failures && results.failures.length > 0 && (
                  <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />{" "}
                      Failed Decoders
                    </h4>
                    <ul
                      role="list"
                      className="mt-2 divide-y divide-slate-200 text-sm max-h-48 overflow-y-auto">
                      {results.failures.map((fail, idx) => (
                        <li key={idx} className="py-2">
                          <span className="font-semibold text-red-700">
                            {fail.decoderName}
                          </span>
                          <span className="text-slate-500">
                            {" "}
                            (in Service: {fail.serviceName})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={onClose}>
                    Acknowledge
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
