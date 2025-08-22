"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
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
} from "lucide-react";
import clsx from "clsx";
import { createPortal } from "react-dom";
import toast, { Toaster } from "react-hot-toast"; // REQUIRED CHANGE
import EditIntegrationModal from "./components/EditIntegrationModal";

// --- Helper: Map integration types to icons ---
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

// --- Delete Confirmation Modal ---
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  integrationName,
}) {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[10000]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
          <div className="flex items-start gap-4">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle
                className="h-6 w-6 text-red-600"
                aria-hidden="true"
              />
            </div>
            <div className="mt-0 flex-1">
              <h3 className="text-lg font-semibold leading-6 text-slate-900">
                Disconnect Integration
              </h3>
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
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
              onClick={onConfirm}>
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// --- Portal-based Actions Menu ---
function ActionsMenu({ anchorRect, onClose, onEdit, onTest, onDisconnect }) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    transformOrigin: "top right",
  });

  useLayoutEffect(() => {
    if (!anchorRect) return;
    const GAP = 8;
    const width = 240;
    const height = 140;
    const top = anchorRect.bottom + GAP;
    const left = anchorRect.right - width;
    setPos({ top, left, transformOrigin: "top right" });
  }, [anchorRect]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (
        !menuRef.current ||
        !(e.target instanceof Node) ||
        !menuRef.current.contains(e.target)
      ) {
        onClose?.();
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      style={{
        top: pos.top,
        left: pos.left,
        transformOrigin: pos.transformOrigin,
      }}
      className="fixed z-[9999] w-60 select-none rounded-md border border-slate-200 bg-white p-1 shadow-xl">
      <button
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100"
        onClick={() => {
          onTest?.();
          onClose?.();
        }}>
        <RadioTower size={16} /> Send Test Dispatch
      </button>
      <button
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100"
        onClick={() => {
          onEdit?.();
          onClose?.();
        }}>
        <Settings size={16} /> Edit Configuration
      </button>
      <div className="my-1 h-px w-full bg-slate-200" />
      <button
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        onClick={() => {
          onDisconnect?.();
          onClose?.();
        }}>
        <Trash2 size={16} /> Disconnect
      </button>
    </div>,
    document.body
  );
}

// --- Main Integrations Page ---
export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [integrationToDisconnect, setIntegrationToDisconnect] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [integrationToEdit, setIntegrationToEdit] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchorRect, setMenuAnchorRect] = useState(null);
  const [menuIntegration, setMenuIntegration] = useState(null);

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
    setIntegrations(
      integrations.filter((i) => i.id !== integrationToDelete.id)
    );

    const apiPromise = fetch(`/api/integrations/${integrationToDelete.id}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (!res.ok) {
        const result = await res.json();
        throw new Error(
          result.details || result.error || "An unknown error occurred."
        );
      }
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

  const handleSaveEdit = async (updatedIntegration) => {
    const originalIntegrations = [...integrations];
    setIntegrations(
      integrations.map((i) =>
        i.id === updatedIntegration.id ? updatedIntegration : i
      )
    );
    try {
      const response = await fetch(
        `/api/integrations/${updatedIntegration.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: updatedIntegration.name }),
        }
      );
      if (!response.ok) {
        setIntegrations(originalIntegrations);
        throw new Error("Failed to save changes");
      }
      await fetchIntegrations();
    } catch (error) {
      console.error(error);
      setIntegrations(originalIntegrations);
    } finally {
      setIsEditModalOpen(false);
      setIntegrationToEdit(null);
    }
  };

  const filteredIntegrations = integrations
    .filter((i) => statusFilter === "All" || i.status === statusFilter)
    .filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const openActionsMenu = (e, integration) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuAnchorRect(rect);
    setMenuIntegration(integration);
    setMenuOpen(true);
  };

  const handleEdit = () => {
    if (!menuIntegration) return;
    setIntegrationToEdit(menuIntegration);
    setIsEditModalOpen(true);
  };

  const handleTest = async () => {
    if (!menuIntegration) return;
    let requestBody = null;
    const requestHeaders = { "Content-Type": "application/json" };
    if (menuIntegration.type === "email") {
      const testEmail = prompt(
        "Enter recipient email for the test dispatch:",
        "test@example.com"
      );
      if (!testEmail)
        return toast.error("Test cancelled: Recipient email is required.");
      requestBody = JSON.stringify({ testEmail });
    }
    const apiPromise = fetch(`/api/integrations/${menuIntegration.id}/test`, {
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
      // On success, refresh the integration data to show the new 'last_healthy_at' time
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
      <EditIntegrationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        integration={integrationToEdit}
      />
      {menuOpen && (
        <ActionsMenu
          anchorRect={menuAnchorRect}
          onClose={() => setMenuOpen(false)}
          onEdit={handleEdit}
          onTest={handleTest}
          onDisconnect={() => setIntegrationToDisconnect(menuIntegration)}
        />
      )}
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Integrations</h1>
            <p className="mt-1 text-slate-500">
              Connect, monitor, and manage your security tool ecosystem.
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
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search integrations by name..."
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
                  "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                  statusFilter === status
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-600 hover:bg-white/50"
                )}>
                {status}
              </button>
            ))}
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
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Last Healthy
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
                        colSpan={5}
                        className="p-6 text-center text-slate-500">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </td>
                    </tr>
                  ) : filteredIntegrations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-6 text-center text-slate-500">
                        No integrations found.
                      </td>
                    </tr>
                  ) : (
                    filteredIntegrations.map((integration) => {
                      const Icon =
                        INTEGRATION_ICONS[integration.type] ||
                        INTEGRATION_ICONS.default;
                      return (
                        <tr
                          key={integration.id}
                          className="transition-colors hover:bg-slate-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                <Icon className="h-5 w-5 text-slate-600" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-slate-900">
                                  {integration.name}
                                </div>
                                <div className="text-slate-500">
                                  ID: {integration.id.substring(0, 8)}...
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
                            {integration.last_healthy_at ? (
                              new Date(
                                integration.last_healthy_at
                              ).toLocaleString()
                            ) : (
                              <span className="text-slate-400">Never</span>
                            )}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              type="button"
                              className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                              onClick={(e) => openActionsMenu(e, integration)}
                              aria-label={`Open actions for ${integration.name}`}>
                              <MoreHorizontal size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
