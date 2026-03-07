import type { Node, Edge } from "@xyflow/react";
import type { NodeData } from "../types";

const NODE_WIDTH = 160;
const NODE_HEIGHT = 60;
const H_GAP = 80;
const V_GAP = 60;

export function autoLayout(nodes: Node<NodeData>[], edges: Edge[]): Node<NodeData>[] {
  if (nodes.length === 0) return nodes;

  // Build adjacency
  const inDegree: Record<string, number> = {};
  const children: Record<string, string[]> = {};

  for (const n of nodes) {
    inDegree[n.id] = 0;
    children[n.id] = [];
  }
  for (const e of edges) {
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    children[e.source] = children[e.source] || [];
    children[e.source].push(e.target);
  }

  // Kahn's BFS — assign layers
  const layer: Record<string, number> = {};
  const queue = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
  queue.forEach((id) => (layer[id] = 0));

  let head = 0;
  while (head < queue.length) {
    const id = queue[head++];
    for (const child of children[id] || []) {
      layer[child] = Math.max(layer[child] ?? 0, layer[id] + 1);
      inDegree[child]--;
      if (inDegree[child] === 0) queue.push(child);
    }
  }

  // Assign remaining nodes (cycles) to last layer
  const maxLayer = Math.max(0, ...Object.values(layer));
  for (const n of nodes) {
    if (layer[n.id] === undefined) layer[n.id] = maxLayer + 1;
  }

  // Group by layer
  const byLayer: Record<number, string[]> = {};
  for (const [id, l] of Object.entries(layer)) {
    byLayer[l] = byLayer[l] || [];
    byLayer[l].push(id);
  }

  // Position
  const positions: Record<string, { x: number; y: number }> = {};
  for (const [l, ids] of Object.entries(byLayer)) {
    const layerNum = Number(l);
    const totalHeight = ids.length * NODE_HEIGHT + (ids.length - 1) * V_GAP;
    ids.forEach((id, i) => {
      positions[id] = {
        x: layerNum * (NODE_WIDTH + H_GAP),
        y: i * (NODE_HEIGHT + V_GAP) - totalHeight / 2 + 300,
      };
    });
  }

  return nodes.map((n) => ({
    ...n,
    position: positions[n.id] ?? n.position,
  }));
}
