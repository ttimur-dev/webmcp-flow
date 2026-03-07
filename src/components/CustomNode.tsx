import { Handle, Position } from "@xyflow/react";
import type { NodeData } from "../types";
import { NODE_CONFIG } from "../constants/nodes";
import "./CustomNode.css";

export default function CustomNode({ data }: { data: NodeData }) {
  const { color, bg, icon } = NODE_CONFIG[data.nodeType] ?? NODE_CONFIG.service;

  return (
    <div className="custom-node" style={{ "--node-color": color, "--node-bg": bg } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} />
      <span className="custom-node__icon">{icon}</span>
      <span className="custom-node__label">{data.label}</span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
