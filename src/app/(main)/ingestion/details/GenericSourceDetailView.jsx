"use client";

import { Fragment, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Disclosure, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import { LineChart, Line, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ZapOff,
  Zap,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  User,
  FileCog,
  ChevronDown,
  Copy,
} from "lucide-react";

// --- Configuration & Helpers ---
const STATUS_INFO_DETAIL = {
  Healthy: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200/60",
    label: "Healthy",
  },
  Degraded: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200/60",
    label: "Degraded",
  },
  Offline: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200/60",
    label: "Offline",
  },
  default: {
    icon: XCircle,
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200/60",
    label: "Unknown",
  },
};

const useCopyToClipboard = () => {
  const copy = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage || "Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy.");
    }
  };
  return copy;
};

// --- Child Components ---
const StatCard = ({
  title,
  value,
  icon: Icon,
  isMono = false,
  onCopy = false,
}) => {
  const copy = useCopyToClipboard();
  return (
    <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white rounded-md border border-slate-200/80">
          <Icon className="h-5 w-5 text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p
            className={clsx(
              "text-base font-semibold text-slate-800",
              isMono && "font-mono tracking-tight"
            )}>
            {value}
          </p>
        </div>
      </div>
      {onCopy && (
        <button
          onClick={() => copy(value, `${title} copied!`)}
          className="p-2 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600">
          <Copy size={16} />
        </button>
      )}
    </div>
  );
};

const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
  icon: Icon,
}) => (
  <Disclosure
    as="div"
    className="bg-white border border-slate-200/80 rounded-xl shadow-sm"
    defaultOpen={defaultOpen}>
    {({ open }) => (
      <>
        <Disclosure.Button className="flex w-full items-center justify-between p-4 text-left">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-5 w-5 text-slate-500" />}
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          </div>
          <ChevronDown
            className={clsx(
              "h-5 w-5 text-slate-400 transition-transform",
              open && "rotate-180"
            )}
          />
        </Disclosure.Button>
        <Transition
          as={Fragment}
          enter="transition-all duration-200 ease-out"
          enterFrom="transform opacity-0 max-h-0"
          enterTo="transform opacity-100 max-h-96"
          leave="transition-all duration-150 ease-in"
          leaveFrom="transform opacity-100 max-h-96"
          leaveTo="transform opacity-0 max-h-0">
          <Disclosure.Panel className="px-4 pb-4 border-t border-slate-200/80">
            {children}
          </Disclosure.Panel>
        </Transition>
      </>
    )}
  </Disclosure>
);

const IngestionRateChart = ({ eps }) => {
  const [data, setData] = useState(() =>
    [...Array(12)].map(() => ({ eps: 0 }))
  );
  useEffect(() => {
    const interval = setInterval(
      () => setData((prevData) => [...prevData.slice(1), { eps: eps || 0 }]),
      5000
    );
    return () => clearInterval(interval);
  }, [eps]);
  return (
    <div className="h-48 pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            domain={[0, "dataMax + 10"]}
          />
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "0.5rem",
            }}
            labelStyle={{ display: "none" }}
            itemStyle={{ color: "#38bdf8" }}
          />
          <Line
            type="monotone"
            dataKey="eps"
            stroke="#0284c7"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

function SourceDetailActionsMenu({ source, onToggle, onDelete }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
        Actions <MoreVertical size={16} className="-mr-1" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95">
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="p-1">
            <Menu.Item disabled>
              <button
                disabled
                className="w-full text-left flex items-center gap-3 p-2 rounded-md text-sm text-slate-400 cursor-not-allowed">
                <Edit size={16} /> Edit Configuration
              </button>
            </Menu.Item>
            <Menu.Item>
              <button
                onClick={onToggle}
                className="w-full text-left flex items-center gap-3 p-2 rounded-md text-sm text-slate-700 hover:bg-slate-100">
                {source.is_enabled ? (
                  <>
                    <ZapOff size={16} /> Pause Ingestion
                  </>
                ) : (
                  <>
                    <Zap size={16} /> Resume Ingestion
                  </>
                )}
              </button>
            </Menu.Item>
            <div className="my-1 h-px bg-slate-100" />
            <Menu.Item>
              <button
                onClick={onDelete}
                className="w-full text-left flex items-center gap-3 p-2 rounded-md text-sm text-red-600 hover:bg-red-50">
                <Trash2 size={16} /> Delete Source
              </button>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

// --- Main Component ---
export default function GenericSourceDetailView({
  source,
  onUpdate,
  onDeleteInitiated,
}) {
  const handleToggleEnabled = async () => {
    const action = source.is_enabled ? "Pausing" : "Resuming";
    const apiPromise = fetch(`/api/sources/${source.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_enabled: !source.is_enabled }),
    }).then((res) => {
      if (!res.ok) throw new Error("API request failed");
      return res.json();
    });

    toast.promise(apiPromise, {
      loading: `${action} ${source.name}...`,
      success: () => {
        onUpdate();
        return `Source ${action === "Pausing" ? "paused" : "resumed"}.`;
      },
      error: (err) =>
        `Failed to ${action.toLowerCase()} source: ${err.message}`,
    });
  };

  const {
    icon: Icon,
    color,
    bg,
    border,
    label,
  } = STATUS_INFO_DETAIL[source.status] || STATUS_INFO_DETAIL.default;

  return (
    <main className="flex-1 h-full flex flex-col bg-slate-50/50">
      <header className="p-4 sm:p-6 border-b border-slate-200 flex-shrink-0 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {source.type.replace("-", " ")}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {source.name}
            </h1>
          </div>
          <SourceDetailActionsMenu
            source={source}
            onToggle={handleToggleEnabled}
            onDelete={() => onDeleteInitiated(source)}
          />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={source.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <div
              className={clsx(
                "flex items-start gap-4 p-4 rounded-lg border",
                bg,
                border
              )}>
              <Icon className={clsx("h-6 w-6 flex-shrink-0 mt-1", color)} />
              <div>
                <h3 className={clsx("text-lg font-semibold", color)}>
                  {label}
                </h3>
                {source.status !== "Healthy" && source.last_error ? (
                  <p className="mt-1 text-sm text-slate-700 font-medium">
                    Error: {source.last_error} (
                    {source.last_seen_at
                      ? formatDistanceToNow(new Date(source.last_seen_at), {
                          addSuffix: true,
                        })
                      : "time unknown"}
                    )
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-600">
                    Events are being received and processed as expected.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <CollapsibleSection title="Source Vitals" defaultOpen={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <StatCard
                    title="Last Event Seen"
                    value={
                      source.last_seen_at
                        ? formatDistanceToNow(new Date(source.last_seen_at), {
                            addSuffix: true,
                          })
                        : "Never"
                    }
                    icon={Clock}
                  />
                  <StatCard
                    title="Status"
                    value={source.is_enabled ? "Enabled" : "Paused"}
                    icon={source.is_enabled ? Zap : ZapOff}
                  />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-500">
                    Live Ingestion Rate (EPS)
                  </p>
                  <IngestionRateChart eps={source.events_per_second} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Configuration & Audit">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <StatCard
                    title="Configured By"
                    value={source.created_by || "System"}
                    icon={User}
                  />
                  <StatCard
                    title="Last Modified"
                    value={format(new Date(source.updated_at), "PPp")}
                    icon={Calendar}
                  />
                  <StatCard
                    title="Source ID"
                    value={source.id}
                    icon={FileCog}
                    isMono
                    onCopy={true}
                  />
                </div>
              </CollapsibleSection>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
