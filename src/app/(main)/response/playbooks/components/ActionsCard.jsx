"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Plus,
  X,
  GripVertical,
  Mail,
  MessageSquare,
  Server,
  User,
  AlertTriangle,
  CheckCircle,
  UserCheck,
} from "lucide-react";
import clsx from "clsx";

// --- Configuration Data ---
const ACTION_CATALOG = {
  Notification: [
    {
      id: "SEND_EMAIL",
      name: "Send Email",
      icon: Mail,
      description: "Notify stakeholders via email.",
    },
    {
      id: "SEND_SLACK",
      name: "Send Slack Message",
      icon: MessageSquare,
      description: "Send a message to a Slack channel or user.",
    },
  ],
  Enforcement: [
    {
      id: "ISOLATE_ENDPOINT",
      name: "Isolate Endpoint",
      icon: Server,
      description:
        "Block all network connections on an endpoint, except to this platform.",
    },
    {
      id: "DISABLE_USER",
      name: "Disable User",
      icon: User,
      description: "Suspend a user account in the directory.",
    },
  ],
  Control: [
    {
      id: "MANUAL_APPROVAL",
      name: "Manual Approval",
      icon: UserCheck,
      description: "Pause the playbook and require human approval to continue.",
    },
  ],
};

const getActionDefaults = (type) => {
  const base = { id: Date.now(), type };
  switch (type) {
    case "SEND_EMAIL":
      return {
        ...base,
        config: {
          recipient: "soc@example.com",
          subject: "Alert: {{trigger.rule.name}}",
          body: "See details in Catalyst.",
        },
      };
    case "SEND_SLACK":
      return {
        ...base,
        config: {
          webhookUrl: "",
          message:
            "Alert: `{{trigger.rule.name}}` has fired on `{{trigger.endpoint.hostname}}`",
        },
      };
    case "ISOLATE_ENDPOINT":
      return { ...base, config: { target: "{{trigger.endpoint.hostname}}" } };
    case "DISABLE_USER":
      return { ...base, config: { target: "{{trigger.user.name}}" } };
    case "MANUAL_APPROVAL":
      return {
        ...base,
        config: {
          approvers: "soc-leads@example.com",
          instructions:
            "Please review the case before approving endpoint isolation.",
        },
      };
    default:
      return { ...base, config: {} };
  }
};

// --- Action Item Sub-Component ---
function ActionItem({ action, onRemove, onConfigChange }) {
  const { icon: ActionIcon, name } =
    Object.values(ACTION_CATALOG)
      .flat()
      .find((a) => a.id === action.type) || {};

  const renderConfigFields = () => {
    switch (action.type) {
      case "SEND_EMAIL":
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={action.config.recipient}
                onChange={(e) =>
                  onConfigChange(action.id, "recipient", e.target.value)
                }
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={action.config.subject}
                onChange={(e) =>
                  onConfigChange(action.id, "subject", e.target.value)
                }
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </>
        );
      case "MANUAL_APPROVAL":
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Approver Group (Email)
              </label>
              <input
                type="text"
                value={action.config.approvers}
                onChange={(e) =>
                  onConfigChange(action.id, "approvers", e.target.value)
                }
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Instructions for Approver
              </label>
              <textarea
                value={action.config.instructions}
                onChange={(e) =>
                  onConfigChange(action.id, "instructions", e.target.value)
                }
                rows={3}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </>
        );
      case "ISOLATE_ENDPOINT":
      case "DISABLE_USER":
        return (
          <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800">
                High-Impact Action
              </h4>
              <p className="text-sm text-amber-700">
                This is a destructive action that can impact users or systems.
                It is strongly recommended to place a **Manual Approval** step
                before this action in a production environment.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <p className="text-sm text-slate-500">
            No configuration available for this action type.
          </p>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="flex items-center p-3">
        <GripVertical className="h-5 w-5 text-slate-400 cursor-grab" />
        <div className="flex items-center gap-3 ml-2 flex-grow">
          {ActionIcon && <ActionIcon className="h-5 w-5 text-slate-500" />}
          <span className="font-semibold text-slate-800">{name}</span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(action.id)}
          className="p-1 text-slate-400 hover:text-red-600">
          <X size={16} />
        </button>
      </div>
      <div className="border-t border-slate-200 p-4 space-y-4">
        {renderConfigFields()}
      </div>
    </div>
  );
}

// --- Main Component ---
export default function ActionsCard({
  actions,
  addAction,
  removeAction,
  handleActionConfigChange,
}) {
  let [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddAction = (type) => {
    addAction(getActionDefaults(type));
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-lg mb-6">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">3. Actions</h3>
          <p className="text-sm text-slate-500 mt-1">
            Define the sequence of steps to execute when the playbook is
            triggered.
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {actions.map((action) => (
              <ActionItem
                key={action.id}
                action={action}
                onRemove={removeAction}
                onConfigChange={handleActionConfigChange}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-4 text-sm font-semibold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition">
            <Plus size={16} /> Add Action Step
          </button>
        </div>
      </div>

      {/* Action Catalog Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsModalOpen(false)}>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-slate-900">
                    Add Action to Playbook
                  </Dialog.Title>
                  <div className="mt-4 space-y-4">
                    {Object.entries(ACTION_CATALOG).map(([category, items]) => (
                      <div key={category}>
                        <h4 className="font-semibold text-slate-600 mb-2">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleAddAction(item.id)}
                              className="flex items-start text-left gap-4 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition w-full">
                              <item.icon className="h-6 w-6 text-slate-500 flex-shrink-0 mt-1" />
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {item.name}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {item.description}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
