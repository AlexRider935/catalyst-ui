"use client";

import { useState, useRef, useCallback, Fragment, useMemo } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Handle,
  Position,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { Dialog, Transition } from "@headlessui/react";
import * as Icons from "lucide-react";
import clsx from "clsx";

// --- STYLES & CONFIG ---
const nodeColor = (node, hasError) => {
  if (hasError) return "border-red-500 ring-4 ring-red-200";
  switch (node.data.type) {
    case "trigger":
      return "border-blue-500";
    case "action_destructive":
      return "border-red-500";
    case "action":
      return "border-slate-300";
    case "logic":
      return "border-purple-500";
    case "safeguard":
      return "border-amber-500";
    default:
      return "border-slate-300";
  }
};
const minimapStyle = { backgroundColor: "#f1f5f9" };

// --- NODE COMPONENTS ---
const CustomNode = ({ data, id }) => {
  const Icon = data.iconName ? Icons[data.iconName] : null;
  return (
    <div
      className={clsx(
        "bg-white p-4 rounded-lg border-2 shadow-sm w-64",
        nodeColor({ data }, data.hasError)
      )}>
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-slate-400 !w-3 !h-3"
      />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
          {Icon && (
            <Icon
              size={18}
              className={clsx(
                data.type === "action_destructive"
                  ? "text-red-600"
                  : "text-slate-600"
              )}
            />
          )}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{data.label}</p>
          <p className="text-xs text-slate-500">
            {data.config?.summary || "Click to configure"}
          </p>
        </div>
        {data.type === "action_destructive" && (
          <Icons.AlertTriangle
            size={16}
            className="text-red-500 flex-shrink-0"
            title="High-impact action"
          />
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-slate-400 !w-3 !h-3"
      />
    </div>
  );
};

const ConditionalNode = ({ data }) => {
  const Icon = data.iconName ? Icons[data.iconName] : null;
  return (
    <div
      className={clsx(
        "bg-white p-4 rounded-lg border-2 shadow-sm w-64",
        nodeColor({ data }, data.hasError)
      )}>
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-slate-400 !w-3 !h-3"
      />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
          {Icon && <Icon size={18} className="text-slate-600" />}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{data.label}</p>
          <p className="text-xs text-slate-500">
            {data.config?.summary || "If/then/else logic"}
          </p>
        </div>
      </div>
      {/* Note: In a real app, you'd add labels like "True" / "False" next to these handles */}
      <Handle
        type="source"
        position={Position.Top}
        id="true"
        style={{ top: -5 }}
        className="!bg-green-500 !w-3 !h-3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ bottom: -5 }}
        className="!bg-red-500 !w-3 !h-3"
      />
    </div>
  );
};

// --- LIBRARY NODE ---
const LibraryNode = ({ onDragStart, ...props }) => {
  const Icon = props.iconName ? Icons[props.iconName] : null;
  return (
    <div
      className="relative bg-white p-4 rounded-lg border-2 border-slate-200 shadow-sm w-full cursor-grab"
      onDragStart={(event) => onDragStart(event, props)}
      draggable>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
          {Icon && <Icon size={18} className="text-slate-600" />}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{props.label}</p>
          <p className="text-xs text-slate-500">{props.description}</p>
        </div>
      </div>
    </div>
  );
};

// --- CONFIGURATION DATA ---
const nodeTypes = { custom: CustomNode, conditional: ConditionalNode };
const nodeLibrary = {
  Triggers: [
    {
      nodeType: "custom",
      type: "trigger",
      iconName: "ShieldAlert",
      label: "Event Trigger",
      description: "On security event",
    },
  ],
  Logic: [
    {
      nodeType: "conditional",
      type: "logic",
      iconName: "GitCommit",
      label: "Conditional Split",
      description: "If/then/else logic",
    },
  ],
  Actions: [
    {
      nodeType: "custom",
      type: "action",
      iconName: "Mail",
      label: "Send Email",
      description: "Notify via email",
    },
    {
      nodeType: "custom",
      type: "action",
      iconName: "MessageSquare",
      label: "Send Slack Message",
      description: "Notify a channel",
    },
  ],
  Safeguards: [
    {
      nodeType: "custom",
      type: "safeguard",
      iconName: "UserCheck",
      label: "Manual Approval",
      description: "Pause and require human approval",
    },
  ],
  Destructive: [
    {
      nodeType: "custom",
      type: "action_destructive",
      iconName: "Server",
      label: "Isolate Endpoint",
      description: "Block network access",
    },
    {
      nodeType: "custom",
      type: "action_destructive",
      iconName: "User",
      label: "Disable User",
      description: "Suspend user account",
    },
  ],
};
// REMOVED: Impure module-level counter `let id = 0` and `getId()`

// --- CONFIGURATION PANEL ---
const ConfigurationPanel = ({ node, isOpen, onClose, onUpdate }) => {
  // ... (rest of ConfigurationPanel is unchanged) ...
  if (!node) return null;
  const handleChange = (key, value) => {
    const newConfig = { ...node.data.config, [key]: value };
    if (node.data.label === "Send Email")
      newConfig.summary = `To: ${newConfig.recipient || "?"}`;
    if (node.data.label === "Manual Approval")
      newConfig.summary = `Approvers: ${newConfig.approvers || "?"}`;
    onUpdate(node.id, newConfig);
  };
  const renderFields = () => {
    /* ... unchanged ... */
    switch (node.data.label) {
      case "Send Email":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Recipient Email
              </label>
              <input
                type="email"
                value={node.data.config?.recipient || ""}
                onChange={(e) => handleChange("recipient", e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Subject
              </label>
              <input
                type="text"
                value={node.data.config?.subject || ""}
                onChange={(e) => handleChange("subject", e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        );
      case "Manual Approval":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Approver Group (Email)
              </label>
              <input
                type="text"
                value={node.data.config?.approvers || ""}
                onChange={(e) => handleChange("approvers", e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Instructions for Approver
              </label>
              <textarea
                value={node.data.config?.instructions || ""}
                onChange={(e) => handleChange("instructions", e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        );
      case "Isolate Endpoint":
      case "Disable User":
        return (
          <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50 border border-amber-200">
            <Icons.AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800">
                High-Impact Action
              </h4>
              <p className="text-sm text-amber-700">
                This is a destructive action. For compliance and safety, it is
                strongly recommended to place a **Manual Approval** step before
                this in the workflow.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <p className="text-sm text-slate-500">
            No configuration is available for this node.
          </p>
        );
    }
  };
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
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
        <div className="fixed inset-0 flex justify-end">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full">
            <Dialog.Panel className="w-full max-w-md bg-white h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <Dialog.Title className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Icons.Settings2 size={20} /> Configure: {node.data.label}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-slate-100">
                  <Icons.X size={20} />
                </button>
              </div>
              <div className="p-6 flex-grow overflow-y-auto">
                {renderFields()}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- MAIN CANVAS EDITOR ---
export default function CanvasEditor({ onSave }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // ##################################################################
  // ### FIX: Use a ref for the counter to survive hot-reloads ###
  // ##################################################################
  const nodeIdCounter = useRef(0);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setIsPanelOpen(true);
  }, []);
  const updateNodeConfig = useCallback(
    (nodeId, newConfig) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, config: newConfig } }
            : node
        )
      );
    },
    [setNodes]
  );
  const onDragStart = (event, nodeProps) => {
    event.dataTransfer.setData(
      "application/reactflow-data",
      JSON.stringify(nodeProps)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const dataString = event.dataTransfer.getData(
        "application/reactflow-data"
      );
      if (!dataString) return;
      const nodeProps = JSON.parse(dataString);
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // ### FIX: Generate ID using the ref counter ###
      const id = `dndnode_${nodeIdCounter.current++}`;

      const newNode = {
        id,
        type: nodeProps.nodeType,
        position,
        data: { ...nodeProps, config: {} },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const validationIssues = useMemo(() => {
    // ... (rest of validation is unchanged) ...
    const issues = [];
    const connectedNodeIds = new Set(
      edges.flatMap((e) => [e.source, e.target])
    );
    const triggerNode = nodes.find((n) => n.data.type === "trigger");
    nodes.forEach((node) => {
      let hasError = false;
      if (node.id !== triggerNode?.id && !connectedNodeIds.has(node.id)) {
        issues.push({
          id: node.id,
          level: "error",
          message: `Node "${node.data.label}" is not connected.`,
        });
        hasError = true;
      }
      if (node.data.label === "Send Email" && !node.data.config?.recipient) {
        issues.push({
          id: node.id,
          level: "error",
          message: `"${node.data.label}" is missing a recipient.`,
        });
        hasError = true;
      }
      if (node.data.type === "action_destructive") {
        const sourceEdges = edges.filter((e) => e.target === node.id);
        const hasApproval = sourceEdges.some((e) => {
          const sourceNode = nodes.find((n) => n.id === e.source);
          return sourceNode?.data.type === "safeguard";
        });
        if (!hasApproval) {
          issues.push({
            id: node.id,
            level: "warning",
            message: `Destructive action "${node.data.label}" lacks a preceding Manual Approval step.`,
          });
        }
      }
      if (node.data.hasError !== hasError) {
        node.data.hasError = hasError;
      }
    });
    return issues;
  }, [nodes, edges]);

  onSave.current = () => ({
    type: "canvas",
    nodes,
    edges,
    validation: validationIssues,
  });

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      <ReactFlowProvider>
        <aside className="w-72 bg-white border-r border-slate-200 p-4 overflow-y-auto space-y-4">
          {Object.entries(nodeLibrary).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <LibraryNode key={i} onDragStart={onDragStart} {...item} />
                ))}
              </div>
            </div>
          ))}
        </aside>
        <main ref={reactFlowWrapper} className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={useCallback(
              (params) => setEdges((eds) => addEdge(params, eds)),
              []
            )}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            fitView>
            <Controls />
            <MiniMap
              style={minimapStyle}
              nodeColor={(n) => nodeColor(n, n.data.hasError)}
              pannable
            />
            <Background color="#e5e7eb" gap={16} />
          </ReactFlow>
          <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-md text-sm w-80">
            <div className="font-bold text-slate-700 flex items-center gap-2">
              {validationIssues.length === 0 ? (
                <Icons.CheckCircle size={16} className="text-green-500" />
              ) : (
                <Icons.AlertTriangle size={16} className="text-amber-500" />
              )}
              Playbook Status
            </div>
            {validationIssues.length > 0 ? (
              <ul className="mt-1 list-none text-slate-600 space-y-1">
                {validationIssues.map((issue) => (
                  <li
                    key={issue.id}
                    className={clsx(
                      "flex items-start gap-2",
                      issue.level === "error"
                        ? "text-red-600"
                        : "text-amber-600"
                    )}>
                    <Icons.AlertCircle
                      size={14}
                      className="flex-shrink-0 mt-0.5"
                    />
                    <span>{issue.message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-600 mt-1">All checks passed.</p>
            )}
          </div>
        </main>
        <ConfigurationPanel
          node={selectedNode}
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onUpdate={updateNodeConfig}
        />
      </ReactFlowProvider>
    </div>
  );
}
