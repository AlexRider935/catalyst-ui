"use client";

import { useState, useEffect, useRef } from "react";
import { Camera } from "lucide-react";

// --- Reusable Components (can be moved to a separate file) ---
const SettingsCard = ({ title, subtitle, children, footer }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="p-6 border-b border-slate-200">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
    {footer && (
      <div className="bg-slate-50/80 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-end items-center gap-3">
        {footer}
      </div>
    )}
  </div>
);

const InputField = ({ id, label, type = "text", value, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
    <input
      type={type}
      name={id}
      id={id}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
    />
  </div>
);

// --- Main ProfileSettings Component ---
export default function ProfileSettings() {
  const initialData = {
    name: "Alex Rider",
    title: "Director of Security",
    email: "director@thecatalyst.io",
    bio: "Lead security architect with over a decade of experience in threat intelligence and platform engineering.",
    timezone: "Asia/Kolkata",
  };

  const [formData, setFormData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("https://i.pravatar.cc/150?u=alexrider");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData));
  }, [formData, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, value }));
  };

  const handleReset = () => {
    setFormData(initialData);
    setAvatarPreview("https://i.pravatar.cc/150?u=alexrider");
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setIsDirty(true);
    }
  };

  return (
    <SettingsCard
      title="Profile"
      subtitle="This information will be displayed publicly so be careful what you share."
      footer={
        <>
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty}
            className="rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            type="button"
            disabled={!isDirty}
            className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </>
      }
    >
      <div className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group shrink-0">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover transition-opacity group-hover:opacity-75"
            />
            <div 
              className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={24} className="text-white" />
              <span className="text-xs text-white mt-1">Change</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/png, image/jpeg"
            />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-slate-800">Profile Picture</h3>
            <p className="text-sm text-slate-500">Upload a new photo. We recommend a 200x200px PNG or JPG.</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField id="name" label="Full Name" value={formData.name} onChange={handleInputChange} />
          <InputField id="title" label="Job Title" value={formData.title} onChange={handleInputChange} />
        </div>

        <InputField id="email" label="Email Address" type="email" value={formData.email} onChange={handleInputChange} />

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700">Bio</label>
          <textarea
            name="bio"
            id="bio"
            rows={3}
            value={formData.bio}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <p className="mt-2 text-xs text-slate-400">A brief description for your profile.</p>
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-slate-700">Timezone</label>
          <select
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option>Pacific/Midway</option>
            <option>America/New_York</option>
            <option>Europe/London</option>
            <option>Asia/Kolkata</option>
            <option>Australia/Sydney</option>
          </select>
        </div>
      </div>
    </SettingsCard>
  );
}
