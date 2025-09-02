"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Fragment,
} from "react";
import {
  Loader2,
  Save,
  Terminal,
  FolderKanban,
  FileText,
  ShieldAlert,
  X,
  SlidersHorizontal,
  AlertTriangle,
  Target,
  ListFilter,
  Wifi,
  Copy,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";

// --------------------------------------------------
// Utility helpers
// --------------------------------------------------
const deepEqual = (a, b) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
};

const Divider = () => <hr className="my-6 border-slate-200" />;

// --------------------------------------------------
// Reusable UI building blocks
// --------------------------------------------------
const SettingsCard = ({ title, description, children, headerAction }) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5 md:p-6">
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-slate-800">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {headerAction && <div className="shrink-0">{headerAction}</div>}
    </header>
    <div className="p-5 md:p-6">{children}</div>
  </section>
);

const Field = ({ label, icon: Icon, hint, children, required }) => (
  <label className="block">
    <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
      {Icon && <Icon size={14} />} {label}
      {required && <span className="text-red-500">*</span>}
    </div>
    {children}
    {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
  </label>
);

const Toggle = ({ enabled, onChange, label }) => (
  <button
    type="button"
    aria-pressed={enabled}
    aria-label={label}
    className={clsx(
      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2",
      enabled ? "bg-blue-600" : "bg-slate-200"
    )}
    onClick={onChange}>
    <span
      className={clsx(
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
        enabled ? "translate-x-5" : "translate-x-0"
      )}
    />
  </button>
);

const TextInput = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  inputMode = "text",
}) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    inputMode={inputMode}
    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
  />
);

const NumberInput = ({ value, onChange, min = 0, step = 1 }) => (
  <input
    type="number"
    value={value}
    onChange={onChange}
    min={min}
    step={step}
    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
  />
);

const ModuleToggle = ({ title, description, enabled, onChange }) => (
  <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div>
      <h3 className="font-medium text-slate-800">{title}</h3>
      {description && (
        <p className="mt-0.5 text-sm text-slate-600">{description}</p>
      )}
    </div>
    <Toggle enabled={enabled} onChange={onChange} label={title} />
  </div>
);

const Chip = ({ children, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-3 pr-2 text-xs font-medium text-slate-700">
    {children}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
        aria-label="Remove">
        <X size={14} />
      </button>
    )}
  </span>
);

