"use client";

import {
  CreditCard,
  Download,
  Edit3,
  Plus,
  Users,
  Database,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

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
    <div className="p-6">{children}</div>
  </div>
);

// ARCHITECT'S NOTE: This is a placeholder for your custom Visa icon component.
const VisaIcon = (props) => (
  <div
    {...props}
    className="w-[38px] h-[24px] bg-blue-900 rounded flex items-center justify-center text-white font-bold text-xs">
    VISA
  </div>
);

// --- Main Component ---
export default function BillingSettings() {
  const invoiceHistory = [
    {
      id: "INV-2025-008",
      date: "August 1, 2025",
      period: "Aug 2025 - Sep 2025",
      amount: "$499.00",
      status: "Paid",
    },
    {
      id: "INV-2025-007",
      date: "July 1, 2025",
      period: "Jul 2025 - Aug 2025",
      amount: "$499.00",
      status: "Paid",
    },
    {
      id: "INV-2025-006",
      date: "June 1, 2025",
      period: "Jun 2025 - Jul 2025",
      amount: "$499.00",
      status: "Paid",
    },
  ];

  return (
    <div className="space-y-8">
      <SettingsCard
        title="Current Plan"
        description="You are currently on the Pro Plan. Billed monthly."
        headerAction={
          <button
            type="button"
            className="cursor-pointer rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Manage Subscription
          </button>
        }>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Plan Cost</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                $499
                <span className="text-base font-medium text-slate-500">
                  /mo
                </span>
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Next payment on Sep 1, 2025.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Team Members
                </p>
                <Users size={16} className="text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                3{" "}
                <span className="text-base font-medium text-slate-500">
                  / 10 seats
                </span>
              </p>
            </div>
            <a
              href="#"
              className="text-xs font-semibold text-blue-600 hover:underline mt-2">
              View Usage Details
            </a>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Data Ingestion
              </p>
              <Database size={16} className="text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              152{" "}
              <span className="text-base font-medium text-slate-500">
                / 500 GB
              </span>
            </p>
            <a
              href="#"
              className="text-xs font-semibold text-blue-600 hover:underline mt-2">
              View Usage Details
            </a>
          </div>
        </div>
      </SettingsCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SettingsCard
          title="Payment Method"
          headerAction={
            <button
              type="button"
              className="cursor-pointer flex items-center gap-2 rounded-md border border-slate-300 bg-white py-2 px-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
              <Plus size={16} /> Add Method
            </button>
          }>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-4">
              <VisaIcon />
              <div>
                <p className="font-semibold text-slate-800">
                  Visa ending in 4242
                </p>
                <p className="text-sm text-slate-500">Expires 12/2028</p>
              </div>
            </div>
            <button className="cursor-pointer text-sm font-semibold text-slate-600 hover:text-slate-900">
              Edit
            </button>
          </div>
        </SettingsCard>
        <SettingsCard
          title="Billing Contact & Details"
          description="Invoices and notifications will be sent here.">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="font-semibold text-slate-800">
                billing@thecatalyst.io
              </p>
              <p className="text-sm text-slate-500">
                Purchase Order (PO) Number:{" "}
                <span className="font-medium text-slate-700">CAT-PO-2025</span>
              </p>
            </div>
            <button className="cursor-pointer text-sm font-semibold text-slate-600 hover:text-slate-900">
              Edit
            </button>
          </div>
        </SettingsCard>
      </div>

      <SettingsCard
        title="Invoice History"
        description="Review and download past invoices for your records.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 bg-slate-50">
              <tr>
                <th className="p-4 font-medium">Invoice ID</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Period</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoiceHistory.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono text-slate-700">{invoice.id}</td>
                  <td className="p-4 text-slate-600">{invoice.date}</td>
                  <td className="p-4 text-slate-600">{invoice.period}</td>
                  <td className="p-4 font-medium text-slate-800">
                    {invoice.amount}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle size={12} />
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href="#"
                      className="cursor-pointer inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                      <Download size={14} /> Download PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsCard>
    </div>
  );
}
