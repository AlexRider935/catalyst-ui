"use client";

import { useState, useEffect, Fragment, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Info, CheckCircle, X } from "lucide-react";
import { Popover, Transition } from "@headlessui/react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

// --- Reusable Components ---

const FormCard = ({ title, description, children }) => (
  <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
    <div className="p-6 border-b border-slate-200/80">
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const InfoPopover = ({ content }) => (
  <Popover className="relative inline-flex">
    <Popover.Button className="ml-1.5 text-slate-400 hover:text-slate-600 outline-none">
      <Info size={14} />
    </Popover.Button>
    <Transition
      as={Fragment}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-1">
      <Popover.Panel className="absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 transform px-4 sm:px-0">
        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="relative bg-white p-3">
            <p className="text-sm text-slate-600">{content}</p>
          </div>
        </div>
      </Popover.Panel>
    </Transition>
  </Popover>
);

// --- Helper Function to parse regex ---
function parseFieldsFromRegex(regexString) {
  if (!regexString) return [];
  const namedCaptureGroupRegex = /\(\?<([a-zA-Z0-9_]+)>/g;
  const fields = new Set(); // Use a Set to handle duplicates automatically
  let match;
  while ((match = namedCaptureGroupRegex.exec(regexString)) !== null) {
    fields.add(match[1]);
  }
  return Array.from(fields);
}

// --- Main New Rule Page Component ---

export default function NewRulePage() {
  const router = useRouter();
  const [ruleGroups, setRuleGroups] = useState([]);
  const [services, setServices] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);
  const [isFetchingFields, setIsFetchingFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    groupId: "",
    detectionLogic: "",
    severity: "Medium",
    source: "", // This will now be set by the service dropdown
    lastModifiedBy: "Director",
    mitreTechnique: "",
    complianceReference: "",
  });

  const detectionLogicRef = useRef(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch services from the API
        const servicesRes = await fetch("/api/services");
        if (!servicesRes.ok) throw new Error("Failed to fetch services");
        const servicesData = await servicesRes.json();
        setServices(servicesData);

        // Mock fetching for rule groups
        const mockGroups = [
          { id: "d8f8b8e8-4f4c-4f4c-8f8b-8e8d8f8b8e8d", name: "General" },
          { id: "a1b2c3d4-e5f6-a1b2-c3d4-e5f6a1b2c3d4", name: "Compliance" },
          { id: "f0e9d8c7-b6a5-f0e9-d8c7-b6a5f0e9d8c7", name: "Threat Intel" },
        ];
        setRuleGroups(mockGroups);
        if (mockGroups.length > 0) {
          setFormData((prev) => ({ ...prev, groupId: mockGroups[0].id }));
        }
      } catch (err) {
        console.error(err);
        showNotification("Could not load initial data.", "error");
      }
    };
    fetchInitialData();
  }, []);

  // --- HANDLERS ---
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = async (e) => {
    const serviceId = e.target.value;
    const selectedService = services.find((s) => s.id === serviceId);

    setFormData((prev) => ({
      ...prev,
      source: selectedService ? selectedService.name : "",
    }));
    setAvailableFields([]);

    if (selectedService) {
      setIsFetchingFields(true);
      try {
        const decodersRes = await fetch(`/api/services/${serviceId}/decoders`);
        if (!decodersRes.ok) throw new Error("Failed to fetch decoders");
        const decodersData = await decodersRes.json();

        const fields = new Set();
        decodersData.forEach((decoder) => {
          parseFieldsFromRegex(decoder.regex).forEach((field) =>
            fields.add(field)
          );
        });
        setAvailableFields(Array.from(fields).sort());
      } catch (err) {
        console.error(err);
        showNotification("Could not load fields for this service.", "error");
      } finally {
        setIsFetchingFields(false);
      }
    }
  };

  const handleInsertField = (fieldName) => {
    const textarea = detectionLogicRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = `${text.substring(0, start)} ${fieldName} ${text.substring(
      end
    )}`;

    setFormData((prev) => ({ ...prev, detectionLogic: newText }));

    // Focus and move cursor after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd =
        start + fieldName.length + 2;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      groupId: formData.groupId,
      detectionLogic: formData.detectionLogic,
      severity: formData.severity,
      source: formData.source,
      lastModifiedBy: formData.lastModifiedBy,
    };

    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create rule");
      }

      showNotification("Rule created successfully.", "success");
      setTimeout(() => router.push("/detection/rules"), 1000);
    } catch (err) {
      console.error(err);
      showNotification(err.message, "error");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-5 right-5 z-50">
            <div
              className={clsx(
                "flex items-center gap-3 rounded-lg p-4 text-sm font-semibold shadow-2xl",
                notification.type === "success"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              )}>
              {notification.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <Info size={20} />
              )}
              {notification.message}
              <button
                onClick={() =>
                  setNotification({ ...notification, show: false })
                }
                className="ml-4 opacity-70 hover:opacity-100">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/detection/rules"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            <ChevronLeft size={16} />
            Back to Rules Console
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-800">
          New Detection Rule
        </h1>
        <p className="mt-1 text-slate-500">
          Construct a new rule for the security intelligence engine.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <FormCard
            title="Rule Identity"
            description="Core metadata that defines and categorizes the rule.">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </FormCard>

          <FormCard
            title="Detection Logic"
            description="The query and severity that triggers an alert.">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="source"
                  className="block text-sm font-medium text-slate-700 mb-1">
                  Data Source
                </label>
                <select
                  id="source"
                  name="source"
                  onChange={handleServiceChange}
                  required
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                  <option value="">Select a service...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="detectionLogic"
                  className="block text-sm font-medium text-slate-700 mb-1">
                  Detection Query
                </label>
                <textarea
                  ref={detectionLogicRef}
                  id="detectionLogic"
                  name="detectionLogic"
                  rows={8}
                  value={formData.detectionLogic}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-slate-300 bg-slate-50 font-mono text-xs shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="level >= 10 AND src_ip='192.168.1.100'"
                />
              </div>

              {(isFetchingFields || availableFields.length > 0) && (
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2">
                    Available Fields
                  </p>
                  {isFetchingFields ? (
                    <div className="text-xs text-slate-400">
                      Loading fields...
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableFields.map((field) => (
                        <button
                          key={field}
                          type="button"
                          onClick={() => handleInsertField(field)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded-md text-xs font-mono text-blue-600 hover:bg-blue-50 hover:border-blue-400">
                          {field}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="severity"
                  className="block text-sm font-medium text-slate-700 mb-1">
                  Severity
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  required
                  className="block w-full max-w-xs rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>
          </FormCard>

          <FormCard
            title="Context & Framework Alignment"
            description="Optional fields to map this rule to industry standards.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="groupId"
                  className="block text-sm font-medium text-slate-700 mb-1">
                  Rule Group
                </label>
                <select
                  id="groupId"
                  name="groupId"
                  value={formData.groupId}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                  {ruleGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="mitreTechnique"
                  className="block text-sm font-medium text-slate-700 mb-1">
                  MITRE ATT&CK® Technique
                  <InfoPopover content="Map this rule to a specific adversary technique from the ATT&CK framework." />
                </label>
                <input
                  type="text"
                  id="mitreTechnique"
                  name="mitreTechnique"
                  value={formData.mitreTechnique}
                  onChange={handleInputChange}
                  placeholder="e.g., T1059.001"
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="complianceReference"
                  className="block text-sm font-medium text-slate-700 mb-1">
                  Compliance Reference
                  <InfoPopover content="Link this rule to a compliance control, e.g., SOC 2 CC6.1, PCI DSS 10.2.4" />
                </label>
                <input
                  type="text"
                  id="complianceReference"
                  name="complianceReference"
                  value={formData.complianceReference}
                  onChange={handleInputChange}
                  placeholder="e.g., SOC 2 CC6.1, PCI DSS 10.2.4"
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </FormCard>

          <div className="flex justify-end gap-3">
            <Link href="/detection/rules">
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white py-2 px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50">
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                "inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-slate-900 py-2 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800",
                "focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating Rule..." : "Create Rule"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
