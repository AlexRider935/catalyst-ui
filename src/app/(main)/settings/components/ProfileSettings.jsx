"use client";

import { useState, useEffect, useRef } from "react";
import {
  Camera,
  LogOut,
  Github,
  Key,
  Phone,
  Shield,
  AlertTriangle,
} from "lucide-react";

// --- ARCHITECT'S NOTE ---
// All brand icons like <GoogleIcon /> are placeholders.
// You will need to create these components and import them.
// Example: src/components/icons/GoogleIcon.jsx

// --- Reusable Components ---
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
    {children}
    {footer && (
      <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-between items-center">
        {footer}
      </div>
    )}
  </div>
);

// Placeholder for your custom Google icon component
const GoogleIcon = (props) => (
  <div
    {...props}
    className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
    G
  </div>
);

// --- Main Component ---
export default function ProfileSettings() {
  const initialData = {
    name: "Alex Rider",
    email: "director@thecatalyst.io",
    role: "Administrator", // This would likely be read-only
    contactPhone: "+1 (555) 123-4567",
    pgpKey: `-----BEGIN PGP PUBLIC KEY BLOCK-----
...
-----END PGP PUBLIC KEY BLOCK-----`,
  };

  const [formData, setFormData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(
    "https://i.pravatar.cc/150?u=alexrider"
  );
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsDirty(
      JSON.stringify(formData) !== JSON.stringify(initialData) ||
        avatarPreview.startsWith("blob:")
    );
  }, [formData, initialData, avatarPreview]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // CORRECTED: Properly uses the input's 'name' attribute as the key.
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(initialData);
    setAvatarPreview("https://i.pravatar.cc/150?u=alexrider");
    setDeleteConfirm("");
  };

  const handleSaveChanges = () => {
    console.log("Saving data:", formData);
    // Here you would typically make an API call to save the data.
    // After a successful save, you might want to reset the 'dirty' state.
    setIsDirty(false);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm === "DELETE MY ACCOUNT") {
      console.log("Deleting account...");
      // API call to delete the account would go here.
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-8">
      <SettingsCard
        title="User Profile"
        description="Manage your personal information and contact details."
        footer={
          <>
            <p className="text-sm text-slate-500">
              Changes are tracked for audit purposes.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={!isDirty}
                className="rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                Reset
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={!isDirty}
                className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                Save Changes
              </button>
            </div>
          </>
        }>
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-6">
            <div className="relative group shrink-0">
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/png, image/jpeg"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Role</p>
                <p className="font-semibold text-slate-800">{formData.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">MFA Status</p>
                <p className="font-semibold text-green-600 flex items-center gap-2">
                  <Shield size={16} /> Enabled
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="contactPhone"
              className="block text-sm font-medium text-slate-700">
              Contact Phone
            </label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={handleInputChange}
                className="pl-9 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="pgpKey"
              className="block text-sm font-medium text-slate-700">
              PGP Public Key
            </label>
            <textarea
              id="pgpKey"
              name="pgpKey"
              value={formData.pgpKey}
              onChange={handleInputChange}
              rows={5}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono text-xs"
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Connected Accounts"
        description="Manage third-party integrations for your personal account.">
        <div className="p-6">
          <ul className="divide-y divide-slate-200">
            <li className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <Github className="h-6 w-6" />
                <p className="font-semibold text-slate-800">GitHub</p>
              </div>
              <button
                type="button"
                onClick={() => console.log("Disconnecting GitHub...")}
                className="rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer">
                Disconnect
              </button>
            </li>
            <li className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <GoogleIcon />
                <p className="font-semibold text-slate-800">Google</p>
              </div>
              <button
                type="button"
                onClick={() => console.log("Connecting Google...")}
                className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 cursor-pointer">
                Connect
              </button>
            </li>
          </ul>
        </div>
      </SettingsCard>

      <SettingsCard title="Danger Zone" isDanger={true}>
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">
            Delete Personal Account
          </h3>
          <p className="text-sm text-slate-500">
            This action will permanently delete your personal user account, API
            keys, and settings. This cannot be undone.
          </p>
          <div>
            <label
              htmlFor="deleteConfirm"
              className="block text-sm font-medium text-slate-700">
              To confirm, type "DELETE MY ACCOUNT" below:
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
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== "DELETE MY ACCOUNT"}
            className="rounded-md border border-red-300 bg-red-50 py-2 px-4 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <LogOut className="inline -ml-1 mr-2 h-4 w-4" /> Delete Account
          </button>
        </div>
      </SettingsCard>
    </div>
  );
}
