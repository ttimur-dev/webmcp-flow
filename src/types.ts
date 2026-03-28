export type NodeType = "service" | "database" | "cache" | "queue" | "api" | "client";

export type GraphState = {
  nodes: Array<{ id: string; label: string; nodeType: NodeType }>;
  edges: Array<{ source: string; target: string; label?: string }>;
};

export interface NodeData extends Record<string, unknown> {
  label: string;
  nodeType: NodeType;
}

declare global {
  interface Navigator {
    modelContext?: {
      registerTool: (tool: object, options?: { signal?: AbortSignal }) => void;
      unregisterTool?: (name: string) => void;
    };
  }
}
