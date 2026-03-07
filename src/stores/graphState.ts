import type { GraphState } from "../types";

let _state: GraphState = { nodes: [], edges: [] };

export const getGraphState = (): GraphState => _state;
export const setGraphState = (state: GraphState): void => {
  _state = state;
};
