"use client";

import { useState } from "react";
import { X, Server, Cloud, Database, FileText, ArrowLeft } from "lucide-react";

const sourceTypes = {
  "Cloud API": {
    description: "Connect to services like AWS, Azure.",
    icon: Cloud,
    subItems: [
      { name: "Amazon Web Services", icon: "aws.svg" },
      { name: "Microsoft Azure", icon: "azure.svg" },
      { name: "Google Cloud", icon: "gcp.svg" },
    ],
  },
  "Syslog / Network": {
    description: "Listen for logs from network devices.",
    icon: Server,
    subItems: [], // This would lead to a form, not another selection
  },
  Database: {
    description: "Pull logs directly from a database.",
    icon: Database,
    subItems: [],
  },
  "File / Agent": {
    description: "Monitor log files on a specific host.",
    icon: FileText,
    subItems: [],
  },
};

export default function AddSourceModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);

  const handleTypeSelect = (typeName) => {
    setSelectedType(typeName);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedType(null);
  };

  const handleClose = () => {
    handleBack(); // Reset state on close
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  // A helper component for the list items
  const ListItem = ({ name, description, icon: Icon, onClick }) => (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-lg border border-slate-200 p-4 text-left hover:border-blue-500 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50">
      <div className="rounded-md bg-slate-100 p-3 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600">
        <Icon size={24} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{name}</p>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
    </button>
  );

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onMouseDown={handleClose}>
      {/* Modal Panel */}
      <div
        className="relative w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="p-1 text-slate-500 hover:text-slate-900">
                <ArrowLeft size={22} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {step === 1
                  ? "Add a New Data Source"
                  : `Configure ${selectedType}`}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {step === 1
                  ? "Select the type of source you wish to connect."
                  : "Choose a specific provider or method."}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-800">
            <X size={24} />
          </button>
        </div>

        {/* Conditional Content */}
        <div className="space-y-3">
          {step === 1 &&
            Object.entries(sourceTypes).map(([name, { description, icon }]) => (
              <ListItem
                key={name}
                name={name}
                description={description}
                icon={icon}
                onClick={() => handleTypeSelect(name)}
              />
            ))}

          {step === 2 &&
            selectedType &&
            // For now, we only have sub-items for 'Cloud API'. Others would show a form.
            (sourceTypes[selectedType].subItems.length > 0 ? (
              sourceTypes[selectedType].subItems.map((item) => (
                // This would need a real icon component, using a placeholder for now
                <div
                  key={item.name}
                  className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
                  {/* Placeholder for cloud provider logos */}
                  <div className="w-8 h-8 bg-slate-200 rounded-md"></div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-8">
                Configuration form for {selectedType} would appear here.
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
