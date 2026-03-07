import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react";
import type { Connection, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import CustomNode from "./components/CustomNode";
import { useWebMCP } from "./hooks/useWebMCP";
import type { NodeData } from "./types";
import { autoLayout } from "./utils/layout";
import { LEGEND_ITEMS } from "./constants/nodes";
import "./App.css";

const nodeTypes = { custom: CustomNode };

interface LogEntry {
  ts: string;
  msg: string;
  type: "ok" | "err" | "info" | "";
}

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [logs, setLogs] = useState<LogEntry[]>([{ ts: "init", msg: "Waiting for agent activity...", type: "" }]);
  const [webMCPAvailable] = useState(() => !!navigator.modelContext);
  const logRef = useRef<HTMLDivElement>(null);

  const log = useCallback((msg: string, type: LogEntry["type"] = "") => {
    const ts = new Date().toLocaleTimeString("en", { hour12: false });
    setLogs((prev) => [...prev, { ts, msg, type }]);
    setTimeout(() => logRef.current?.scrollTo(0, logRef.current.scrollHeight), 50);
  }, []);

  useWebMCP(setNodes, setEdges, log);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: "#475569" } }, eds)),
    [setEdges],
  );

  const handleAutoLayout = () => setNodes((prev) => autoLayout(prev, edges));
  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    log("Canvas cleared manually", "info");
  };

  return (
    <div className="app">
      <header className="header">
        <span className="header__title">WebMCP Flow</span>

        <div className={`status-badge status-badge--${webMCPAvailable ? "available" : "unavailable"}`}>
          <div className="status-badge__dot" />
          {webMCPAvailable
            ? "WebMCP active — 7 tools registered"
            : "WebMCP unavailable — enable chrome://flags/#enable-webmcp-testing"}
        </div>

        <div className="header__actions">
          <button className="btn btn--layout" onClick={handleAutoLayout}>
            Auto Layout
          </button>
          <button className="btn btn--clear" onClick={handleClear}>
            Clear
          </button>
        </div>
      </header>

      <div className="canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
        >
          <Background variant={BackgroundVariant.Dots} color="#222" gap={20} />
          <Controls />
        </ReactFlow>

        {nodes.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">◈</div>
            <div className="empty-state__text">
              Canvas is empty
              <br />
              <span className="empty-state__hint">
                Ask an agent: "Build a microservice graph: auth → api, api → db, api → cache, then apply auto layout"
              </span>
            </div>
          </div>
        )}

        <div className="legend">
          {LEGEND_ITEMS.map(({ type, icon }) => (
            <div key={type} className="legend__item">
              <span>{icon}</span>
              <span className="legend__label" data-type={type}>
                {type}
              </span>
            </div>
          ))}
        </div>

        <div className="agent-log" ref={logRef}>
          {logs.map((l, i) => (
            <div key={i} className="log-entry">
              <span className="log-entry__ts">[{l.ts}]</span>{" "}
              <span className={`log-entry__msg${l.type ? ` log-entry__msg--${l.type}` : ""}`}>{l.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
