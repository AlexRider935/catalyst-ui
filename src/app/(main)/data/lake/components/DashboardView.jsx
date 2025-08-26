"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Loader2,
  LayoutDashboard,
  Plus,
  BarChart,
  Table,
  AlertTriangle,
  MoreVertical,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Responsive, WidthProvider } from "react-grid-layout";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

// NOTE: This component requires two new libraries. In a real project, you would run:
// npm install react-grid-layout recharts
// For this environment, we assume they are available.

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- Reusable Slide-Over Panel Component ---
const SlideOverPanel = ({ isOpen, onClose, title, children }) => (
  <Transition.Root show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      {/* ... Panel implementation ... */}
    </Dialog>
  </Transition.Root>
);

const CreateDashboardPanel = ({ onClose, onSave }) => {
  /* ... Unchanged ... */
};
const AddWidgetPanel = ({ onClose, onSave, savedQueries }) => {
  /* ... Unchanged ... */
};

// --- WIDGET COMPONENTS ---
const Widget = ({ widget }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // ✅ UPDATED: This now calls the live API endpoint to execute the saved query.
        const response = await fetch(
          `/api/datalake/saved-queries/${widget.saved_query_id}/execute`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // You can pass a timeRange if your widgets support it
            body: JSON.stringify({ timeRange: "24h" }),
          }
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch widget data");
        }

        // This is a placeholder for data transformation.
        // A real implementation would aggregate data here based on the visualization type.
        // For example, for a bar chart, you might count occurrences.
        // For now, we'll just use the raw results.
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [widget.saved_query_id]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-xs text-red-500 p-2 text-center">
          <AlertTriangle className="h-5 w-5 mb-1" />{" "}
          <span className="font-semibold">Error</span> {error}
        </div>
      );
    }
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-sm text-slate-500">
          No data for this query.
        </div>
      );
    }

    switch (widget.visualization_type) {
      case "bar_chart":
        // For this example, we'll create a simple aggregation on the fly
        const aggregatedData = data.reduce((acc, row) => {
          const key = row.hostname;
          const existing = acc.find((item) => item.name === key);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ name: key, count: 1 });
          }
          return acc;
        }, []);
        return <BarChartWidget data={aggregatedData} />;
      case "table":
        return <TableWidget data={data} />;
      default:
        return <div className="text-red-500">Unknown visualization type.</div>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 h-full w-full flex flex-col">
      <header className="flex-shrink-0 p-4 border-b border-slate-200 flex items-center justify-between drag-handle cursor-move">
        <div>
          <h3 className="font-semibold text-slate-800 truncate">
            {widget.saved_query_name}
          </h3>
          <p className="text-xs text-slate-500">
            {widget.visualization_type.replace("_", " ")}
          </p>
        </div>
        <button className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <MoreVertical size={16} />
        </button>
      </header>
      <main className="flex-1 p-2">{renderContent()}</main>
    </div>
  );
};

const BarChartWidget = ({ data }) => {
  const dataKey = Object.keys(data[0]).find(
    (k) => typeof data[0][k] === "number"
  );
  const nameKey = Object.keys(data[0]).find((k) => k !== dataKey);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          cursor={{ fill: "rgba(241, 245, 249, 0.5)" }}
          contentStyle={{
            fontSize: "12px",
            borderRadius: "0.5rem",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            border: "1px solid #e2e8f0",
          }}
        />
        <Bar dataKey={dataKey} fill="#2563eb" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

const TableWidget = ({ data }) => {
  const headers = ["received_at", "hostname", "data"];
  return (
    <div className="overflow-y-auto h-full">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-slate-100">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="p-2 text-left font-semibold text-slate-700 capitalize">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              <td className="p-2 whitespace-nowrap text-xs font-mono">
                {new Date(row.received_at).toLocaleTimeString()}
              </td>
              <td className="p-2 whitespace-nowrap text-xs font-mono">
                {row.hostname}
              </td>
              <td className="p-2 text-xs font-mono truncate">
                {JSON.stringify(row.data)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Main Dashboard View ---
export default function DashboardView() {
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layouts, setLayouts] = useState({});
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [isAddWidgetPanelOpen, setIsAddWidgetPanelOpen] = useState(false);
  const [savedQueries, setSavedQueries] = useState([]);

  const fetchDashboards = async (selectIdAfterFetch = null) => {
    /* ... Unchanged ... */
  };
  const fetchSavedQueries = async () => {
    /* ... Unchanged ... */
  };
  const fetchDashboardDetails = async (id) => {
    /* ... Unchanged ... */
  };
  const handleCreateDashboard = async (dashboardData) => {
    /* ... Unchanged ... */
  };
  const handleAddWidget = async (widgetData) => {
    /* ... Unchanged ... */
  };
  const onLayoutChange = (layout, allLayouts) => {
    /* ... Unchanged ... */
  };

  useEffect(() => {
    fetchDashboards();
    fetchSavedQueries();
  }, []);

  if (isLoading && dashboards.length === 0) {
    /* ... Unchanged ... */
  }
  if (dashboards.length === 0) {
    /* ... Unchanged ... */
  }

  return (
    <>
      <Toaster position="bottom-right" />
      <SlideOverPanel
        isOpen={isCreatePanelOpen}
        onClose={() => setIsCreatePanelOpen(false)}
        title="New Dashboard">
        <CreateDashboardPanel
          onClose={() => setIsCreatePanelOpen(false)}
          onSave={handleCreateDashboard}
        />
      </SlideOverPanel>
      <SlideOverPanel
        isOpen={isAddWidgetPanelOpen}
        onClose={() => setIsAddWidgetPanelOpen(false)}
        title="Add New Widget">
        <AddWidgetPanel
          onClose={() => setIsAddWidgetPanelOpen(false)}
          onSave={handleAddWidget}
          savedQueries={savedQueries}
        />
      </SlideOverPanel>

      <div className="h-full flex flex-col bg-slate-50">
        <header className="flex-shrink-0 p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <select
              className="rounded-lg border-slate-300 bg-white px-3 py-2 text-base font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              value={selectedDashboard?.id || ""}
              onChange={(e) => fetchDashboardDetails(e.target.value)}>
              {dashboards.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-slate-500 hidden md:block">
              {selectedDashboard?.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddWidgetPanelOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
              <Plus size={16} /> Add Widget
            </button>
            <button
              onClick={() => setIsCreatePanelOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              <Plus size={16} /> New Dashboard
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : selectedDashboard && selectedDashboard.widgets.length > 0 ? (
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              onLayoutChange={onLayoutChange}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={50}
              draggableHandle=".drag-handle">
              {selectedDashboard.widgets.map((widget) => (
                <div key={widget.id} className="widget-container">
                  <Widget widget={widget} />
                </div>
              ))}
            </ResponsiveGridLayout>
          ) : (
            <div className="text-center text-slate-500 pt-16">
              <h3 className="text-lg font-semibold">This Dashboard is Empty</h3>
              <p>Add a widget to start visualizing your data.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