const TagInput = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  hint,
  validator,
}) => {
  const [inputValue, setInputValue] = useState("");
  const tags = Array.isArray(value) ? value : [];

  const addTag = useCallback(
    (raw) => {
      const cleaned = `${raw}`.trim().replace(/,$/, "");
      if (!cleaned) return;
      if (validator && !validator(cleaned)) {
        toast.error("Invalid value");
        return;
      }
      if (!tags.includes(cleaned)) onChange([...tags, cleaned]);
    },
    [tags, onChange, validator]
  );

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove) =>
    onChange(tags.filter((t) => t !== tagToRemove));

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
        {Icon && <Icon size={14} />} {label}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2 rounded-lg border border-slate-300 bg-white p-2 text-sm shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        {tags.map((tag) => (
          <Chip key={tag} onRemove={() => removeTag(tag)}>
            {tag}
          </Chip>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="min-w-[140px] flex-1 bg-transparent p-1 focus:outline-none border-0"
          aria-label={label}
        />
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
};

const CommandOutputEditor = ({ commands, setConfig }) => {
  const handleCommandChange = (alias, key, value) => {
    const next = { ...commands, [alias]: { ...commands[alias], [key]: value } };
    setConfig((c) => ({ ...c, command_output: next }));
  };

  const addCommand = () => {
    const newAlias = `command_${Object.keys(commands || {}).length + 1}`;
    setConfig((c) => ({
      ...c,
      command_output: {
        ...(c.command_output || {}),
        [newAlias]: { command: "", interval: 3600 },
      },
    }));
  };

  const removeCommand = (alias) => {
    const next = { ...(commands || {}) };
    delete next[alias];
    setConfig((c) => ({ ...c, command_output: next }));
  };

  const entries = Object.entries(commands || {});

  return (
    <div className="space-y-4">
      {entries.length === 0 && (
        <p className="text-sm text-slate-500">
          No commands yet. Add one below.
        </p>
      )}
      {entries.map(([alias, params]) => (
        <div
          key={alias}
          className="relative space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <button
            onClick={() => removeCommand(alias)}
            title="Remove Command"
            className="absolute top-3 right-3 rounded-full p-1 text-slate-400 hover:bg-red-100 hover:text-red-600">
            <X size={14} />
          </button>
          <Field label="Alias" icon={Terminal}>
            <TextInput
              value={alias}
              onChange={() => {}}
              placeholder="e.g., disk_usage"
              disabled
            />
          </Field>
          <Field label="Command" icon={Terminal}>
            <TextInput
              value={params.command}
              onChange={(e) =>
                handleCommandChange(alias, "command", e.target.value)
              }
              placeholder="e.g., df -h"
            />
          </Field>
          <Field label="Interval (seconds)">
            <NumberInput
              value={params.interval}
              onChange={(e) =>
                handleCommandChange(
                  alias,
                  "interval",
                  Number.parseInt(e.target.value, 10) || 3600
                )
              }
              min={10}
              step={10}
            />
          </Field>
        </div>
      ))}
      <button
        onClick={addCommand}
        className="text-sm font-semibold text-blue-600 hover:underline">
        + Add Command
      </button>
    </div>
  );
};

// --------------------------------------------------
// Skeletons & Empty states
// --------------------------------------------------
const Skeleton = ({ className }) => (
  <div className={clsx("animate-pulse rounded-md bg-slate-200", className)} />
);

const LoadingState = () => (
  <div className="space-y-6 p-6">
    <div className="flex items-center gap-2 text-slate-600">
      <Loader2 className="h-5 w-5 animate-spin" /> Loading configuration…
    </div>
    <Skeleton className="h-32" />
    <Skeleton className="h-64" />
    <Skeleton className="h-48" />
  </div>
);

// --------------------------------------------------
// Main Component
// --------------------------------------------------
export default function ConfigurationTab({ agentId }) {
  const [config, setConfig] = useState(null);
  const [original, setOriginal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const isDirty = useMemo(
    () => !deepEqual(config, original),
    [config, original]
  );

  const handleTuningChange = (key, value) => {
    setConfig((c) => ({
      ...c,
      xdr_tuning: { ...(c?.xdr_tuning || {}), [key]: value },
    }));
  };

  // fetch
  useEffect(() => {
    const fetchConfig = async () => {
      if (!agentId) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/agents/${agentId}/config`);
        if (!res.ok) throw new Error("Failed to fetch configuration.");
        const data = await res.json();

        const withDefaults = {
          fim_enabled: data.fim_enabled ?? false,
          fim_directories: Array.isArray(data.fim_directories)
            ? data.fim_directories
            : [],
          fim_interval: data.fim_interval ?? 300,

          log_collector_enabled: data.log_collector_enabled ?? false,
          log_collector_file: data.log_collector_file ?? "",

          command_output_enabled: data.command_output_enabled ?? false,
          command_output: data.command_output ?? {},

          process_monitoring_enabled: data.process_monitoring_enabled ?? false,
          network_monitoring_enabled: data.network_monitoring_enabled ?? false,
          content_scanning_enabled: data.content_scanning_enabled ?? false,

          process_exclusions: Array.isArray(data.process_exclusions)
            ? data.process_exclusions
            : [],
          network_ip_exclusions: Array.isArray(data.network_ip_exclusions)
            ? data.network_ip_exclusions
            : [],

          scanner_dirs: Array.isArray(data.scanner_dirs)
            ? data.scanner_dirs
            : [],
          scanner_patterns: data.scanner_patterns ?? "",
          scanner_file_exclusions: Array.isArray(data.scanner_file_exclusions)
            ? data.scanner_file_exclusions
            : [],

          xdr_tuning: {
            risk_threshold: data.xdr_tuning?.risk_threshold ?? 50,
            base_risk_score: data.xdr_tuning?.base_risk_score ?? 10,
            high_risk_paths: Array.isArray(data.xdr_tuning?.high_risk_paths)
              ? data.xdr_tuning.high_risk_paths
              : [],
            path_risk_bonus: data.xdr_tuning?.path_risk_bonus ?? 65,
            standard_ports: Array.isArray(data.xdr_tuning?.standard_ports)
              ? data.xdr_tuning.standard_ports
              : [80, 443],
            port_risk_bonus: data.xdr_tuning?.port_risk_bonus ?? 15,
          },
        };

        setConfig(withDefaults);
        setOriginal(withDefaults);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [agentId]);

  const handleSave = async () => {
    if (!agentId) return;
    setIsSaving(true);

    const savePromise = fetch(`/api/agents/${agentId}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    toast.promise(savePromise, {
      loading: "Saving configuration…",
      success: async (res) => {
        if (!res.ok) throw new Error("Failed to save.");
        router.refresh();
        setOriginal(config);
        return "Configuration saved successfully!";
      },
      error: (e) => e?.message || "Failed to save configuration.",
    });

    try {
      await savePromise;
    } catch {}
    setIsSaving(false);
  };

  // cmd/ctrl+s shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isDirty && !isSaving) handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDirty, isSaving]);

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      toast.success("Configuration copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  if (isLoading) return <LoadingState />;
  if (!config)
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load configuration.
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Sticky Save Bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="sticky top-0 z-30 -mx-4 mb-2 bg-gradient-to-b from-white to-white/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:-mx-6 md:px-6">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-amber-800 shadow-sm">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle size={16} />
                You have unsaved changes.
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50">
                <Save size={16} /> {isSaving ? "Saving…" : "Save & Deploy"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card 1: High-Level Module Toggles */}
      <SettingsCard
        title="Module Controls"
        description="Enable or disable agent monitoring capabilities from one place.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ModuleToggle
            title="File Integrity Monitoring (FIM)"
            description="Monitor files and directories for changes."
            enabled={config.fim_enabled}
            onChange={() =>
              setConfig((c) => ({ ...c, fim_enabled: !c.fim_enabled }))
            }
          />
          <ModuleToggle
            title="Process Monitoring"
            description="Track new processes with risk scoring."
            enabled={config.process_monitoring_enabled}
            onChange={() =>
              setConfig((c) => ({
                ...c,
                process_monitoring_enabled: !c.process_monitoring_enabled,
              }))
            }
          />
          <ModuleToggle
            title="Network Monitoring"
            description="Observe outbound connections with risk scoring."
            enabled={config.network_monitoring_enabled}
            onChange={() =>
              setConfig((c) => ({
                ...c,
                network_monitoring_enabled: !c.network_monitoring_enabled,
              }))
            }
          />
          <ModuleToggle
            title="Content Scanning (DLP)"
            description="Scan files for sensitive data patterns."
            enabled={config.content_scanning_enabled}
            onChange={() =>
              setConfig((c) => ({
                ...c,
                content_scanning_enabled: !c.content_scanning_enabled,
              }))
            }
          />
          <ModuleToggle
            title="Log Collector"
            description="Stream a specific log file to the platform."
            enabled={config.log_collector_enabled}
            onChange={() =>
              setConfig((c) => ({
                ...c,
                log_collector_enabled: !c.log_collector_enabled,
              }))
            }
          />
          <ModuleToggle
            title="Command Output"
            description="Run shell commands on a schedule and ingest output."
            enabled={config.command_output_enabled}
            onChange={() =>
              setConfig((c) => ({
                ...c,
                command_output_enabled: !c.command_output_enabled,
              }))
            }
          />
        </div>
      </SettingsCard>

      {/* Card 2: XDR Tuning */}
      <AnimatePresence>
        {(config.process_monitoring_enabled ||
          config.network_monitoring_enabled) && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}>
            <SettingsCard
              title="XDR Tuning & Heuristics"
              description="Fine‑tune the risk scoring engine for process and network monitoring.">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Alerting Risk Threshold" icon={AlertTriangle}>
                  <NumberInput
                    value={config.xdr_tuning.risk_threshold}
                    onChange={(e) =>
                      handleTuningChange(
                        "risk_threshold",
                        Number.parseInt(e.target.value, 10) || 0
                      )
                    }
                    min={0}
                  />
                </Field>
                <Field label="Base Event Risk Score" icon={Target}>
                  <NumberInput
                    value={config.xdr_tuning.base_risk_score}
                    onChange={(e) =>
                      handleTuningChange(
                        "base_risk_score",
                        Number.parseInt(e.target.value, 10) || 0
                      )
                    }
                    min={0}
                  />
                </Field>
              </div>
              <Divider />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TagInput
                  label="High‑Risk Paths"
                  icon={FolderKanban}
                  value={config.xdr_tuning.high_risk_paths}
                  onChange={(paths) =>
                    handleTuningChange("high_risk_paths", paths)
                  }
                  placeholder="/usr/bin, C:\\Windows\\System32…"
                  hint="Processes or connections originating here receive a risk bonus."
                />
                <Field label="High‑Risk Path Bonus" icon={SlidersHorizontal}>
                  <NumberInput
                    value={config.xdr_tuning.path_risk_bonus}
                    onChange={(e) =>
                      handleTuningChange(
                        "path_risk_bonus",
                        Number.parseInt(e.target.value, 10) || 0
                      )
                    }
                    min={0}
                  />
                </Field>
              </div>
              <Divider />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TagInput
                  label="Standard Ports"
                  icon={ListFilter}
                  value={config.xdr_tuning.standard_ports}
                  onChange={(ports) =>
                    handleTuningChange(
                      "standard_ports",
                      ports
                        .map((p) => Number.parseInt(p, 10))
                        .filter((p) => Number.isFinite(p) && p > 0 && p < 65536)
                    )
                  }
                  placeholder="80, 443, 22…"
                  hint="Connections to ports not in this list receive a risk bonus."
                  validator={(v) =>
                    /^(\d{1,5})$/.test(v) && Number(v) > 0 && Number(v) < 65536
                  }
                />
                <Field label="Non‑Standard Port Bonus" icon={SlidersHorizontal}>
                  <NumberInput
                    value={config.xdr_tuning.port_risk_bonus}
                    onChange={(e) =>
                      handleTuningChange(
                        "port_risk_bonus",
                        Number.parseInt(e.target.value, 10) || 0
                      )
                    }
                    min={0}
                  />
                </Field>
              </div>
            </SettingsCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card 3: Global Filters */}
      <SettingsCard
        title="Filters & Exclusions"
        description="Reduce noise from trusted sources across all modules.">
        <TagInput
          label="Process Path Exclusions"
          icon={FolderKanban}
          value={config.process_exclusions}
          onChange={(paths) =>
            setConfig((c) => ({ ...c, process_exclusions: paths }))
          }
          placeholder="/usr/local/bin/app, C:\\Program Files\\App…"
          hint="Exact paths or prefixes are recommended."
        />
        <Divider />
        <TagInput
          label="Network IP Exclusions"
          icon={Wifi}
          value={config.network_ip_exclusions}
          onChange={(ips) =>
            setConfig((c) => ({ ...c, network_ip_exclusions: ips }))
          }
          placeholder="10.0.0.1, 192.168.1.0/24…"
          hint="IP addresses or CIDR ranges."
          validator={(v) => /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(v)}
        />
      </SettingsCard>

      {/* Card 4+: Conditional Module Configs */}
      <AnimatePresence>
        {config.fim_enabled && (
          <motion.div
            key="fim"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}>
            <SettingsCard
              title="FIM Configuration"
              description="Configure directories and scan interval for File Integrity Monitoring.">
              <TagInput
                label="Monitored Directories"
                icon={FolderKanban}
                value={config.fim_directories}
                onChange={(dirs) =>
                  setConfig((c) => ({ ...c, fim_directories: dirs }))
                }
                placeholder="/etc, /var/log, C:\\Windows…"
              />
              <Divider />
              <Field label="Scan Interval (seconds)">
                <NumberInput
                  value={config.fim_interval}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      fim_interval: Number.parseInt(e.target.value, 10) || 300,
                    }))
                  }
                  min={30}
                  step={30}
                />
              </Field>
            </SettingsCard>
          </motion.div>
        )}

        {config.content_scanning_enabled && (
          <motion.div
            key="dlp"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}>
            <SettingsCard
              title="Content Scanning (DLP) Configuration"
              description="Configure directories, patterns, and file exclusions.">
              <TagInput
                label="Scanned Directories"
                icon={FolderKanban}
                value={config.scanner_dirs}
                onChange={(dirs) =>
                  setConfig((c) => ({ ...c, scanner_dirs: dirs }))
                }
                placeholder="/home, /shared…"
              />
              <Divider />
              <Field
                label="Regex Patterns (comma‑separated)"
                icon={ShieldAlert}>
                <TextInput
                  value={config.scanner_patterns}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      scanner_patterns: e.target.value,
                    }))
                  }
                  placeholder={"\\b\\d{4}-\\d{4}-\\d{4}-\\d{4}\\b"}
                />
              </Field>
              <Divider />
              <TagInput
                label="File Extension Exclusions"
                icon={FileText}
                value={config.scanner_file_exclusions}
                onChange={(exts) =>
                  setConfig((c) => ({ ...c, scanner_file_exclusions: exts }))
                }
                placeholder=".log, .tmp, .bak…"
                validator={(v) => /^\.?[A-Za-z0-9]+$/.test(v)}
              />
            </SettingsCard>
          </motion.div>
        )}

        {config.log_collector_enabled && (
          <motion.div
            key="log"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}>
            <SettingsCard
              title="Log Collector"
              description="Specify the log file to stream.">
              <Field label="Log File Path" icon={FileText} required>
                <TextInput
                  value={config.log_collector_file}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      log_collector_file: e.target.value,
                    }))
                  }
                  placeholder="/var/log/auth.log"
                />
              </Field>
            </SettingsCard>
          </motion.div>
        )}

        {config.command_output_enabled && (
          <motion.div
            key="cmd"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}>
            <SettingsCard
              title="Command Output"
              description="Add shell commands to run on a schedule.">
              <CommandOutputEditor
                commands={config.command_output || {}}
                setConfig={setConfig}
              />
            </SettingsCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => setConfig(original)}
          disabled={!isDirty || isSaving}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50">
          <Save size={16} />{" "}
          {isSaving ? "Saving…" : "Save & Deploy Configuration"}
        </button>
      </div>

      {/* Raw JSON */}
      <SettingsCard
        title="Raw Configuration"
        description="Final JSON object sent to the agent on its next check‑in."
        headerAction={
          <button
            onClick={copyJson}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Copy size={14} /> Copy JSON
          </button>
        }>
        <div className="h-[28rem] overflow-y-auto rounded-lg bg-slate-950 p-4 font-mono text-xs text-slate-200">
          <pre>
            <code>{JSON.stringify(config, null, 2)}</code>
          </pre>
        </div>
      </SettingsCard>
    </div>
  );
}
