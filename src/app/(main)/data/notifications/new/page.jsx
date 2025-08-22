"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Check,
  Settings,
  ShieldAlert,
  GitBranch,
  Bell,
  Plus,
  Trash2,
  ChevronDown,
  MessageSquare,
  Mail,
  Webhook,
  Ticket,
  Clock,
  ToggleLeft,
} from "lucide-react";
import clsx from "clsx";

// --- Mock Data for Dropdowns (unchanged) ---
const TRIGGER_SOURCES = [
  { id: "detection_engine", name: "Detection Engine Event", icon: ShieldAlert },
  { id: "vulnerability", name: "Vulnerability Finding", icon: GitBranch },
  { id: "compliance", name: "Compliance Finding", icon: ToggleLeft },
  { id: "scheduler", name: "On a schedule", icon: Clock },
];

const FIELDS_BY_SOURCE = {
  detection_engine: [
    "rule.id",
    "rule.level",
    "agent.name",
    "data.mitre.tactic",
    "data.src_ip",
  ],
  vulnerability: ["cve.id", "cvss_score", "asset.tag", "severity"],
  compliance: ["control.id", "framework", "status"],
  scheduler: ["cron_expression"],
};

const OPERATORS = ["is", "is not", "contains", "does not contain", ">", "<"];

