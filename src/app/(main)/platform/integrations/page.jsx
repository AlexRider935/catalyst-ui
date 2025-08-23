"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import {
  Puzzle,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  Trash2,
  Plus,
  MoreHorizontal,
  RadioTower,
  Loader2,
  Mail,
  MessageSquare,
  Ticket,
  PhoneForwarded,
  Cloud,
  Shield,
  Users,
  Bot,
  Database,
  User,
  CalendarDays,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import clsx from "clsx";
import toast, { Toaster } from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import { Dialog, Transition, Menu } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import EditIntegrationModal from "./components/EditIntegrationModal";

// --- Helper: Map integration types to icons and names ---
const INTEGRATION_ICONS = {
  slack: MessageSquare,
  msteams: Bot,
  jira: Ticket,
  pagerduty: PhoneForwarded,
  crowdstrike: Shield,
  okta: Users,
  s3: Cloud,
  splunk: Database,
  email: Mail,
  webhook: Puzzle,
  default: Puzzle,
};
const INTEGRATION_TYPES = Object.keys(INTEGRATION_ICONS).filter(
  (t) => t !== "default"
);

// --- Status Badge Component ---
const StatusBadge = ({ status }) => {
  const styles = {
    Healthy: { icon: CheckCircle, color: "bg-green-100 text-green-700" },
    Degraded: { icon: AlertTriangle, color: "bg-yellow-100 text-yellow-700" },
    Error: { icon: XCircle, color: "bg-red-100 text-red-700" },
  };
  const { icon: Icon, color } = styles[status] || {
    icon: AlertTriangle,
    color: "bg-slate-100 text-slate-700",
  };

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        color
      )}>
      <Icon size={14} /> {status || "Unknown"}
    </div>
  );
};

// --- Delete Confirmation Modal (using Headless UI) ---
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  integrationName,
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-slate-900">
                      Disconnect Integration
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500">
                        Are you sure you want to disconnect the{" "}
                        <span className="font-bold text-slate-700">
                          {integrationName}
                        </span>{" "}
                        integration? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto">
                    Disconnect
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto">
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// --- Actions Menu (using Headless UI) ---
function IntegrationActionsMenu({
  integration,
  onEdit,
  onTest,
  onDisconnect,
  onToggle,
}) {
  const menuButtonClass = (active) =>
    clsx(
      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
      active ? "bg-slate-100 text-slate-900" : "text-slate-700"
    );
  const destructiveButtonClass = (active) =>
    clsx(
      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
      active ? "bg-red-50 text-red-700" : "text-red-600"
    );

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
        <MoreHorizontal size={18} aria-hidden="true" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95">
        <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-slate-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onTest(integration)}
                  className={menuButtonClass(active)}>
                  <RadioTower size={16} /> Send Test Dispatch
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onToggle(integration, !integration.isEnabled)}
                  className={menuButtonClass(active)}>
                  {integration.isEnabled ? (
                    <ToggleLeft size={16} />
                  ) : (
                    <ToggleRight size={16} />
                  )}
                  {integration.isEnabled ? "Disable" : "Enable"}
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onEdit(integration)}
                  className={menuButtonClass(active)}>
                  <Settings size={16} /> Edit Configuration
                </button>
              )}
            </Menu.Item>
          </div>
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onDisconnect(integration)}
                  className={destructiveButtonClass(active)}>
                  <Trash2 size={16} /> Disconnect
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

