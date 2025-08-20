"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, Loader2, LayoutGrid, FileText } from "lucide-react";

// Importing all components from their respective files
import PlaybookDetailsCard from "../components/PlaybookDetailsCard";
import TriggerConditionCard from "../components/TriggerConditionCard";
import ActionsCard from "../components/ActionsCard";
import ReviewActivateCard from "../components/ReviewActivateCard";
import CanvasEditor from "../components/CanvasEditor"; // IMPORTED

// ---
// --- MAIN PAGE COMPONENT ---
// ---
export default function NewPlaybookPage() {
  const router = useRouter();
  const [editorMode, setEditorMode] = useState("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveCanvasHandler = useRef();

  const [playbook, setPlaybook] = useState({
    name: "",
    description: "",
    owner: "soc_team",
    tags: [],
    changeJustification: "",
    trigger: {
      type: "RULE_MATCH",
      config: {
        conditions: [{ field: "severity", operator: "is", value: "High" }],
        suppression: { enabled: true, window: 5, key: "hostname" },
      },
    },
    actions: [],
    isEnabled: true,
  });

  const handleDetailChange = (key, value) => {
    setPlaybook((prev) => ({ ...prev, [key]: value }));
  };

  const handleTriggerChange = (newTriggerObject) => {
    setPlaybook((prev) => ({ ...prev, trigger: newTriggerObject }));
  };

  const addAction = (newActionObject) => {
    setPlaybook((prev) => ({
      ...prev,
      actions: [...prev.actions, newActionObject],
    }));
  };

  const removeAction = (id) => {
    setPlaybook((prev) => ({
      ...prev,
      actions: prev.actions.filter((a) => a.id !== id),
    }));
  };

  const handleActionConfigChange = (id, key, value) => {
    setPlaybook((prev) => ({
      ...prev,
      actions: prev.actions.map((action) =>
        action.id === id
          ? { ...action, config: { ...action.config, [key]: value } }
          : action
      ),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let payload;
    if (editorMode === "form") {
      payload = { type: "form", ...playbook };
    } else {
      payload = saveCanvasHandler.current();
    }

    try {
      const response = await fetch("/api/playbooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      router.push("/response/playbooks");
    } catch (error) {
      console.error("Failed to save playbook:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 -m-6 md:-m-10">
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 bg-white z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/response/playbooks"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Create Playbook
            </h1>
            <p className="text-sm text-slate-500">
              {editorMode === "form"
                ? "Use the guided form for a linear workflow."
                : "Use the canvas for complex, branching logic."}
            </p>
          </div>
        </div>
        <div className="flex items-center p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setEditorMode("form")}
            className={clsx(
              "flex items-center gap-2 px-3 py-1 rounded-md text-sm font-semibold transition-colors",
              editorMode === "form"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}>
            <FileText size={16} /> Form
          </button>
          <button
            onClick={() => setEditorMode("canvas")}
            className={clsx(
              "flex items-center gap-2 px-3 py-1 rounded-md text-sm font-semibold transition-colors",
              editorMode === "canvas"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}>
            <LayoutGrid size={16} /> Canvas
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/response/playbooks")}
            className="rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 w-40 rounded-lg border border-transparent bg-slate-900 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? "Saving..." : "Save & Activate"}
          </button>
        </div>
      </header>

      <div className="flex-1">
        {editorMode === "form" ? (
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <PlaybookDetailsCard
                playbook={playbook}
                onDetailChange={handleDetailChange}
              />
              <TriggerConditionCard
                trigger={playbook.trigger}
                onTriggerChange={handleTriggerChange}
              />
              <ActionsCard
                actions={playbook.actions}
                addAction={addAction}
                removeAction={removeAction}
                handleActionConfigChange={handleActionConfigChange}
              />
              <ReviewActivateCard
                playbook={playbook}
                setPlaybook={setPlaybook}
              />
            </div>
          </main>
        ) : (
          <CanvasEditor onSave={saveCanvasHandler} />
        )}
      </div>
    </div>
  );
}
