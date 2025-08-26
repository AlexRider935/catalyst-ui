// components/SourceDetail.jsx (Redesigned)
import { Fragment } from "react";
import { motion } from "framer-motion";
import { Menu, Transition, Disclosure } from "@headlessui/react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  BarChart2,
  ZapOff,
  Zap,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  User,
  FileCog,
  ChevronDown,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import { AnimatePresence } from "framer-motion";

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
};

const SourceDetailSkeleton = () => (
  <div className="p-6 lg:p-8 space-y-6 animate-pulse">
    <div className="flex justify-between items-start">
      <div>
        <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-slate-300 rounded w-64"></div>
      </div>
      <div className="h-10 bg-slate-200 rounded-lg w-28"></div>
    </div>
    <div className="h-20 bg-slate-200 rounded-lg w-full"></div>
    <div className="h-12 bg-slate-200 rounded-lg w-full"></div>
    <div className="h-12 bg-slate-200 rounded-lg w-full"></div>
  </div>
);

export default function SourceDetail({ source, onUpdate, onDelete }) {
  if (!source) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-50/50">
        Select a source to view details.
      </div>
    );
  }

  const {
    icon: Icon,
    color,
    bg,
    border,
    label,
  } = STATUS_INFO_DETAIL[source.status] || {};

  return (
    <main className="flex-1 h-full flex flex-col">
      <div className="p-4 sm:p-6 border-b border-slate-200 flex-shrink-0 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {source.type}
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {source.name}
            </h1>
          </div>
          <SourceDetailActionsMenu
            source={source}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={source.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
                    {source.last_error}
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
                    title="Ingestion Rate"
                    value={`${source.events_per_second.toLocaleString()} EPS`}
                    icon={BarChart2}
                  />
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
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Audit & Configuration">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <StatCard
                    title="Status"
                    value={source.is_enabled ? "Enabled" : "Paused"}
                    icon={source.is_enabled ? Zap : ZapOff}
                  />
                  <StatCard
                    title="Configured By"
                    value={source.created_by}
                    icon={User}
                  />
                  <StatCard
                    title="Last Modified"
                    value={format(new Date(source.updated_at), "PPp")}
                    icon={Calendar}
                  />
                  <StatCard
                    title="Source ID"
                    value={source.id.substring(0, 8) + "..."}
                    icon={FileCog}
                    isMono
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

const CollapsibleSection = ({ title, children, defaultOpen = false }) => (
  <Disclosure
    as="div"
    className="bg-white border border-slate-200/80 rounded-xl shadow-sm"
    defaultOpen={defaultOpen}>
    {({ open }) => (
      <>
        <Disclosure.Button className="flex w-full items-center justify-between p-4 text-left">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <ChevronDown
            className={clsx(
              "h-5 w-5 text-slate-400 transition-transform",
              open && "rotate-180"
            )}
          />
        </Disclosure.Button>
        <Transition
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

const StatCard = ({ title, value, icon: Icon, isMono = false }) => (
  <div className="bg-slate-50/50 border border-slate-200/50 rounded-lg p-4 flex items-center gap-4">
    <div className="p-2 bg-white rounded-md border border-slate-200/80">
      <Icon className="h-5 w-5 text-slate-500" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p
        className={clsx(
          "text-lg font-semibold text-slate-800",
          isMono && "font-mono"
        )}>
        {value}
      </p>
    </div>
  </div>
);

function SourceDetailActionsMenu({ source, onUpdate, onDelete }) {
  const handleToggle = () => {
    onUpdate();
  };

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
            <Menu.Item>
              <button className="w-full text-left flex items-center gap-3 p-2 rounded-md text-sm text-slate-700 hover:bg-slate-100">
                <Edit size={16} /> Edit Configuration
              </button>
            </Menu.Item>
            <Menu.Item>
              <button
                onClick={handleToggle}
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
                onClick={() => onDelete(source)}
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
