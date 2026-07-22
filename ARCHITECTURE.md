# SynapseBoard System Architecture & Design Document 📐

This document provides a comprehensive technical breakdown of **SynapseBoard**'s system design, state management, real-time collaboration pipeline, Mess Cleanup engine, Deep Architecture Assist, Context Layer, AI streaming engine, and storage architecture.

---

## 🗺️ High-Level System Architecture Diagram

```mermaid
graph TD
    UserClient[Web Browser / User Client] -->|Next.js 16 App Router| UI[React 19 UI Layer]
    
    subgraph UI Overlay & Canvas
        UI --> TopBar[Top Bar & Multi-Modal Controls]
        UI --> Toolbar[Left Vector Toolbar & Mess Cleanup]
        UI --> AIPanel[AI Copilot & Architecture Assist]
        UI --> ContextPanel[Context Layer Panel]
        UI --> ContextBadges[Canvas Shape Badges Overlay]
        UI --> Canvas[tldraw v5 Vector Engine]
        UI --> ReplayBar[Time-Travel Replay Bar]
    end

    subgraph Core Logic & State Management
        UI --> Store[Zustand Global App Store]
        UI --> ContextStore[Zustand Context Store]
        Toolbar -->|Auto-Align & Animation| AutoLayout[Auto-Layout & DAG Engine]
        AutoLayout -->|Batch Update| Canvas
        ContextBadges -->|Screen Projection| Canvas
        Store -->|State Sync| Canvas
        Store -->|Presence Tracking| Cursors[Presence & Cursors Overlay]
    end

    subgraph Backend Services & APIs
        AIPanel -->|NDJSON Stream| AIService[/api/ai/suggest]
        AIPanel -->|Canvas Shapes Payload| ArchAssist[/api/ai/architecture-assist]
        TopBar -->|Mermaid / SVG / PNG| ExportService[/api/export]
        TopBar -->|Room CRUD| RoomsService[/api/rooms]
        
        AIService -->|Vercel AI SDK| OpenAI[OpenAI GPT-4o-mini]
        ArchAssist -->|Deep Analysis Stream| OpenAI
        RoomsService -->|REST / RLS| Supabase[(Supabase Postgres)]
    end

    subgraph Multiplayer Network
        Cursors -->|Liveblocks Yjs WebSocket| Liveblocks[Liveblocks Cloud]
    end
```

---

## ⚡ Core Architecture Modules

