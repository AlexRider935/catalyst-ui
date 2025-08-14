"use client";

const SettingsCard = ({ title, subtitle, children, footer }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="p-6 border-b border-slate-200">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    <div className="p-6 space-y-6">{children}</div>
    {footer && (
      <div className="bg-slate-50/80 px-6 py-4 text-right rounded-b-xl border-t border-slate-200">
        {footer}
      </div>
    )}
  </div>
);

export default function OrganizationSettings() {
  return (
    <div className="space-y-8">
      <SettingsCard
        title="Organization"
        subtitle="Update your organization's details."
        footer={
          <button
            type="button"
            className="rounded-md border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
            Save Changes
          </button>
        }>
        <label
          htmlFor="orgName"
          className="block text-sm font-medium text-slate-700">
          Organization Name
        </label>
        <input
          type="text"
          name="orgName"
          id="orgName"
          defaultValue="The Catalyst Corp."
          className="mt-1 block w-full max-w-lg rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </SettingsCard>

      <div className="rounded-xl border border-red-500/50 bg-white shadow-sm">
        <div className="p-6 border-b border-red-500/20">
          <h2 className="text-xl font-semibold text-red-800">Danger Zone</h2>
          <p className="text-sm text-slate-500 mt-1">
            These actions are irreversible. Please proceed with caution.
          </p>
        </div>
        <div className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <p className="font-semibold text-slate-800">
              Delete this organization
            </p>
            <p className="text-sm text-slate-500">
              All data, sources, and user access will be permanently removed.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md border border-red-600 bg-transparent py-2 px-4 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50 self-start sm:self-center">
            Delete Organization
          </button>
        </div>
      </div>
    </div>
  );
}
