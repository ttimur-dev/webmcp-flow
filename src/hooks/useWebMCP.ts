import { useState, useEffect, useRef } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { NodeData, NodeType } from "../types";
import { autoLayout } from "../utils/layout";
import { completeToolEvent } from "../utils/dispatchAndWait";
import { GRAPH_EVENTS, graphTools } from "../tools/graphTools";
import { setGraphState } from "../stores/graphState";

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;
type LogFn = (msg: string, type?: "ok" | "err" | "info") => void;

interface GraphEventDetail extends Record<string, unknown> {
  requestId: string;
}

export function useWebMCP(setNodes: Setter<Node<NodeData>[]>, setEdges: Setter<Edge[]>, log: LogFn) {
  const [completedRequestId, setCompletedRequestId] = useState<string | null>(null);
  const nodesRef = useRef<Node<NodeData>[]>([]);
  const edgesRef = useRef<Edge[]>([]);

  useEffect(() => {
    if (completedRequestId) {
      completeToolEvent(completedRequestId);
      setCompletedRequestId(null);
    }
  }, [completedRequestId]);

  const syncNodes = (updater: (prev: Node<NodeData>[]) => Node<NodeData>[]) => {
    setNodes((prev) => {
      const next = updater(prev);
      nodesRef.current = next;
      return next;
    });
  };

  const syncEdges = (updater: (prev: Edge[]) => Edge[]) => {
    setEdges((prev) => {
      const next = updater(prev);
      edgesRef.current = next;
      return next;
    });
  };

  useEffect(() => {
    const pushState = () => {
      setGraphState({
        nodes: nodesRef.current.map((n) => ({ id: n.id, label: n.data.label, nodeType: n.data.nodeType })),
        edges: edgesRef.current.map((e) => ({
          source: e.source,
          target: e.target,
          label: e.label as string | undefined,
        })),
      });
    };

    // Event handlers
    const onAddNode = (e: CustomEvent<GraphEventDetail>) => {
      const { id, label, nodeType, requestId } = e.detail;
      syncNodes((prev) => [
        ...prev,
        {
          id: id as string,
          type: "custom",
          position: { x: Math.random() * 400, y: Math.random() * 300 },
          data: { label: label as string, nodeType: nodeType as NodeType },
        },
      ]);
      pushState();
      log(`add_node → "${label}" (${nodeType}) id="${id}"`, "ok");
      setCompletedRequestId(requestId);
    };

    const onAddEdge = (e: CustomEvent<GraphEventDetail>) => {
      const { source, target, label, requestId } = e.detail;
      syncEdges((prev) => [
        ...prev,
        {
          id: `${source}->${target}`,
          source: source as string,
          target: target as string,
          label: label as string | undefined,
          animated: true,
          style: { stroke: "#475569" },
          labelStyle: { fill: "#94a3b8", fontSize: 11 },
          labelBgStyle: { fill: "#1e2535" },
        },
      ]);
      pushState();
      log(`add_edge → ${source} → ${target}`, "ok");
      setCompletedRequestId(requestId);
    };

    const onRemoveNode = (e: CustomEvent<GraphEventDetail>) => {
      const { id, requestId } = e.detail;
      syncNodes((prev) => prev.filter((n) => n.id !== id));
      syncEdges((prev) => prev.filter((edge) => edge.source !== id && edge.target !== id));
      pushState();
      log(`remove_node → "${id}"`, "ok");
      setCompletedRequestId(requestId);
    };

    const onUpdateNode = (e: CustomEvent<GraphEventDetail>) => {
      const { id, label, nodeType, requestId } = e.detail;
      syncNodes((prev) =>
        prev.map((n) =>
          n.id !== id
            ? n
            : {
                ...n,
                data: {
                  ...n.data,
                  ...(label !== undefined && { label: label as string }),
                  ...(nodeType !== undefined && { nodeType: nodeType as NodeType }),
                },
              },
        ),
      );
      pushState();
      log(`update_node → "${id}"`, "ok");
      setCompletedRequestId(requestId);
    };

    const onClear = (e: CustomEvent<GraphEventDetail>) => {
      syncNodes(() => []);
      syncEdges(() => []);
      pushState();
      log("clear_graph → canvas cleared", "ok");
      setCompletedRequestId(e.detail.requestId);
    };

    const onAutoLayout = (e: CustomEvent<GraphEventDetail>) => {
      syncNodes((prev) => autoLayout(prev, edgesRef.current));
      pushState();
      log("auto_layout → nodes repositioned", "ok");
      setCompletedRequestId(e.detail.requestId);
    };

    // Register event listeners
    window.addEventListener(GRAPH_EVENTS.ADD_NODE, onAddNode as EventListener);
    window.addEventListener(GRAPH_EVENTS.ADD_EDGE, onAddEdge as EventListener);
    window.addEventListener(GRAPH_EVENTS.REMOVE_NODE, onRemoveNode as EventListener);
    window.addEventListener(GRAPH_EVENTS.UPDATE_NODE, onUpdateNode as EventListener);
    window.addEventListener(GRAPH_EVENTS.CLEAR, onClear as EventListener);
    window.addEventListener(GRAPH_EVENTS.AUTO_LAYOUT, onAutoLayout as EventListener);

    // Register WebMCP tools
    const ctx = navigator.modelContext;
    if (ctx) {
      graphTools.forEach((tool) => ctx.registerTool(tool));
      log("WebMCP tools registered ✓", "ok");
    }

    return () => {
      window.removeEventListener(GRAPH_EVENTS.ADD_NODE, onAddNode as EventListener);
      window.removeEventListener(GRAPH_EVENTS.ADD_EDGE, onAddEdge as EventListener);
      window.removeEventListener(GRAPH_EVENTS.REMOVE_NODE, onRemoveNode as EventListener);
      window.removeEventListener(GRAPH_EVENTS.UPDATE_NODE, onUpdateNode as EventListener);
      window.removeEventListener(GRAPH_EVENTS.CLEAR, onClear as EventListener);
      window.removeEventListener(GRAPH_EVENTS.AUTO_LAYOUT, onAutoLayout as EventListener);

      if (ctx) graphTools.forEach((tool) => ctx.unregisterTool(tool.name));
    };
  }, []);
}
