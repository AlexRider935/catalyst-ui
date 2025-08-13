"use client";

import { LifeBuoy, Search, BookOpen, MessageSquare, Mail } from "lucide-react";

// --- Support Card Component ---
const SupportCard = ({ icon: Icon, title, description, buttonText }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
        <Icon size={20} className="text-slate-600" />
      </div>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
    </div>
    <p className="mt-4 text-sm text-slate-500 flex-grow">{description}</p>
    <button className="mt-6 w-full text-center p-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md">
      {buttonText}
    </button>
  </div>
);

// --- Main Help & Support Page ---
export default function HelpAndSupportPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Help & Support</h1>
        <p className="mt-1.5 text-slate-500">
          Find the resources you need to get the most out of The Catalyst.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search documentation and articles..."
          className="w-full max-w-2xl rounded-lg border border-slate-300 bg-white py-3 pl-12 pr-4 text-md focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
        />
      </div>

      {/* Support Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SupportCard
          icon={BookOpen}
          title="Documentation"
          description="Explore our comprehensive guides, API references, and tutorials to master the platform."
          buttonText="Browse Docs"
        />
        <SupportCard
          icon={MessageSquare}
          title="Community Forum"
          description="Ask questions, share your knowledge, and connect with other Catalyst power users."
          buttonText="Visit Forum"
        />
        <SupportCard
          icon={Mail}
          title="Contact Support"
          description="Can't find what you're looking for? Get in touch with our expert engineering team."
          buttonText="Open a Ticket"
        />
      </div>
    </div>
  );
}
