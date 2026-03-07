import type { NodeType } from "../types";

export const NODE_TYPES: NodeType[] = ["service", "database", "cache", "queue", "api", "client"];

export const NODE_CONFIG: Record<NodeType, { color: string; bg: string; icon: string }> = {
  service: { color: "#60a5fa", bg: "#1e3a5f", icon: "⚙️" },
  database: { color: "#fb923c", bg: "#3d1f0a", icon: "🗄️" },
  cache: { color: "#f87171", bg: "#3d0f0f", icon: "⚡" },
  queue: { color: "#a78bfa", bg: "#2d1b5e", icon: "📬" },
  api: { color: "#4ade80", bg: "#0d3320", icon: "🔗" },
  client: { color: "#94a3b8", bg: "#1e2535", icon: "💻" },
};

export const LEGEND_ITEMS = NODE_TYPES.map((type) => ({
  type,
  icon: NODE_CONFIG[type].icon,
}));
