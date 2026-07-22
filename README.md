# SynapseBoard ⚡

> **Think Together. Draw Smarter.**
> Production-grade, real-time collaborative architecture whiteboard powered by AI diagram intelligence, Liveblocks multiplayer presence, tldraw canvas engine, and Supabase persistent storage.

---

## 🌟 Key Features

### 🤖 1. AI Copilot & On-Canvas "Ghost Shapes"
- **AI Diagram Streaming:** Describe any cloud or software system (e.g. *"AWS Serverless Architecture with CloudFront, Lambda, and DynamoDB"*) to stream structured architecture nodes and edges in real-time.
- **On-Canvas Ghost Shapes:** Renders semi-transparent (`opacity: 0.45`, dashed grey) ghost shapes directly at target coordinates on the canvas before committing.
- **1-Key Tab Commit:** Press **Tab** or click **Accept** to instantly convert ghost shapes into solid, synced tldraw canvas shapes.

### 🧬 2. Mermaid-to-Canvas Compiler (Two-Way Sync)
- **Import Mermaid Markdown:** Paste any standard Mermaid syntax (e.g. from ChatGPT or GitHub docs) to compile it into interactive, movable tldraw shapes.
- **Shape Support:** Recognizes rectangular services `[Node]`, rounded endpoints `(API)`, databases `[(DB)]`, and decision nodes `{Router}` with labeled connecting arrows `-->|HTTPS|`.
- **Export Formats:** 1-click export of active canvas diagrams to Mermaid.js code syntax, high-res **PNG** images, or vector **SVG** files.

### 👥 3. Multiplayer & Teammate "Follow Mode"
- **Live Cursors & Presence:** Synchronized multi-user cursors with customized user names, avatars, and distinct colors powered by `@liveblocks/react`.
- **Continuous Follow Mode:** Click any teammate's avatar in the top bar to lock your camera to theirs, smoothly tracking their screen as they present or navigate around the canvas.

### ⏳ 4. Time-Travel Diagram Replay
- **Historical Timeline:** Automatically records step-by-step canvas snapshots as your architecture evolves.
- **Interactive Replay Bar:** Scrub backward and forward using a bottom playback slider, complete with **Play/Pause**, **Step Back**, **Step Forward**, and automatic live state restoration.

### 💾 5. Supabase Postgres Room & Snapshot Persistence
- **Persistent Rooms:** Database storage backed by Supabase Postgres with Row Level Security (RLS) policies for room titles, access states, and canvas state snapshots across server restarts.
- **Seamless Local Fallback:** Gracefully falls back to an in-memory persistent store when Supabase environment variables are not supplied.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Core application framework & API routes |
| **Canvas Engine** | [tldraw v5](https://tldraw.dev/) | Infinite vector canvas drawing engine |
| **Multiplayer Sync** | [Liveblocks](https://liveblocks.io/) | Real-time presence, Yjs synchronization, and user state |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) | Global UI state, AI suggestions, and follow mode |
| **Persistence** | [Supabase Postgres](https://supabase.com/) | Room metadata & canvas snapshot storage |
| **AI Stream Engine** | [Vercel AI SDK](https://sdk.vercel.ai/) & OpenAI | Streaming NDJSON diagram generation |
| **Styling** | Vanilla CSS Tokens & TailwindCSS v4 | Modern glassmorphism UI & responsive layouts |

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher

### 2. Clone & Install
```bash
git clone https://github.com/Tejas3479/whiteboard.git
cd whiteboard
npm install
```

### 3. Environment Variables (Optional)
Create a `.env.local` file in the root directory:
```env
# OpenAI API Key for live AI diagram generation
OPENAI_API_KEY=your_openai_api_key_here

# Liveblocks API Key for real-time collaboration
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your_liveblocks_public_key_here

# Supabase Postgres Persistence (Optional - falls back to local memory if omitted)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 🗄️ Supabase Database Migration Setup

To configure Supabase Postgres persistence, run the SQL migration script located in [`supabase/schema.sql`](file:///c:/Users/tejas/Downloads/whiteboard/supabase/schema.sql):

```sql
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(32) PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Untitled Architecture Board',
  is_public BOOLEAN DEFAULT true,
  snapshot_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public rooms are readable by everyone" ON rooms FOR SELECT USING (is_public = true);
CREATE POLICY "Anyone can create a room" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update room snapshots" ON rooms FOR UPDATE USING (true);
```

---

## ⌨️ Keyboard Shortcuts & Quick Chips

| Shortcut / Control | Action |
| :--- | :--- |
| **Tab** | Instantly commit top AI suggestion / ghost shape on canvas |
| **Click Teammate Avatar** | Toggle continuous camera **Follow Mode** |
| **Time-Travel Button** | Toggle step-by-step diagram history replay slider |
| **`Auth Flow` chip** | Quick prompt: Generate OAuth / Client-Auth diagram |
| **`AWS Serverless` chip** | Quick prompt: Generate CloudFront -> Gateway -> Lambda -> DynamoDB |
| **`Kubernetes Cluster` chip** | Quick prompt: Generate Ingress -> Pods -> StatefulSet |
| **`Kafka Event Pipeline` chip** | Quick prompt: Generate Producer -> Broker -> Consumers |

---

## 📚 Documentation Suite

For deeper technical specifications, see:
- [📁 Technical Architecture Guide (`ARCHITECTURE.md`)](file:///c:/Users/tejas/Downloads/whiteboard/ARCHITECTURE.md)
- [📁 REST API Reference (`API.md`)](file:///c:/Users/tejas/Downloads/whiteboard/API.md)

---

## 📄 License

Distributed under the MIT License. Built with ❤️ for developers and system architects.
