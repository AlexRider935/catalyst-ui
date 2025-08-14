"use client";

import { Fragment, useState } from "react";
import {
  Plus,
  MoreVertical,
  X,
  AlertTriangle,
  Shield,
  UserCheck,
  User,
  Bot,
  KeyRound,
  Lock,
  History,
  Trash2,
} from "lucide-react";
import { Menu, Transition } from "@headlessui/react";

// --- Reusable Components ---
const SettingsCard = ({ title, description, children, headerAction }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {headerAction && <div>{headerAction}</div>}
    </div>
    {children}
  </div>
);

const RoleBadge = ({ role }) => {
  const roleStyles = {
    Owner: "bg-slate-800 text-white",
    Admin: "bg-blue-100 text-blue-800",
    Member: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
        roleStyles[role] || "bg-gray-100"
      }`}>
      {role}
    </span>
  );
};

// --- Modals (Invite, Remove) ---
const InviteMemberModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl m-4">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Invite New Member
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter an email address and select a role.
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="name@company.com"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Role
            </label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="Admin"
                  className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <p className="font-semibold text-slate-800">Admin</p>
                  <p className="text-xs text-slate-500">
                    Can manage users, settings, and billing.
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="Member"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <p className="font-semibold text-slate-800">Member</p>
                  <p className="text-xs text-slate-500">
                    Can view and manage security data.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Cancel
          </button>
          <button className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
};

const RemoveMemberModal = ({ member, onClose }) => {
  if (!member) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl m-4">
        <div className="p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Remove Member?
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Are you sure you want to remove{" "}
            <strong className="text-slate-700">{member.name}</strong>? They will
            immediately lose all access to this organization.
          </p>
        </div>
        <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={() => {
              console.log(`Removing ${member.name}`);
              onClose();
            }}
            className="rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-red-700">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function TeamSettings() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const teamMembers = [
    {
      name: "Alex Rider",
      email: "director@thecatalyst.io",
      role: "Owner",
      avatar: "https://i.pravatar.cc/150?u=alexrider",
      lastActive: "Active now",
    },
    {
      name: "Jane Doe",
      email: "jane.doe@thecatalyst.io",
      role: "Admin",
      avatar: "https://i.pravatar.cc/150?u=janedoe",
      lastActive: "3 hours ago",
    },
    {
      name: "John Smith",
      email: "john.smith@thecatalyst.io",
      role: "Member",
      avatar: "https://i.pravatar.cc/150?u=johnsmith",
      lastActive: "1 day ago",
    },
  ];

  const pendingInvites = [
    {
      email: "new.analyst@thecatalyst.io",
      role: "Member",
      invitedBy: "Alex Rider",
      expires: "in 7 days",
    },
  ];

  const serviceAccounts = [
    {
      name: "CI/CD Pipeline",
      createdBy: "Alex Rider",
      role: "Admin",
      lastUsed: "2 hours ago",
    },
  ];

  return (
    <>
      <div className="space-y-8">
        <SettingsCard
          title="Identity & Provisioning"
          description="Configure Single Sign-On (SSO) and user provisioning (SCIM).">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-4">
                <Lock className="h-6 w-6 text-slate-500" />
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Single Sign-On (SSO)
                  </h3>
                  <p className="text-sm text-slate-500">
                    SAML 2.0 and OIDC supported.
                  </p>
                </div>
              </div>
              <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                Configure
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-4">
                <UserCheck className="h-6 w-6 text-slate-500" />
                <div>
                  <h3 className="font-semibold text-slate-800">
                    User Provisioning (SCIM)
                  </h3>
                  <p className="text-sm text-slate-500">
                    Automate user management.
                  </p>
                </div>
              </div>
              <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                Configure
              </button>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Roles & Permissions"
          description="Define roles to control access to the platform."
          headerAction={
            <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5">
              <History size={14} /> View Audit Log
            </button>
          }>
          <ul className="divide-y divide-slate-200">
            <li className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold text-slate-800">Owner</h3>
                <p className="text-sm text-slate-500">
                  Full administrative access. Can manage billing and delete the
                  organization.
                </p>
              </div>
            </li>
            <li className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold text-slate-800">Admin</h3>
                <p className="text-sm text-slate-500">
                  Can manage users, settings, and data sources.
                </p>
              </div>
            </li>
            <li className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold text-slate-800">Member</h3>
                <p className="text-sm text-slate-500">
                  Can view and manage security data, but cannot change settings.
                </p>
              </div>
            </li>
          </ul>
        </SettingsCard>

        <SettingsCard
          title="Team Members"
          description="Manage who has access to this organization."
          headerAction={
            <button
              onClick={() => setIsInviteModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              <Plus size={16} /> Invite Member
            </button>
          }>
          <ul className="divide-y divide-slate-200">
            {teamMembers.map((member) => (
              <li
                key={member.email}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {member.name}
                    </p>
                    <p className="text-sm text-slate-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <p className="text-sm text-slate-500">{member.lastActive}</p>
                  <RoleBadge role={member.role} />
                  <Menu as="div" className="relative">
                    <Menu.Button className="p-2 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                      <MoreVertical size={16} />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95">
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1">
                          <Menu.Item>
                            <a
                              href="#"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                              <UserCheck size={14} /> Change Role
                            </a>
                          </Menu.Item>
                          <Menu.Item>
                            <button
                              onClick={() => setMemberToRemove(member)}
                              className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                              <Trash2 size={14} /> Remove Member
                            </button>
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </li>
            ))}
          </ul>
        </SettingsCard>

        <SettingsCard
          title="Pending Invitations"
          description="These users have been invited but have not yet joined.">
          <ul className="divide-y divide-slate-200">
            {pendingInvites.map((invite) => (
              <li
                key={invite.email}
                className="flex items-center justify-between p-6">
                <div>
                  <p className="font-semibold text-slate-800">{invite.email}</p>
                  <p className="text-sm text-slate-500">
                    Invited by {invite.invitedBy} &bull;{" "}
                    <span className="font-medium text-amber-600">
                      Expires {invite.expires}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <RoleBadge role={invite.role} />
                  <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                    Resend
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </SettingsCard>

        <SettingsCard
          title="Service Accounts"
          description="Manage non-human accounts for programmatic access and automation."
          headerAction={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              <Plus size={16} /> New Service Account
            </button>
          }>
          <ul className="divide-y divide-slate-200">
            {serviceAccounts.map((account) => (
              <li
                key={account.name}
                className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Bot size={20} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {account.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Created by {account.createdBy} &bull; Last used{" "}
                      {account.lastUsed}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <RoleBadge role={account.role} />
                  <button className="p-2 text-slate-400 hover:text-slate-600">
                    <KeyRound size={16} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </SettingsCard>
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
      <RemoveMemberModal
        member={memberToRemove}
        onClose={() => setMemberToRemove(null)}
      />
    </>
  );
}
