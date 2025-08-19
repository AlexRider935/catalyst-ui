"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import ServiceList from "./components/ServiceList";
import DecoderDetail from "./components/DecoderDetail";
import EditDecoderPanel from "./components/EditDecoderPanel";
import CreateServicePanel from "./components/CreateServicePanel";
import LiveTestBench from "./components/LiveTestBench";
import { List, TestTube } from "lucide-react";

export default function DecodersPage() {
  // State for Management tab
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editingDecoder, setEditingDecoder] = useState(null);
  const [isCreateServicePanelOpen, setIsCreateServicePanelOpen] =
    useState(false);

  // State for tabs
  const [activeTab, setActiveTab] = useState("management");

  // Data fetching and handlers for the Management tab
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setServices(data);

      if (selectedService) {
        const updatedSelectedService = data.find(
          (s) => s.id === selectedService.id
        );
        setSelectedService(
          updatedSelectedService || (data.length > 0 ? data[0] : null)
        );
      } else if (data.length > 0) {
        setSelectedService(data[0]);
      } else {
        setSelectedService(null);
      }
    } catch (error) {
      console.error("Failed to refresh services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (!selectedService || !selectedService.id) return;
    if (selectedService.decoders) return;
    const fetchDecodersForService = async () => {
      try {
        const response = await fetch(
          `/api/services/${selectedService.id}/decoders`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const decoderData = await response.json();
        setSelectedService((currentService) => ({
          ...currentService,
          decoders: decoderData,
        }));
      } catch (error) {
        console.error(
          `Failed to fetch decoders for service ${selectedService.id}:`,
          error
        );
      }
    };
    fetchDecodersForService();
  }, [selectedService]);

  const handleSelectService = (service) => setSelectedService(service);
  const handleCreateService = () => setIsCreateServicePanelOpen(true);
  const handleEditDecoder = (decoder) => {
    setEditingDecoder(decoder);
    setIsEditPanelOpen(true);
  };
  const handleCreateDecoder = () => {
    setEditingDecoder(null);
    setIsEditPanelOpen(true);
  };
  const handleDeleteDecoder = async (decoderId, decoderName) => {
    if (
      window.confirm(
        `Are you sure you want to delete the decoder "${decoderName}"?`
      )
    ) {
      try {
        const response = await fetch(`/api/decoders/${decoderId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete decoder");
        await refreshData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="h-full bg-slate-50 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100"></div>
      <div className="relative h-full flex flex-col">
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 z-10">
          <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Decoder Studio
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage decoders or test logs against the entire ruleset in the
                  live bench.
                </p>
              </div>
            </div>
            <nav className="flex space-x-2">
              <TabButton
                id="management"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                icon={<List size={16} />}
                label="Management"
              />
              <TabButton
                id="testbench"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                icon={<TestTube size={16} />}
                label="Live Test Bench"
              />
            </nav>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-hidden">
            {activeTab === "management" && (
              <main className="h-full">
                <div className="flex h-full">
                  <ServiceList
                    services={services}
                    selectedService={selectedService}
                    onSelect={handleSelectService}
                    isLoading={isLoading}
                    onCreateService={handleCreateService}
                  />
                  <DecoderDetail
                    service={selectedService}
                    onEditDecoder={handleEditDecoder}
                    onCreateDecoder={handleCreateDecoder}
                    onDeleteDecoder={handleDeleteDecoder}
                  />
                </div>
              </main>
            )}
            {activeTab === "testbench" && <LiveTestBench />}
          </motion.div>
        </AnimatePresence>

        <EditDecoderPanel
          isOpen={isEditPanelOpen}
          onClose={() => setIsEditPanelOpen(false)}
          decoder={editingDecoder}
          service={selectedService}
          onUpdate={refreshData}
        />
        <CreateServicePanel
          isOpen={isCreateServicePanelOpen}
          onClose={() => setIsCreateServicePanelOpen(false)}
          onUpdate={refreshData}
        />
      </div>
    </div>
  );
}

const TabButton = ({ id, activeTab, setActiveTab, icon, label }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={clsx(
      "relative flex items-center gap-2 whitespace-nowrap py-3 px-4 text-sm font-medium transition-colors focus:outline-none",
      activeTab === id ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
    )}>
    {icon} {label}
    {activeTab === id && (
      <motion.div
        layoutId="active-tab-indicator"
        className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600"
      />
    )}
  </button>
);
