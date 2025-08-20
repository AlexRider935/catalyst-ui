"use client";

import { Switch } from "@headlessui/react";
import clsx from "clsx";
import {
  Mail,
  MessageSquare,
  Server,
  User,
  UserCheck,
  GitBranch,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

// --- Configuration Data (duplicated for self-contained summary rendering) ---
const ACTION_CONFIG = {
  SEND_EMAIL: { name: "Send Email", icon: Mail, isDestructive: false },
  SEND_SLACK: {
    name: "Send Slack Message",
    icon: MessageSquare,
    isDestructive: false,
  },
  ISOLATE_ENDPOINT: {
    name: "Isolate Endpoint",
    icon: Server,
    isDestructive: true,
  },
  DISABLE_USER: { name: "Disable User", icon: User, isDestructive: true },
  MANUAL_APPROVAL: {
    name: "Manual Approval",
    icon: UserCheck,
    isDestructive: false,
  },
};

const TRIGGER_CONFIG = {
  RULE_MATCH: { name: "Detection Rule Match", icon: GitBranch },
  SECURITY_EVENT: { name: "Security Event", icon: ShieldAlert },
};

export default function ReviewActivateCard({ playbook, setPlaybook }) {
  const { name, description, owner, tags, trigger, actions, isEnabled } =
    playbook;

  // A simplified summary generator for the trigger
  const renderTriggerSummary = () => {
    const triggerInfo = TRIGGER_CONFIG[trigger.type] || { name: trigger.type };
    const conditionsCount = trigger.config.conditions?.length || 0;
    return `Triggers on **${triggerInfo.name}** with **${conditionsCount} condition(s)**.`;
  };

  const formattedSummary = (text) => {
    return text.split("**").map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-semibold text-slate-800">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg mb-6">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">
          4. Review & Activate
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Verify the playbook configuration and set its initial status.
        </p>
      </div>
      <div className="p-6 space-y-8">
        {/* Playbook Summary Section */}
        <div>
          <h4 className="text-base font-semibold text-slate-900 mb-3">
            Configuration Summary
          </h4>
          <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50/70">
            {/* Details Summary */}
            <div className="pb-3 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Details
              </p>
              <p className="text-sm text-slate-600">
                <strong>Name:</strong> {name || "(Not set)"}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Owner:</strong> {owner || "(Not set)"}
              </p>
              <div className="text-sm text-slate-600 flex items-start gap-2">
                <strong>Tags:</strong>
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-slate-200 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  "(None)"
                )}
              </div>
            </div>

            {/* Trigger Summary */}
            <div className="pb-3 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Trigger
              </p>
              <p className="text-sm text-slate-600">
                {formattedSummary(renderTriggerSummary())}
              </p>
            </div>

            {/* Actions Summary */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">
                Actions Sequence
              </p>
              {actions.length > 0 ? (
                <ol className="list-decimal list-inside space-y-2">
                  {actions.map((action, index) => {
                    const actionInfo = ACTION_CONFIG[action.type] || {
                      name: action.type,
                      isDestructive: true,
                    };
                    return (
                      <li
                        key={action.id}
                        className="text-sm text-slate-600 flex items-center gap-2">
                        <span className="font-medium text-slate-800">
                          {actionInfo.name}
                        </span>
                        {actionInfo.isDestructive && (
                          <span title="This is a high-impact action.">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="text-sm text-slate-500">
                  No actions have been added.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Activation Section */}
        <div>
          <h4 className="text-base font-semibold text-slate-900 mb-3">
            Activation Status
          </h4>
          <div className="p-4 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-slate-800">
                  Playbook Status
                </h5>
                <p className="text-sm text-slate-500">
                  Enable this playbook to run when its trigger conditions are
                  met.
                </p>
              </div>
              <Switch
                checked={isEnabled}
                onChange={(value) =>
                  setPlaybook((prev) => ({ ...prev, isEnabled: value }))
                }
                className={clsx(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                  isEnabled ? "bg-blue-600" : "bg-slate-300"
                )}>
                <span className="sr-only">Enable playbook</span>
                <span
                  className={clsx(
                    "inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    isEnabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </Switch>
            </div>
            <div
              className={clsx(
                "mt-3 flex items-center gap-2 text-sm font-semibold transition-opacity",
                isEnabled
                  ? "text-green-600 opacity-100"
                  : "text-slate-500 opacity-70"
              )}>
              {isEnabled ? <CheckCircle size={16} /> : <Info size={16} />}
              <span>
                {isEnabled
                  ? "This playbook will be ACTIVE upon saving."
                  : "This playbook will be INACTIVE upon saving."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