// --- Main New Rule Page Component ---
export default function NewNotificationRulePage() {
  const [activeSection, setActiveSection] = useState("details");
  const [rule, setRule] = useState({
    name: "",
    description: "",
    tags: "",
    status: true,
    trigger: {
      source: "detection_engine",
      matchType: "ALL", // ALL (AND) or ANY (OR)
      conditions: [{ field: "rule.level", operator: ">", value: "11" }],
    },
    actions: [{ type: "Slack", target: "#soc-alerts" }],
    settings: {
      suppressionEnabled: false,
      suppressionValue: 5,
      suppressionUnit: "minutes",
    },
  });

  // Silas: State management logic remains the same. The changes are purely architectural and stylistic.
  const handleTriggerChange = (key, value) => {
    setRule((prev) => ({
      ...prev,
      trigger: { ...prev.trigger, [key]: value },
    }));
  };

  const handleConditionChange = (index, key, value) => {
    const newConditions = [...rule.trigger.conditions];
    newConditions[index][key] = value;
    handleTriggerChange("conditions", newConditions);
  };

  const addCondition = () => {
    const newCondition = {
      field: FIELDS_BY_SOURCE[rule.trigger.source][0],
      operator: "is",
      value: "",
    };
    handleTriggerChange("conditions", [
      ...rule.trigger.conditions,
      newCondition,
    ]);
  };

  const removeCondition = (index) => {
    const newConditions = rule.trigger.conditions.filter((_, i) => i !== index);
    handleTriggerChange("conditions", newConditions);
  };

  const handleActionChange = (index, key, value) => {
    const newActions = [...rule.actions];
    newActions[index][key] = value;
    setRule((prev) => ({ ...prev, actions: newActions }));
  };

  const addAction = () => {
    const newAction = { type: "Email", target: "" };
    setRule((prev) => ({ ...prev, actions: [...rule.actions, newAction] }));
  };

  const removeAction = (index) => {
    const newActions = rule.actions.filter((_, i) => i !== index);
    setRule((prev) => ({ ...prev, actions: newActions }));
  };

  const navItems = [
    { id: "details", name: "Rule Details", icon: FileText },
    { id: "trigger", name: "Trigger (IF)", icon: ShieldAlert },
    { id: "actions", name: "Actions (THEN)", icon: Bell },
    { id: "settings", name: "Advanced Settings", icon: Settings },
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Page Header (Standardized) */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/response/actions"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
              <ArrowLeft size={22} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Create New Rule
              </h1>
              <p className="mt-1 text-slate-500">
                Construct a new rule using the workbench.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/response/actions">
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                Cancel
              </button>
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              <Check size={16} /> Save Rule
            </button>
          </div>
        </div>
      </div>

      {/* Silas: This is the encapsulated "Workbench/Console Layout". The entire component is one bordered entity. */}
      <div className="flex-1 min-h-0 rounded-xl border border-slate-200/80 bg-white shadow-sm flex overflow-hidden">
        {/* Left Nav */}
        <div className="w-64 flex-shrink-0 bg-slate-50/75 border-r border-slate-200 p-4">
          <ul className="space-y-1 sticky top-24">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    activeSection === item.id
                      ? "font-semibold bg-slate-200 text-slate-900"
                      : "font-medium text-slate-600 hover:bg-slate-200/50 hover:text-slate-800"
                  )}>
                  <item.icon size={16} /> {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-4xl mx-auto">
            {/* Rule Details */}
            <div id="details" className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-slate-900">
                Rule Details
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Provide a name, description, and tags to identify and organize
                this rule.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="ruleName"
                    className="block text-sm font-medium text-slate-700">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    name="ruleName"
                    id="ruleName"
                    placeholder="e.g., Notify SOC on Critical Linux Events"
                    className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={2}
                    placeholder="A brief description of what this rule does."
                    className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                </div>
                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-slate-700">
                    Tags{" "}
                    <span className="text-slate-400">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    name="tags"
                    id="tags"
                    placeholder="soc, linux, critical-severity"
                    className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <hr className="my-8 border-slate-200" />

            {/* Trigger Section (IF) */}
            <div id="trigger" className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-slate-900">
                Trigger (IF)
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Define the condition that will trigger this rule's actions.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="triggerSource"
                    className="block text-sm font-medium text-slate-700">
                    When an event is received from...
                  </label>
                  <select
                    id="triggerSource"
                    value={rule.trigger.source}
                    onChange={(e) =>
                      handleTriggerChange("source", e.target.value)
                    }
                    className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500">
                    {TRIGGER_SOURCES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">
                      And
                    </span>
                    <div className="flex items-center gap-1 rounded-lg bg-slate-200 p-0.5">
                      <button
                        onClick={() => handleTriggerChange("matchType", "ALL")}
                        className={clsx(
                          "rounded-md px-2 py-0.5 text-xs font-semibold",
                          rule.trigger.matchType === "ALL"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-600"
                        )}>
                        ALL
                      </button>
                      <button
                        onClick={() => handleTriggerChange("matchType", "ANY")}
                        className={clsx(
                          "rounded-md px-2 py-0.5 text-xs font-semibold",
                          rule.trigger.matchType === "ANY"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-600"
                        )}>
                        ANY
                      </button>
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      of the following conditions are met:
                    </span>
                  </div>
                  {rule.trigger.conditions.map((cond, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={cond.field}
                        onChange={(e) =>
                          handleConditionChange(index, "field", e.target.value)
                        }
                        className="w-1/3 rounded-lg border-slate-300 text-sm">
                        <option disabled>Select field...</option>
                        {FIELDS_BY_SOURCE[rule.trigger.source].map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                      <select
                        value={cond.operator}
                        onChange={(e) =>
                          handleConditionChange(
                            index,
                            "operator",
                            e.target.value
                          )
                        }
                        className="w-1/4 rounded-lg border-slate-300 text-sm">
                        {OPERATORS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="value"
                        value={cond.value}
                        onChange={(e) =>
                          handleConditionChange(index, "value", e.target.value)
                        }
                        className="flex-1 rounded-lg border-slate-300 text-sm"
                      />
                      <button
                        onClick={() => removeCondition(index)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addCondition}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                    <Plus size={16} /> Add Condition
                  </button>
                </div>
              </div>
            </div>

            <hr className="my-8 border-slate-200" />

            {/* Action Section (THEN) */}
            <div id="actions" className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-slate-900">
                Actions (THEN)
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Define what happens when the trigger condition is met.
              </p>
              <div className="mt-6 space-y-3">
                {rule.actions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div>
                        <label className="text-xs font-medium text-slate-500">
                          ACTION TYPE
                        </label>
                        <select
                          value={action.type}
                          onChange={(e) =>
                            handleActionChange(index, "type", e.target.value)
                          }
                          className="mt-1 w-full rounded-lg border-slate-300 text-sm">
                          <option>Slack</option>
                          <option>Email</option>
                          <option>Webhook</option>
                          <option>Jira</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">
                          RECIPIENT / TARGET
                        </label>
                        <input
                          type="text"
                          placeholder={
                            action.type === "Slack"
                              ? "#channel-name"
                              : "URL or email address..."
                          }
                          value={action.target}
                          onChange={(e) =>
                            handleActionChange(index, "target", e.target.value)
                          }
                          className="mt-1 w-full rounded-lg border-slate-300 text-sm"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeAction(index)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addAction}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                  <Plus size={16} /> Add Action
                </button>
              </div>
            </div>

            <hr className="my-8 border-slate-200" />

            {/* Advanced Settings */}
            <div id="settings" className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-slate-900">
                Advanced Settings
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Configure throttling to prevent alert fatigue.
              </p>
              <div className="mt-6 space-y-4 rounded-lg border border-slate-200 p-4">
                <div className="flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="suppression"
                      name="suppression"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label
                      htmlFor="suppression"
                      className="font-medium text-slate-900">
                      Enable notification throttling
                    </label>
                    <p className="text-slate-500">
                      Suppress identical notifications for a set period after
                      the first one is sent.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-9">
                  <span className="text-sm">
                    Notify once, then suppress for
                  </span>
                  <input
                    type="number"
                    defaultValue="5"
                    className="w-20 rounded-lg border-slate-300 text-sm"
                  />
                  <select className="rounded-lg border-slate-300 text-sm">
                    <option>minutes</option>
                    <option>hours</option>
                    <option>days</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
