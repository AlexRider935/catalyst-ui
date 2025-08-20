"use client";

import { useState, Fragment } from "react";
import { User, Tag, Info, X, ChevronsUpDown } from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";

// --- Configuration Data ---
const PLAYBOOK_OWNERS = [
  { id: "soc_team", name: "SOC Team" },
  { id: "cloud_sec_team", name: "Cloud Security" },
  { id: "ir_team", name: "Incident Response" },
  { id: "soc_automata", name: "Automation Engine" },
];

export default function PlaybookDetailsCard({ playbook, onDetailChange }) {
  const [currentTag, setCurrentTag] = useState("");

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && currentTag.trim() !== "") {
      e.preventDefault();
      if (!playbook.tags.includes(currentTag.trim())) {
        onDetailChange("tags", [...playbook.tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    onDetailChange(
      "tags",
      playbook.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg mb-6">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">
          1. Playbook Details
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Establish the playbook's identity, ownership, and compliance context.
        </p>
      </div>
      <div className="p-6 space-y-8">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-slate-700 mb-1.5">
            Playbook Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={playbook.name}
            onChange={(e) => onDetailChange("name", e.target.value)}
            placeholder="e.g., Isolate Endpoint on High-Severity Alert"
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={playbook.description}
            onChange={(e) => onDetailChange("description", e.target.value)}
            placeholder="Describe the trigger, actions, and intended outcome..."
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="owner"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
              <User size={16} /> Owner
            </label>
            <Listbox
              value={playbook.owner}
              onChange={(value) => onDetailChange("owner", value)}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-slate-300 shadow-sm focus:outline-none sm:text-sm">
                  <span className="block truncate">
                    {PLAYBOOK_OWNERS.find((o) => o.id === playbook.owner)?.name}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronsUpDown
                      className="h-5 w-5 text-slate-400"
                      aria-hidden="true"
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0">
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                    {PLAYBOOK_OWNERS.map((owner) => (
                      <Listbox.Option
                        key={owner.id}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 px-4 ${
                            active
                              ? "bg-blue-100 text-blue-900"
                              : "text-slate-900"
                          }`
                        }
                        value={owner.id}>
                        {({ selected }) => (
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}>
                            {owner.name}
                          </span>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
            <p className="mt-2 text-xs text-slate-500">
              Accountability is a core compliance requirement. Assign an owner.
            </p>
          </div>
          <div>
            <label
              htmlFor="tags"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
              <Tag size={16} /> Tags
            </label>
            <div className="w-full rounded-lg border border-slate-300 p-2 flex flex-wrap gap-2 items-center focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              {playbook.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="focus:outline-none">
                    <X
                      size={12}
                      className="text-blue-600 hover:text-blue-900"
                    />
                  </button>
                </span>
              ))}
              <input
                type="text"
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={
                  playbook.tags.length === 0 ? "e.g., PCI-DSS, T1566" : "Add..."
                }
                className="flex-grow bg-transparent border-none focus:ring-0 text-sm p-0.5"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Use tags to link this playbook to compliance frameworks or MITRE
              techniques.
            </p>
          </div>
        </div>
        <div>
          <label
            htmlFor="changeJustification"
            className="block text-sm font-semibold text-slate-700 mb-1.5">
            Initial Justification
          </label>
          <textarea
            id="changeJustification"
            name="changeJustification"
            rows={3}
            value={playbook.changeJustification}
            onChange={(e) =>
              onDetailChange("changeJustification", e.target.value)
            }
            placeholder="Describe the business or security reason for creating this playbook. This will be the first entry in its audit log."
            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
          <div className="mt-2 flex items-start gap-2 text-xs text-slate-500">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              **Audit Requirement:** All automated controls require a documented
              justification for their existence and any subsequent changes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
