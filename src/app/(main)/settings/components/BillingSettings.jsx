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

export default function BillingSettings() {
  return (
    <SettingsCard
      title="Billing"
      subtitle="Manage your subscription and view payment history.">
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <div>
            <p className="text-lg font-semibold text-blue-900">Pro Plan</p>
            <p className="text-sm text-blue-700">
              Your organization is on the Pro tier. Next payment on Sep 1, 2025.
            </p>
          </div>
          <p className="text-3xl font-bold text-blue-900">
            $499<span className="text-lg font-medium text-blue-700">/mo</span>
          </p>
        </div>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className="rounded-md border border-blue-600 bg-transparent py-2 px-4 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100">
            Manage Subscription
          </button>
          <button
            type="button"
            className="rounded-md py-2 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Update Payment Method
          </button>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="font-semibold text-slate-800">Invoice History</h3>
        <ul className="mt-2 divide-y divide-slate-200 border rounded-lg">
          <li className="flex justify-between items-center p-4">
            <p className="font-medium text-slate-700">August 2025</p>
            <a
              href="#"
              className="text-sm font-semibold text-blue-600 hover:underline">
              Download
            </a>
          </li>
          <li className="flex justify-between items-center p-4">
            <p className="font-medium text-slate-700">July 2025</p>
            <a
              href="#"
              className="text-sm font-semibold text-blue-600 hover:underline">
              Download
            </a>
          </li>
        </ul>
      </div>
    </SettingsCard>
  );
}
