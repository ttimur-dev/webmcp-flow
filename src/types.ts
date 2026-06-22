export type NodeType = "service" | "database" | "cache" | "queue" | "api" | "client";

export type GraphState = {
  nodes: Array<{ id: string; label: string; nodeType: NodeType }>;
  edges: Array<{ source: string; target: string; label?: string }>;
};

export interface NodeData extends Record<string, unknown> {
  label: string;
  nodeType: NodeType;
}

interface ModelContext {
  registerTool: (tool: object, options?: { signal?: AbortSignal }) => void;
}

declare global {
  // WebMCP moved from `navigator.modelContext` to `document.modelContext` in Chrome 150.
  // `navigator.modelContext` is kept only for feature-detection fallback on older builds.
  interface Document {
    modelContext?: ModelContext;
  }
  interface Navigator {
    modelContext?: ModelContext;
  }
}
