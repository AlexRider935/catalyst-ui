import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

// Mock data - In a real app, this would be an API call based on the ID
const mockSources = [
  {
    id: 1,
    name: "Production PostgreSQL",
    type: "Database",
    status: "Online",
    eventCount: 1283492,
    host: "db.prod.internal",
    port: 5432,
  },
  {
    id: 2,
    name: "AWS CloudTrail",
    type: "Cloud API",
    status: "Online",
    eventCount: 8492104,
    region: "us-east-1",
    arn: "arn:aws:iam::123...:role/TheCatalystRole",
  },
  {
    id: 3,
    name: "Primary Firewall (Palo Alto)",
    type: "Syslog / Network",
    status: "Offline",
    eventCount: 0,
    host: "10.0.0.1",
    port: 514,
  },
];

const mockLogs = [
  {
    level: "INFO",
    timestamp: "08:25:10",
    message: "User `admin` logged in from 192.168.1.100",
  },
  {
    level: "INFO",
    timestamp: "08:25:08",
    message: "Connection established to db.prod.internal",
  },
  {
    level: "WARN",
    timestamp: "08:25:05",
    message: "High CPU usage detected: 92%",
  },
  {
    level: "INFO",
    timestamp: "08:25:02",
    message: "Query successful: SELECT * FROM users LIMIT 1",
  },
  {
    level: "ERROR",
    timestamp: "08:24:59",
    message: "Failed to connect to replica server: Connection timed out",
  },
];

export default function SourceDetailPage({ params }) {
  // Find the specific source data based on the URL's id parameter
  const source = mockSources.find((s) => s.id.toString() === params.id);

  if (!source) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Source Not Found</h1>
      </div>
    );
  }

  const isOnline = source.status === "Online";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/ingestion"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{source.name}</h1>
            <div
              className={`mt-1 flex items-center gap-2 text-sm font-medium ${
                isOnline ? "text-green-600" : "text-red-600"
              }`}>
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-red-500"
                }`}></div>
              {source.status}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md">
            <Edit size={18} />
          </button>
          <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Live Log Feed */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">Live Event Stream</h2>
          <p className="text-sm text-slate-500">
            A real-time sample of incoming data.
          </p>
        </div>
        <div className="p-4 font-mono text-sm bg-slate-900 text-white rounded-b-xl overflow-x-auto">
          {mockLogs.map((log, index) => (
            <div key={index} className="flex">
              <span className="text-slate-500 mr-4">{log.timestamp}</span>
              <span
                className={`${
                  log.level === "ERROR"
                    ? "text-red-400"
                    : log.level === "WARN"
                    ? "text-amber-400"
                    : "text-green-400"
                } font-bold w-14`}>
                {log.level}
              </span>
              <p className="flex-1 text-slate-300 whitespace-pre-wrap">
                {log.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
