"use client";

import { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { List, TestTube, Plus, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import ServiceList from "./components/ServiceList";
import DecoderDetail from "./components/DecoderDetail";
import EditDecoderPanel from "./components/EditDecoderPanel";
import CreateServicePanel from "./components/CreateServicePanel";
import LiveTestBench from "./components/LiveTestBench";

// --- Delete Confirmation Modals ---
const DeleteConfirmationModal = ({
  title,
  name,
  isOpen,
  onClose,
  onDelete,
}) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0">
        <div className="fixed inset-0 bg-black/30" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle
                    className="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-base font-semibold leading-6 text-slate-900">
                    {title}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-slate-500">
                      Are you sure you want to delete{" "}
                      <span className="font-bold text-slate-700">{name}</span>?
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                  onClick={onDelete}>
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto"
                  onClick={onClose}>
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

// --- Main Decoders Page Component ---
export default function DecodersPage() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editingDecoder, setEditingDecoder] = useState(null);
  const [isCreateServicePanelOpen, setIsCreateServicePanelOpen] =
    useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [decoderToDelete, setDecoderToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("management");

  // --- BUG FIX: Re-architected data fetching ---
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch the initial list of services
      const servicesResponse = await fetch("/api/services");
      if (!servicesResponse.ok) throw new Error("Network response was not ok");
      const servicesData = await servicesResponse.json();

      // 2. Create promises to fetch decoders for each service
      const decoderPromises = servicesData.map((service) =>
        fetch(`/api/services/${service.id}/decoders`).then((res) => {
          if (!res.ok) return []; // Return empty array on error for a specific service
          return res.json();
        })
      );

      // 3. Wait for all decoder fetches to complete
      const allDecoders = await Promise.all(decoderPromises);

      // 4. Combine the data, adding decoder arrays and counts to each service
      const servicesWithDetails = servicesData.map((service, index) => ({
        ...service,
        decoders: allDecoders[index],
        decoderCount: allDecoders[index].length,
      }));

      setServices(servicesWithDetails);

      // 5. Update the selected service logic
      if (selectedService) {
        const updatedSelectedService = servicesWithDetails.find(
          (s) => s.id === selectedService.id
        );
        setSelectedService(
          updatedSelectedService ||
            (servicesWithDetails.length > 0 ? servicesWithDetails[0] : null)
        );
      } else if (servicesWithDetails.length > 0) {
        setSelectedService(servicesWithDetails[0]);
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

  // This useEffect is no longer needed as refreshData now fetches everything.

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

  const handleDeleteDecoder = async () => {
    if (!decoderToDelete) return;
    try {
      const response = await fetch(`/api/decoders/${decoderToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete decoder");
      await refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setDecoderToDelete(null);
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      const response = await fetch(`/api/services/${serviceToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete service");
      await refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setServiceToDelete(null);
    }
  };

  return (
    <>
      <DeleteConfirmationModal
        title="Delete Service"
        name={serviceToDelete?.name}
        isOpen={!!serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        onDelete={handleDeleteService}
      />
      <DeleteConfirmationModal
        title="Delete Decoder"
        name={decoderToDelete?.name}
        isOpen={!!decoderToDelete}
        onClose={() => setDecoderToDelete(null)}
        onDelete={handleDeleteDecoder}
      />
      <div className="flex flex-col h-full space-y-8">
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Decoder Studio
            </h1>
            <p className="mt-1 text-slate-500">
              Manage and test the logic that parses raw logs into structured
              data.
            </p>
          </div>
          {activeTab === "management" && (
            <button
              type="button"
              onClick={handleCreateService}
              className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2.5 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
              <Plus size={18} /> New Service
            </button>
          )}
        </div>

        <div className="flex-shrink-0 border-b border-slate-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <TabButton
              id="management"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              label="Management"
            />
            <TabButton
              id="testbench"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              label="Live Test Bench"
            />
          </nav>
        </div>

        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full">
              {activeTab === "management" && (
                <div className="flex h-full rounded-xl shadow-sm border border-slate-200/80 bg-white overflow-hidden">
                  <ServiceList
                    services={services}
                    selectedService={selectedService}
                    onSelect={handleSelectService}
                    isLoading={isLoading}
                    onCreateService={handleCreateService}
                    onDeleteService={setServiceToDelete}
                  />
                  <DecoderDetail
                    service={selectedService}
                    onEditDecoder={handleEditDecoder}
                    onCreateDecoder={handleCreateDecoder}
                    onDeleteDecoder={setDecoderToDelete}
                    onUpdate={refreshData}
                  />
                </div>
              )}
              {activeTab === "testbench" && <LiveTestBench />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

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
    </>
  );
}

const TabButton = ({ id, activeTab, setActiveTab, label }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={clsx(
      "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none",
      activeTab === id
        ? "border-blue-500 text-blue-600"
        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
    )}>
    {label}
  </button>
);
