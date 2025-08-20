"use client";

import { useState, useRef, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  GitBranch,
  ShieldAlert,
  Server,
  User,
  Mail,
  MessageSquare,
  Terminal,
} from "lucide-react";

// --- React Flow Node Components ---
const CustomNode = ({ data }) => (
  <div
    className={`bg-white p-4 rounded-lg border-2 ${data.color} shadow-sm w-64`}>
    <Handle
      type="target"
      position={Position.Left}
      className="!bg-slate-400 !w-3 !h-3"
    />
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
        <data.icon size={18} className="text-slate-600" />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{data.label}</p>
        <p className="text-xs text-slate-500">{data.description}</p>
      </div>
    </div>
    <Handle
      type="source"
      position={Position.Right}
      className="!bg-slate-400 !w-3 !h-3"
    />
  </div>
);

const LibraryNode = ({ nodeType, icon: Icon, title, description }) => {
  const onDragStart = (event, nType) => {
    const nodeData = {
      label: title,
      description,
      icon: Icon,
      color: "border-blue-500",
    };
    event.dataTransfer.setData("application/reactflow", nType);
    event.dataTransfer.setData(
      "application/reactflow-data",
      JSON.stringify(nodeData)
    );
    event.dataTransfer.effectAllowed = "move";
  };
  return (
    <div
      className="relative bg-white p-4 rounded-lg border-2 border-slate-200 shadow-sm w-full cursor-grab"
      onDragStart={(event) => onDragStart(event, nodeType)}
      draggable>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
          <Icon size={18} className="text-slate-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

// --- Configuration Data ---
const nodeTypes = { custom: CustomNode };
const nodeLibrary = {
  triggers: [
    { type: "custom", icon: ShieldAlert, title: "Event Trigger", description: "On security event" },
    { type: "custom", icon: GitBranch, title: "Rule Trigger", description: "On detection rule match" },
  ],
  actions: [
    { type: "custom", icon: Server, title: "Isolate Endpoint", description: "Block network access" },
    { type: "custom", icon: User, title: "Disable User", description: "Suspend user account" },
    { type: "custom", icon: Mail, title: "Send Email", description: "Notify via email" },
    { type: "custom", icon: MessageSquare, title: "Send Slack Message", description: "Notify a channel" },
    { type: "custom", icon: Terminal, title: "Run Command", description: "Execute a script" },
  ],
};
let id = 0;
const getId = () => `dndnode_${id++}`;


// --- Main Exported Component ---
export default function CanvasEditor({ onSave }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const onDragOver = useCallback((event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      const dataString = event.dataTransfer.getData("application/reactflow-data");

      if (typeof type === "undefined" || !type) return;
      
      const data = JSON.parse(dataString);
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = { id: getId(), type, position, data };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  onSave.current = () => {
    const payload = { type: 'canvas', nodes, edges };
    return payload;
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      <ReactFlowProvider>
        <aside className="w-72 bg-white border-r border-slate-200 p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Triggers
          </h2>
          <div className="space-y-2">
            {nodeLibrary.triggers.map((node, i) => <LibraryNode key={i} {...node} />)}
          </div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-4">
            Actions
          </h2>
          <div className="space-y-2">
            {nodeLibrary.actions.map((node, i) => <LibraryNode key={i} {...node} />)}
          </div>
        </aside>
        <main className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </main>
      </ReactFlowProvider>
    </div>
  );
};