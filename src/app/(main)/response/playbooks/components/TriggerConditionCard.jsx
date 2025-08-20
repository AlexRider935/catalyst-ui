"use client";

import { Fragment } from "react";
import {
  GitBranch,
  ShieldAlert,
  Plus,
  X,
  ChevronsUpDown,
  Timer,
  Info,
} from "lucide-react";
import { Listbox, Transition, Switch } from "@headlessui/react";
import clsx from "clsx";

// --- Configuration Data ---
const TRIGGER_TYPES = [
  { id: "RULE_MATCH", name: "Detection Rule Match", icon: GitBranch },
  { id: "SECURITY_EVENT", name: "Security Event", icon: ShieldAlert },
];

const RULE_FIELDS = [
  {
    id: "severity",
    name: "Severity",
    type: "select",
    options: ["Informational", "Low", "Medium", "High", "Critical"],
  },
  { id: "rule_group", name: "Rule Group", type: "text" },
  { id: "hostname", name: "Endpoint Hostname", type: "text" },
  { id: "username", name: "Username", type: "text" },
];

const OPERATORS = [
  { id: "is", name: "Is" },
  { id: "is_not", name: "Is Not" },
  { id: "contains", name: "Contains" },
  { id: "does_not_contain", name: "Does Not Contain" },
];

const SUPPRESSION_KEYS = [
  { id: "hostname", name: "Endpoint Hostname" },
  { id: "username", name: "Username" },
  { id: "rule_id", name: "Rule ID" },
];