// --- Main Integrations Page ---
export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [integrationToDisconnect, setIntegrationToDisconnect] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [integrationToEdit, setIntegrationToEdit] = useState(null);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/integrations");
      if (!response.ok) throw new Error("Failed to fetch integrations");
      const data = await response.json();
      setIntegrations(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch integrations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleDelete = async () => {
    if (!integrationToDisconnect) return;
    const originalIntegrations = [...integrations];
    const integrationToDelete = { ...integrationToDisconnect };
    setIntegrationToDisconnect(null);

    const apiPromise = fetch(`/api/integrations/${integrationToDelete.id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (!res.ok) {
        const result = await res.json();
        throw new Error(
          result.details || result.error || "An unknown error occurred."
        );
      }
      setIntegrations(
        integrations.filter((i) => i.id !== integrationToDelete.id)
      );
      return res.json();
    });

    toast.promise(apiPromise, {
      loading: `Disconnecting ${integrationToDelete.name}...`,
      success: (result) => result.message || "Integration disconnected!",
      error: (err) => {
        setIntegrations(originalIntegrations);
        return `Failed: ${err.toString()}`;
      },
    });
  };

  // ✅ CORRECTED: This function now properly handles the save logic.
  const handleSaveEdit = async (updatedIntegration) => {
    const { id, name, config } = updatedIntegration;
    const originalIntegrations = [...integrations];

    // Optimistically update the name in the UI and close the modal
    setIntegrations(
      integrations.map((i) => (i.id === id ? { ...i, name } : i))
    );
    setIsEditModalOpen(false);
    setIntegrationToEdit(null);

    // Construct the payload with only the fields that are being updated.
    const payload = { name };
    if (config && Object.keys(config).length > 0) {
      payload.config = config;
    }

    const apiPromise = fetch(`/api/integrations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error("Failed to save changes.");
      }
      // On success, refresh all data from the server to ensure consistency.
      await fetchIntegrations();
      return res.json();
    });

    toast.promise(apiPromise, {
      loading: "Saving changes...",
      success: "Integration updated successfully!",
      error: (err) => {
        // Revert the UI on failure
        setIntegrations(originalIntegrations);
        return err.toString();
      },
    });
  };

  const handleToggleEnabled = async (integration, newEnabledState) => {
    const originalIntegrations = [...integrations];
    setIntegrations(
      integrations.map((i) =>
        i.id === integration.id ? { ...i, isEnabled: newEnabledState } : i
      )
    );

    const apiPromise = fetch(`/api/integrations/${integration.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_enabled: newEnabledState }),
    }).then(async (res) => {
      if (!res.ok) throw new Error("API request failed");
      fetchIntegrations();
      return res.json();
    });

    toast.promise(apiPromise, {
      loading: newEnabledState ? "Enabling..." : "Disabling...",
      success: `Integration ${newEnabledState ? "enabled" : "disabled"}.`,
      error: (err) => {
        setIntegrations(originalIntegrations);
        return "Operation failed.";
      },
    });
  };

  const filteredIntegrations = integrations
    .filter((i) => statusFilter === "All" || i.status === statusFilter)
    .filter((i) => typeFilter === "All" || i.type === typeFilter)
    .filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleEditAction = (integration) => {
    setIntegrationToEdit(integration);
    setIsEditModalOpen(true);
  };

  const handleDisconnectAction = (integration) => {
    setIntegrationToDisconnect(integration);
  };

  const handleTestAction = async (integration) => {
    if (!integration) return;
    let requestBody = null;
    const requestHeaders = { "Content-Type": "application/json" };
    if (integration.type === "email") {
      const testEmail = prompt(
        "Enter recipient email for the test dispatch:",
        "test@example.com"
      );
      if (!testEmail)
        return toast.error("Test cancelled: Recipient email is required.");
      requestBody = JSON.stringify({ testEmail });
    }
    const apiPromise = fetch(`/api/integrations/${integration.id}/test`, {
      method: "POST",
      headers: requestHeaders,
      body: requestBody,
    }).then(async (res) => {
      const result = await res.json();
      if (!res.ok) {
        throw new Error(
          result.details || result.error || "An unknown error occurred."
        );
      }
      fetchIntegrations();
      return result;
    });
    toast.promise(apiPromise, {
      loading: "Sending test dispatch...",
      success: (result) => result.message || "Dispatch sent successfully!",
      error: (err) => `Failed: ${err.toString()}`,
    });
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <DeleteConfirmationModal
        isOpen={!!integrationToDisconnect}
        onClose={() => setIntegrationToDisconnect(null)}
        onConfirm={handleDelete}
        integrationName={integrationToDisconnect?.name}
      />
      {integrationToEdit && (
        <EditIntegrationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
          integration={integrationToEdit}
        />
      )}

      <div className="space-y-6 h-full flex flex-col bg-slate-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Integrations Console
            </h1>
            <p className="mt-1 text-slate-500">
              Monitor, manage, and audit your entire security tool ecosystem.
            </p>
          </div>
          <Link href="/platform/integrations/new">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              <Plus size={18} /> New Integration
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border-slate-300 pl-10 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
            {["All", "Healthy", "Degraded", "Error"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={clsx(
                  "w-full rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                  statusFilter === status
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-600 hover:bg-white/50"
                )}>
                {status}
              </button>
            ))}
          </div>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border-slate-300 text-sm capitalize focus:border-blue-500 focus:ring-blue-500">
              <option value="All">All Types</option>
              {INTEGRATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <div className="flex h-full flex-col rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <div className="overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="w-1/12 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                      Enabled
                    </th>
                    <th
                      scope="col"
                      className="w-3/12 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                      Name
                    </th>
                    <th
                      scope="col"
                      className="w-1/12 px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th
                      scope="col"
                      className="w-1/12 px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Type
                    </th>
                    <th
                      scope="col"
                      className="w-2/12 px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Last Healthy
                    </th>
                    <th
                      scope="col"
                      className="w-2/12 px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Configured By
                    </th>
                    <th
                      scope="col"
                      className="w-2/12 px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Last Updated
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-6 text-center text-slate-500">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </td>
                    </tr>
                  ) : filteredIntegrations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-20 text-center text-slate-500">
                        <Puzzle size={32} className="mx-auto text-slate-400" />
                        <h3 className="mt-2 text-lg font-semibold">
                          No Integrations Found
                        </h3>
                        <p className="mt-1 text-sm">
                          Get started by creating a new integration.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {filteredIntegrations.map((integration) => {
                        const Icon =
                          INTEGRATION_ICONS[integration.type] ||
                          INTEGRATION_ICONS.default;
                        return (
                          <motion.tr
                            key={integration.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="transition-colors hover:bg-slate-50">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                              <button
                                onClick={() =>
                                  handleToggleEnabled(
                                    integration,
                                    !integration.isEnabled
                                  )
                                }
                                title={
                                  integration.isEnabled ? "Disable" : "Enable"
                                }>
                                {integration.isEnabled ? (
                                  <ToggleRight
                                    size={22}
                                    className="text-blue-600"
                                  />
                                ) : (
                                  <ToggleLeft
                                    size={22}
                                    className="text-slate-400"
                                  />
                                )}
                              </button>
                            </td>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                              <div className="flex items-center">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                  <Icon className="h-5 w-5 text-slate-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-slate-900">
                                    {integration.name}
                                  </div>
                                  <div className="text-slate-500 font-mono text-xs">
                                    ID: {integration.id.substring(0, 8)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                              <StatusBadge status={integration.status} />
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm capitalize text-slate-500">
                              {integration.type}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                              {integration.lastHealthyAt ? (
                                <span
                                  title={new Date(
                                    integration.lastHealthyAt
                                  ).toLocaleString()}>
                                  {formatDistanceToNow(
                                    new Date(integration.lastHealthyAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              ) : (
                                <span className="text-slate-400">Never</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-slate-400" />{" "}
                                {integration.configuredBy || "N/A"}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                              <div className="flex items-center gap-2">
                                <CalendarDays
                                  size={14}
                                  className="text-slate-400"
                                />
                                <span
                                  title={new Date(
                                    integration.updatedAt
                                  ).toLocaleString()}>
                                  {format(
                                    new Date(integration.updatedAt),
                                    "PP"
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <IntegrationActionsMenu
                                integration={integration}
                                onEdit={handleEditAction}
                                onTest={handleTestAction}
                                onDisconnect={handleDisconnectAction}
                                onToggle={handleToggleEnabled}
                              />
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
