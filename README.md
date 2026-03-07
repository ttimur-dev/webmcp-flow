# WebMCP Flow

🚀 Live Demo: https://webmcp-flow.vercel.app/

![WebMCP Flow Demo](./docs/demo.gif)

An AI-controllable architecture diagram builder built on top of **WebMCP** — Chrome's browser-native agent protocol. Describe a system in plain text and watch the diagram build itself in real time.

## WebMCP Tools

The application exposes the following tools via `navigator.modelContext`:

- `add_node` — add a node with a label and type (`service`, `database`, `cache`, `queue`, `api`, `client`)
- `add_edge` — connect two nodes with an optional protocol label
- `remove_node` — delete a node and its connected edges
- `update_node` — rename or retype an existing node
- `get_graph` — read the current state of the diagram
- `clear_graph` — reset the canvas
- `auto_layout` — arrange nodes into a readable left-to-right layout

## How It Works

Each tool dispatches a `CustomEvent` to the React app and waits for a completion event before returning — giving the agent accurate feedback on every action. The graph state is kept in a module-level store that tools read directly, with no coupling to React internals.

## Tech Stack

- **React + TypeScript** (Vite)
- **[@xyflow/react](https://reactflow.dev/)** — node-based graph rendering
- **WebMCP** — `navigator.modelContext` for tool registration

## Requirements

- Chrome 146+ with `chrome://flags/#enable-webmcp-testing` enabled
- [Model Context Tool Inspector](https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd) extension

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome with the WebMCP flag enabled.

## Example Prompt

> Draw a typical web application architecture with authentication: browser client, API Gateway, Auth Service, User Service, PostgreSQL, Redis. Connect them with edges labeled by protocol and apply auto layout.