// --- Reusable UI Component ---
const StyledSelect = ({
  options,
  selected,
  onChange,
  valueKey = "id",
  nameKey = "name",
}) => (
  <Listbox value={selected} onChange={onChange}>
    <div className="relative">
      <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-slate-300 shadow-sm focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
        <span className="block truncate">
          {options.find((o) => o[valueKey] === selected)?.[nameKey] || selected}
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
          {options.map((opt) => (
            <Listbox.Option
              key={opt[valueKey]}
              className={({ active }) =>
                `relative cursor-default select-none py-2 px-4 ${
                  active ? "bg-blue-100 text-blue-900" : "text-slate-900"
                }`
              }
              value={opt[valueKey]}>
              {({ selected }) => (
                <span
                  className={`block truncate ${
                    selected ? "font-medium" : "font-normal"
                  }`}>
                  {opt[nameKey]}
                </span>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </div>
  </Listbox>
);

// --- Main Component ---
export default function TriggerConditionCard({ trigger, onTriggerChange }) {
  const { type, config } = trigger;

  const handleTypeChange = (newType) => {
    // Reset config when type changes to avoid invalid states
    const newConfig = {
      conditions: [{ field: "severity", operator: "is", value: "High" }],
      suppression: { enabled: true, window: 5, key: "hostname" },
    };
    onTriggerChange({ type: newType, config: newConfig });
  };

  const handleConfigChange = (key, value) => {
    onTriggerChange({ ...trigger, config: { ...config, [key]: value } });
  };

  const handleConditionChange = (index, key, value) => {
    const newConditions = [...config.conditions];
    newConditions[index] = { ...newConditions[index], [key]: value };
    // If field type changes, reset the value
    if (key === "field") {
      newConditions[index].value = "";
    }
    handleConfigChange("conditions", newConditions);
  };

  const addCondition = () => {
    const newConditions = [
      ...config.conditions,
      { field: "severity", operator: "is", value: "High" },
    ];
    handleConfigChange("conditions", newConditions);
  };

  const removeCondition = (index) => {
    const newConditions = config.conditions.filter((_, i) => i !== index);
    handleConfigChange("conditions", newConditions);
  };

  const handleSuppressionChange = (key, value) => {
    handleConfigChange("suppression", { ...config.suppression, [key]: value });
  };

  const generateSummary = () => {
    const typeName = TRIGGER_TYPES.find((t) => t.id === type)?.name || type;
    const conditionsText = config.conditions
      .map(
        (c) =>
          `**${c.field}** ${OPERATORS.find(
            (o) => o.id === c.operator
          )?.name.toLowerCase()} **"${c.value}"**`
      )
      .join(" and ");
    let summary = `Run when a **${typeName}** occurs where ${conditionsText}.`;
    if (config.suppression.enabled) {
      summary += ` Suppress subsequent triggers for **${config.suppression.window} minutes** per unique **${config.suppression.key}**.`;
    }
    return summary.split("**").map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-semibold text-slate-700">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  const selectedField = (fieldId) =>
    RULE_FIELDS.find((f) => f.id === fieldId) || RULE_FIELDS[0];

  return (
    <div className="bg-white border border-slate-200 rounded-lg mb-6">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">
          2. Trigger Condition
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Define the precise criteria that will execute this playbook.
        </p>
      </div>
      <div className="p-6 space-y-8">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Trigger Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TRIGGER_TYPES.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleTypeChange(id)}
                className={clsx(
                  "flex items-center text-left gap-3 p-4 rounded-lg border-2 transition-all",
                  type === id
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-slate-300 bg-white hover:border-slate-400"
                )}>
                <Icon
                  className={clsx(
                    "h-6 w-6 flex-shrink-0",
                    type === id ? "text-blue-600" : "text-slate-500"
                  )}
                />
                <span
                  className={clsx(
                    "font-semibold",
                    type === id ? "text-blue-800" : "text-slate-800"
                  )}>
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Conditions
          </label>
          <div className="space-y-3 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            {config.conditions.map((cond, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                <StyledSelect
                  options={RULE_FIELDS}
                  selected={cond.field}
                  onChange={(v) => handleConditionChange(index, "field", v)}
                />
                <StyledSelect
                  options={OPERATORS}
                  selected={cond.operator}
                  onChange={(v) => handleConditionChange(index, "operator", v)}
                />
                {selectedField(cond.field).type === "select" ? (
                  <StyledSelect
                    options={selectedField(cond.field).options}
                    selected={cond.value}
                    onChange={(v) => handleConditionChange(index, "value", v)}
                    valueKey={null}
                    nameKey={null}
                  />
                ) : (
                  <input
                    type="text"
                    value={cond.value}
                    onChange={(e) =>
                      handleConditionChange(index, "value", e.target.value)
                    }
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  disabled={config.conditions.length <= 1}
                  className="p-2 text-slate-400 hover:text-red-600 disabled:text-slate-300 disabled:cursor-not-allowed">
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCondition}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mt-2 px-2 py-1">
              <Plus size={16} /> Add Condition
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Execution Throttling
          </label>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">
                  Suppress duplicate triggers
                </h4>
                <p className="text-sm text-slate-500">
                  Prevent this playbook from running too frequently for the same
                  event.
                </p>
              </div>
              <Switch
                checked={config.suppression.enabled}
                onChange={(v) => handleSuppressionChange("enabled", v)}
                className={clsx(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                  config.suppression.enabled ? "bg-blue-600" : "bg-slate-300"
                )}>
                <span
                  className={clsx(
                    "inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    config.suppression.enabled
                      ? "translate-x-5"
                      : "translate-x-0"
                  )}
                />
              </Switch>
            </div>
            {config.suppression.enabled && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Time Window (Minutes)
                  </label>
                  <input
                    type="number"
                    value={config.suppression.window}
                    onChange={(e) =>
                      handleSuppressionChange("window", e.target.value)
                    }
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Group By Field
                  </label>
                  <StyledSelect
                    options={SUPPRESSION_KEYS}
                    selected={config.suppression.key}
                    onChange={(v) => handleSuppressionChange("key", v)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Logic Summary
          </label>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <p className="text-sm text-slate-600 leading-relaxed">
              {generateSummary()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
