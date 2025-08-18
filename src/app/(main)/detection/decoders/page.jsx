"use client";

import { useState, useEffect } from "react";
import ServiceList from "./components/ServiceList";
import DecoderDetail from "./components/DecoderDetail";
import EditDecoderPanel from "./components/EditDecoderPanel";
import CreateServicePanel from "./components/CreateServicePanel";
import TestResultsModal from "./components/TestResultModal";
import { PlayCircle } from "lucide-react";


export default function DecodersPage() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editingDecoder, setEditingDecoder] = useState(null);
  const [isCreateServicePanelOpen, setIsCreateServicePanelOpen] =
    useState(false);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

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
  const handleRunTests = async () => {
    setIsTestRunning(true);
    setTestResults(null);
    try {
      const response = await fetch("/api/decoders/run-integrity-test", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to run tests");
      const results = await response.json();
      setTestResults(results);
      setIsResultsModalOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTestRunning(false);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="mx-auto max-w-full px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold leading-6 text-slate-900">
              Decoder Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage and test all system decoders.
            </p>
          </div>
          <button
            onClick={handleRunTests}
            disabled={isTestRunning}
            className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50">
            <PlayCircle className="-ml-0.5 h-5 w-5" />
            {isTestRunning ? "Running Tests..." : "Run Integrity Test"}
          </button>
        </div>
      </header>
      <main className="h-[calc(100vh-8.5rem)] bg-slate-50">
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
      <TestResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        results={testResults}
      />
    </>
  );
}