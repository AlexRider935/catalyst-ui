"use client";

import { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  AlertTriangle,
  Globe,
  Lock,
  Users,
  Plus,
  Trash2,
  Mail,
} from "lucide-react";

// --- Reusable Card Component ---
const SettingsCard = ({ title, description, children, footer, isDanger }) => (
  <div
    className={`rounded-xl border ${
      isDanger ? "border-red-500/30" : "border-slate-200"
    } bg-white shadow-sm`}>
    <div
      className={`p-6 border-b ${
        isDanger ? "border-red-500/20" : "border-slate-200"
      }`}>
      <h2
        className={`text-xl font-semibold ${
          isDanger ? "text-red-800" : "text-slate-800"
        }`}>
        {title}
      </h2>
      {description && (
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      )}
    </div>
    <div className="p-6">{children}</div>
    {footer && (
      <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-end items-center gap-3">
        {footer}
      </div>
    )}
  </div>
);

// --- Main Component ---
export default function OrganizationSettings() {
  const initialData = {
    orgName: "The Catalyst Corp.",
    sessionTimeout: "8h",
    dataRegion: "us-east-1",
    ipAllowlist: "203.0.113.1/24\n198.51.100.5",
    verifiedDomain: "thecatalyst.io",
    securityContact: "security@thecatalyst.io",
  };

  const [formData, setFormData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsDirty(
      JSON.stringify(formData) !== JSON.stringify(initialData) ||
        logoPreview !== null
    );
  }, [formData, initialData, logoPreview]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = (section) => {
    console.log(`Saving ${section} settings...`, formData);
    // In a real app, you'd likely save only the relevant part of the form
    setIsDirty(false);
  };

  return (
    <div className="space-y-8">
      <SettingsCard
        title="Organization Details"
        description="Update your organization's name and branding for reports."
        footer={
          <button
            type="button"
            onClick={() => handleSaveChanges("Details")}
            disabled={!isDirty}
            className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
            Save Changes
          </button>
        }>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="orgName"
              className="block text-sm font-medium text-slate-700">
              Organization Name
            </label>
            <input
              type="text"
              name="orgName"
              id="orgName"
              value={formData.orgName}
              onChange={handleInputChange}
              className="mt-1 block w-full max-w-lg rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Branding for Reports
            </label>
            <div className="mt-2 flex items-center gap-6">
              <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-full w-full object-contain rounded-lg"
                  />
                ) : (
                  <span className="font-bold text-2xl text-slate-400">C</span>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoChange}
                className="hidden"
                accept="image/png, image/svg+xml"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="flex items-center gap-2 rounded-md border border-slate-300 bg-white py-2 px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                <UploadCloud size={16} /> Upload Logo
              </button>
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Access Control"
        description="Manage organization-wide access policies."
        footer={
          <button
            type="button"
            onClick={() => handleSaveChanges("Access")}
            disabled={!isDirty}
            className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
            Save Policies
          </button>
        }>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="sessionTimeout"
              className="block text-sm font-medium text-slate-700">
              Session Timeout
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Automatically log out inactive users after a set period of time.
            </p>
            <select
              id="sessionTimeout"
              name="sessionTimeout"
              value={formData.sessionTimeout}
              onChange={handleInputChange}
              className="mt-2 block w-full max-w-xs rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
              <option value="15m">15 minutes</option>
              <option value="1h">1 hour</option>
              <option value="8h">8 hours</option>
              <option value="24h">24 hours (Compliance Default)</option>
              <option value="never">Never (Not Recommended)</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="ipAllowlist"
              className="block text-sm font-medium text-slate-700">
              IP Allowlist
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Only allow access from the following IP addresses or CIDR ranges
              (one per line).
            </p>
            <textarea
              id="ipAllowlist"
              name="ipAllowlist"
              value={formData.ipAllowlist}
              onChange={handleInputChange}
              rows={4}
              className="mt-2 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono text-xs"
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Identity & Provisioning"
        description="Configure Single Sign-On (SSO) and user provisioning (SCIM).">
        <div className="space-y-4">
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
              <Users className="h-6 w-6 text-slate-500" />
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
        title="Email & Communication"
        description="Manage how the platform communicates with your organization."
        footer={
          <button
            type="button"
            onClick={() => handleSaveChanges("Email")}
            disabled={!isDirty}
            className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
            Save Settings
          </button>
        }>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="verifiedDomain"
              className="block text-sm font-medium text-slate-700">
              Verified Domain
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Restrict new member invitations to this email domain.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                name="verifiedDomain"
                id="verifiedDomain"
                value={formData.verifiedDomain}
                onChange={handleInputChange}
                className="block w-full max-w-xs rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                Verify
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="securityContact"
              className="block text-sm font-medium text-slate-700">
              Security Contact Email
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Critical security notifications will be sent to this address.
            </p>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                name="securityContact"
                id="securityContact"
                value={formData.securityContact}
                onChange={handleInputChange}
                className="pl-9 block w-full max-w-lg rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Data Governance"
        description="Configure data residency for compliance requirements."
        footer={
          <button
            type="button"
            onClick={() => handleSaveChanges("Data")}
            disabled={!isDirty}
            className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
            Update Region
          </button>
        }>
        <div>
          <label
            htmlFor="dataRegion"
            className="block text-sm font-medium text-slate-700">
            Data Residency
          </label>
          <p className="text-xs text-slate-500 mt-1">
            Select the geographic region where your data will be stored and
            processed.
          </p>
          <select
            id="dataRegion"
            name="dataRegion"
            value={formData.dataRegion}
            onChange={handleInputChange}
            className="mt-2 block w-full max-w-xs rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm">
            <option value="us-east-1">United States (N. Virginia)</option>
            <option value="eu-west-1">Europe (Ireland)</option>
            <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
          </select>
        </div>
      </SettingsCard>

      <SettingsCard title="Danger Zone" isDanger={true}>
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">
            Delete this organization
          </h3>
          <p className="text-sm text-slate-500">
            All data, sources, and user access will be permanently removed.{" "}
            <strong className="font-semibold">
              This action is irreversible.
            </strong>
          </p>
          <div>
            <label
              htmlFor="deleteConfirm"
              className="block text-sm font-medium text-slate-700">
              To confirm, type "
              <strong className="text-red-700">{initialData.orgName}</strong>"
              below:
            </label>
            <input
              id="deleteConfirm"
              name="deleteConfirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-end">
          <button
            type="button"
            disabled={deleteConfirm !== initialData.orgName}
            className="rounded-md border border-red-300 bg-red-50 py-2 px-4 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed">
            Delete Organization
          </button>
        </div>
      </SettingsCard>
    </div>
  );
}
