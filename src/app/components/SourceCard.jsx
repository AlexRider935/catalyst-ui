import { Server, Cloud, Database } from "lucide-react";
import Link from "next/link";

// This map translates the 'type' string from the data into the correct icon component.
// It ensures consistency and makes it easy to add new source types in the future.
const iconMap = {
  "Syslog / Network": Server,
  "Cloud API": Cloud,
  Database: Database,
};

/**
 * A card representing a single, connected data source.
 * Clicking this card navigates to the detailed view for that source.
 * @param {object} props - The component props.
 * @param {number|string} props.id - The unique identifier for the source, used for navigation.
 * @param {string} props.name - The display name of the data source.
 * @param {string} props.type - The type of the source (e.g., 'Database', 'Cloud API').
 * @param {string} props.status - The current status ('Online' or 'Offline').
 * @param {number} props.eventCount - The number of events ingested in the last 24 hours.
 */
export default function SourceCard({ id, name, type, status, eventCount }) {
  // Select the appropriate icon based on the source type, with a default fallback.
  const Icon = iconMap[type] || Server;
  const isOnline = status === "Online";

  return (
    // The entire card is a link to its specific detail page (e.g., /ingestion/1)
    <Link href={`/ingestion/${id}`} className="block h-full">
      <div className="group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
        {/* Header Section: Icon, Name, and Status Badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-slate-100 p-3 text-slate-600">
              <Icon size={24} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{name}</p>
              <p className="text-sm text-slate-500">{type}</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
              isOnline
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
            <div
              className={`h-2 w-2 rounded-full ${
                isOnline ? "bg-green-500" : "bg-red-500"
              }`}></div>
            {status}
          </div>
        </div>

        {/* Stats Section: Displays key metrics about the source */}
        <div className="mt-6 flex-grow border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">Events (Last 24h)</p>
          <p className="text-2xl font-semibold text-slate-900">
            {eventCount.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
