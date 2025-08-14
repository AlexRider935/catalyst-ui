"use client";

import { useState, Fragment } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  History,
  TestTube2,
  X,
  AlertTriangle,
} from "lucide-react";
import { Menu, Transition, Switch } from "@headlessui/react";
import Link from "next/link";

// --- Reusable Components ---
const SettingsCard = ({ title, description, children, headerAction }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {headerAction && <div>{headerAction}</div>}
    </div>
    {children}
  </div>
);

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
      active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
    }`}>
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        active ? "bg-green-500" : "bg-slate-400"
      }`}></span>
    {active ? "Enabled" : "Disabled"}
  </span>
);

const TypeBadge = ({ type }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
      type === "System"
        ? "bg-slate-100 text-slate-600"
        : "bg-blue-100 text-blue-700"
    }`}>
    {type}
  </span>
);

// --- Delete Confirmation Modal ---
const DeleteDecoderModal = ({ decoder, onClose }) => {
  if (!decoder) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl m-4">
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Delete Decoder?
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Are you sure you want to delete the{" "}
            <strong className="text-slate-700 font-mono">{decoder.name}</strong>{" "}
            decoder? This action cannot be undone.
          </p>
        </div>
        <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={() => {
              console.log(`Deleting ${decoder.name}`);
              onClose();
            }}
            className="rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Decoders Page ---
export default function DecodersPage() {
  const [decoderToDelete, setDecoderToDelete] = useState(null);
  const decoderData = [
    {
      id: "dec-1",
      name: "aws-cloudtrail",
      type: "System",
      targetField: "aws.source",
      status: true,
      version: 3,
      lastModified: "2025-08-10",
      modifiedBy: "system",
    },
    {
      id: "dec-2",
      name: "nginx-access-log",
      type: "System",
      targetField: "nginx.access",
      status: true,
      version: 5,
      lastModified: "2025-07-22",
      modifiedBy: "system",
    },
    {
      id: "dec-3",
      name: "windows-security-event",
      type: "System",
      targetField: "winlog.eventdata",
      status: true,
      version: 8,
      lastModified: "2025-08-01",
      modifiedBy: "system",
    },
    {
      id: "dec-4",
      name: "custom-app-login",
      type: "Custom",
      targetField: "app.auth",
      status: true,
      version: 1,
      lastModified: "2025-08-12",
      modifiedBy: "Alex Rider",
    },
    {
      id: "dec-5",
      name: "legacy-firewall-syslog",
      type: "Custom",
      targetField: "syslog.legacy",
      status: false,
      version: 2,
      lastModified: "2025-06-15",
      modifiedBy: "Alex Rider",
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Decoders</h1>
            <p className="mt-1 text-slate-500">
              Manage the parsers that structure raw logs into a standardized
              schema.
            </p>
          </div>
          <Link href="/detection/decoders/new">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
              <Plus size={18} />
              New Decoder
            </button>
          </Link>
        </div>

        <SettingsCard>
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Filter size={16} /> Type
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left font-semibold text-slate-600">
                    Decoder Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left font-semibold text-slate-600">
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left font-semibold text-slate-600">
                    Target Field
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left font-semibold text-slate-600">
                    Last Modified
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left font-semibold text-slate-600">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left font-semibold text-slate-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {decoderData.map((decoder) => (
                  <tr key={decoder.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        {decoder.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Version {decoder.version}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <TypeBadge type={decoder.type} />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {decoder.targetField}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">
                        {decoder.lastModified}
                      </p>
                      <p className="text-xs text-slate-500">
                        by {decoder.modifiedBy}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge active={decoder.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Menu as="div" className="relative">
                        <Menu.Button className="p-2 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                          <MoreVertical size={16} />
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95">
                          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div className="py-1">
                              <Menu.Item>
                                <a
                                  href="#"
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                  <Edit size={14} /> Edit
                                </a>
                              </Menu.Item>
                              <Menu.Item>
                                <a
                                  href="#"
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                  <TestTube2 size={14} /> Test Decoder
                                </a>
                              </Menu.Item>
                              <Menu.Item>
                                <a
                                  href="#"
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                  <Copy size={14} /> Duplicate
                                </a>
                              </Menu.Item>
                              <Menu.Item>
                                <a
                                  href="#"
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                                  <History size={14} /> View History
                                </a>
                              </Menu.Item>
                              <div className="my-1 h-px bg-slate-100" />
                              <Menu.Item>
                                <button
                                  onClick={() => setDecoderToDelete(decoder)}
                                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                  <Trash2 size={14} /> Delete
                                </button>
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      </div>
      <DeleteDecoderModal
        decoder={decoderToDelete}
        onClose={() => setDecoderToDelete(null)}
      />
    </>
  );
}