### 1. Canvas Engine (`tldraw v5` Integration)
- **Path:** [`src/components/canvas-wrapper.tsx`](file:///c:/Users/tejas/Downloads/whiteboard/src/components/canvas-wrapper.tsx) & [`src/app/board/[id]/page.tsx`](file:///c:/Users/tejas/Downloads/whiteboard/src/app/board/[id]/page.tsx)
- **Design:** `tldraw` provides an infinite vector canvas. We isolate the canvas instance and expose the `Editor` object via the `onMount` callback to parent UI overlays (`TopBar`, `Toolbar`, `AiPanel`, `ContextPanel`, `ContextBadges`, `TimeTravelReplay`).
- **Reactive Updates:** The UI overlays programmatically construct tldraw shape definitions (`editor.createShapes()`), query active shapes (`editor.getCurrentPageShapes()`), center viewport (`editor.centerOnPoint()`), and manipulate zoom (`editor.zoomIn()`, `editor.zoomOut()`).

---

### 2. Mess Cleanup & Auto-Layout Engine
- **Path:** [`src/lib/auto-layout.ts`](file:///c:/Users/tejas/Downloads/whiteboard/src/lib/auto-layout.ts) & [`src/components/toolbar.tsx`](file:///c:/Users/tejas/Downloads/whiteboard/src/components/toolbar.tsx)
- **Graph Topology Extraction:** `extractGraphFromEditor()` scans all `geo`, `text`, `note`, and `arrow` shapes, using both explicit bindings (`boundShapeId`) and spatial proximity heuristics (`< 250px` start/end radius) to deduce diagram topology.
- **Hierarchical DAG Layering:** `computeAutoLayout()` groups nodes into longest-path dependency layers, calculating centered screen positions with horizontal (`260px`) and vertical (`140px`) spacing while updating connecting arrow coordinates.
- **Smooth 350ms Easing Animation:** `executeMessCleanup()` uses a `requestAnimationFrame` physics loop with cubic-bezier easing (`easeOutCubic`) to smoothly interpolate shape positions and arrow control points frame-by-frame.

---

### 3. Architecture Assist Deep Analysis Pipeline
- **Path:** [`src/app/api/ai/architecture-assist/route.ts`](file:///c:/Users/tejas/Downloads/whiteboard/src/app/api/ai/architecture-assist/route.ts) & [`src/components/ai-panel.tsx`](file:///c:/Users/tejas/Downloads/whiteboard/src/components/ai-panel.tsx)
- **Canvas Serialization & Deep Analysis:**
  1. `handleRunArchitectureAssist()` serializes current canvas shape labels and arrow connections, posting to `/api/ai/architecture-assist`.
  2. The backend constructs a structured architecture context prompt for a specialized Systems Architect AI (`gpt-4o-mini`).
  3. Returns an NDJSON stream of categorized recommendations (`missing_component`, `api_suggestion`, `dbms_guidance`, `scalability_tip`).
  4. The UI displays actionable cards with priority tags and a **"+ Add [Node Label] to Canvas"** button that programmatically creates missing architecture components directly on the whiteboard.

---

### 4. Executable Context Layer & Canvas Badges Overlay
- **Path:** [`src/store/context-store.ts`](file:///c:/Users/tejas/Downloads/whiteboard/src/store/context-store.ts), [`src/components/context-panel.tsx`](file:///c:/Users/tejas/Downloads/whiteboard/src/components/context-panel.tsx), & [`src/components/context-badges.tsx`](file:///c:/Users/tejas/Downloads/whiteboard/src/components/context-badges.tsx)
- **Per-Element Metadata Store:** Manages `ShapeContext` records containing Notes, reference Links, multi-language Code Snippets, and File attachments, persisting changes per room in `localStorage`.
- **Reactive Shape Selection Listener:** `BoardPage` monitors shape selection via `editor.store.listen()`, opening the slide-out Context Panel whenever an element is clicked.
- **Screen-Projected Canvas Badges:** `ContextBadges` listens to camera zoom and pan events, projecting canvas shape coordinates to viewport space via `editor.pageToViewport()`. Renders interactive badge buttons with attachment counts directly on top of annotated shapes.

---

### 5. AI Copilot & Ghost Shape Pipeline
- **Path:** [`src/app/api/ai/suggest/route.ts`](file:///c:/Users/tejas/Downloads/whiteboard/src/app/api/ai/suggest/route.ts) & [`src/components/ai-panel.tsx`](file:///c:/Users/tejas/Downloads/whiteboard/src/components/ai-panel.tsx)
- **Streaming Pipeline:**
  1. The user submits a prompt (e.g. *"Kubernetes Cluster Architecture"*).
  2. The `/api/ai/suggest` route returns an `application/x-ndjson` stream where each line contains a JSON node or edge chunk.
  3. The client parses incoming NDJSON lines on the fly.
  4. Clicking **Ghost** converts the structured diagram nodes into semi-transparent (`opacity: 0.45`, `dash: 'dashed'`, `color: 'grey'`) tldraw shapes at calculated target coordinates.
  5. Pressing **Tab** or clicking **Accept** purges the ghost shapes and commits solid, permanent synced shapes (`dash: 'draw'`, regular colors) into the editor.

---

### 6. Mermaid-to-Canvas Compiler Engine
- **Path:** [`src/lib/mermaid-compiler.ts`](file:///c:/Users/tejas/Downloads/whiteboard/src/lib/mermaid-compiler.ts)
- **Parsing Strategy:**
  - Tokenizes raw Mermaid syntax using regex AST matchers:
    - `ID[(Label)]` -> Database / Cylinder
    - `ID((Label))` -> Circle / Ellipse
    - `ID{Label}`   -> Decision / Rhombus
    - `ID[Label]`   -> Service / Rectangle
  - Extracts edge connection pairs (`A -->|HTTPS| B` or `A -- gRPC --> B`).
  - Computes automatic grid tree coordinates (`center.x`, `center.y`, row/column spacing) based on graph direction (`TD` vs `LR`).
  - Generates corresponding `geo` and `arrow` tldraw shape payloads.

---

### 7. Teammate Live "Follow Mode"
- **Path:** [`src/components/presence-cursors.tsx`](file:///c:/Users/tejas/Downloads/whiteboard/src/components/presence-cursors.tsx) & [`src/components/top-bar.tsx`](file:///c:/Users/tejas/Downloads/whiteboard/src/components/top-bar.tsx)
- **Mechanism:**
  - Multi-user cursor coordinates are broadcast across connected peers via Liveblocks `useUpdateMyPresence` pointer listeners.
  - When a user activates **Follow Mode** for a teammate avatar, `useAppStore` updates `followingUserId`.
  - A `useEffect` hook in `PresenceCursors` monitors the followed user's presence cursor coordinates `(x, y)` and continuously centers the local camera using `editor.centerOnPoint({ x, y })`.

---

### 8. Time-Travel Diagram Replay
- **Path:** [`src/components/time-travel-replay.tsx`](file:///c:/Users/tejas/Downloads/whiteboard/src/components/time-travel-replay.tsx)
- **Mechanism:**
  - Listens to tldraw document changes (`editor.store.listen()`).
  - Captures incremental page shape snapshots into a rolling history buffer.
  - In replay mode, hides live editing and mounts a playback scrubber slider.
  - Scrubbing or pressing **Play** swaps out current shapes with historical step snapshots. Exiting replay mode restores the live editor state seamlessly.

---

### 9. Supabase Persistence & Fallback Layer
- **Path:** [`src/lib/supabase.ts`](file:///c:/Users/tejas/Downloads/whiteboard/src/lib/supabase.ts) & [`supabase/schema.sql`](file:///c:/Users/tejas/Downloads/whiteboard/supabase/schema.sql)
- **Design:**
  - `PersistenceService` provides async methods (`createRoom`, `getRoom`, `updateRoomSnapshot`).
  - Queries Supabase REST API endpoints with Row Level Security (RLS) policies when environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) are set.
  - If keys are missing, automatically uses an in-memory persistent map store, preventing runtime crashes.

---

## 🎨 Design System & Styling Tokens

Defined in [`src/app/globals.css`](file:///c:/Users/tejas/Downloads/whiteboard/src/app/globals.css):
- **Glassmorphism:** `.glass` class using backdrop blur (`16px`) and subtle borders.
- **Theme Variables:** CSS variables (`--background`, `--surface`, `--accent`, `--border`, `--text-primary`) supporting seamless Dark and Light theme switching.
