"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, Users, Download, LogIn, ArrowRight, Wand2, FileCode2, 
  History, CheckCircle2, ChevronRight, Layers, ShieldCheck, Zap,
  MousePointer2, ExternalLink
} from "lucide-react";
import { nanoid } from "nanoid";

export default function LandingPage() {
  const router = useRouter();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState("");
  const [activeTab, setActiveTab] = useState<"ai" | "layout" | "context" | "replay">("ai");

  // Simulated cursor movements for the Hero Demo Widget
  const [cursorAlex, setCursorAlex] = useState({ x: 120, y: 110 });
  const [cursorSarah, setCursorSarah] = useState({ x: 380, y: 220 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorAlex({
        x: 120 + Math.sin(Date.now() / 800) * 45,
        y: 110 + Math.cos(Date.now() / 900) * 25,
      });
      setCursorSarah({
        x: 380 + Math.cos(Date.now() / 700) * 50,
        y: 220 + Math.sin(Date.now() / 1000) * 30,
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleCreateBoard = () => {
    const boardId = nanoid(10);
    router.push(`/board/${boardId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomIdInput.trim()) return;

    let cleanId = roomIdInput.trim();
    if (cleanId.includes("/board/")) {
      cleanId = cleanId.split("/board/")[1];
    }
    router.push(`/board/${cleanId}`);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex flex-col bg-[#07070a] text-white selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* Background Lighting & Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] animate-pulse-slow"></div>
        <div className="absolute top-[40%] right-[-10%] w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[160px] animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 w-full border-b border-white/10 bg-[#07070a]/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-indigo-300">
              SynapseBoard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <LogIn size={16} />
              Join Room
            </button>
            <button 
              onClick={handleCreateBoard}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-sm font-semibold shadow-[0_0_25px_rgba(147,51,234,0.3)] hover:shadow-[0_0_35px_rgba(147,51,234,0.5)] hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              New Board <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 container mx-auto px-6 pt-12 pb-24 flex flex-col items-center">
        
        {/* Badge Pill */}
        <div className="glow-pill mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
            SynapseBoard 1.0 — Real-Time AI Canvas Engine
          </span>
          <ChevronRight size={14} className="text-purple-300" />
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 text-center max-w-5xl leading-[1.08] animate-fade-in-up">
          Think Together. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-200 to-cyan-300 drop-shadow-[0_0_35px_rgba(168,85,247,0.3)]">
            Draw Smarter.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl text-center mb-12 leading-relaxed font-sans">
          Production-grade architecture whiteboard with real-time multiplayer, AI diagram suggestions, 350ms Mess Cleanup layout engine, and executable context layers.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full justify-center max-w-md">
          <button 
            onClick={handleCreateBoard}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold text-lg shadow-[0_0_40px_rgba(147,51,234,0.35)] hover:shadow-[0_0_60px_rgba(147,51,234,0.6)] hover:scale-[1.03] transition-all flex items-center justify-center gap-3 group"
          >
            Launch Canvas <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => setShowJoinModal(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-xl flex items-center justify-center gap-2"
          >
            <Users size={18} className="text-purple-400" /> Join Existing Room
          </button>
        </div>

        {/* ===================================================
            HERO DEMO WIDGET (Simulated Live Canvas Preview)
           =================================================== */}
        <div className="w-full max-w-5xl glow-card p-2 md:p-4 mb-28 overflow-hidden shadow-2xl relative">
          
          {/* Top Bar inside Demo Box */}
          <div className="w-full h-10 border-b border-white/10 bg-[#0d0d16] rounded-t-lg px-4 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
              <span className="ml-2 font-mono text-gray-500">room/arch-review-live</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                2 Collaborators Online
              </span>
            </div>
          </div>

          {/* Canvas Area inside Demo Box */}
          <div className="w-full h-[380px] md:h-[440px] bg-[#090912] bg-dots-pattern relative overflow-hidden flex items-center justify-center">
            
            {/* SVG Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <line x1="160" y1="160" x2="360" y2="160" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="2" strokeDasharray="6 6" />
              <line x1="480" y1="160" x2="680" y2="160" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" />
            </svg>

            {/* Canvas Node 1: Client App */}
            <div className="absolute left-[60px] top-[120px] w-44 h-24 rounded-xl bg-purple-950/40 border border-purple-500/40 backdrop-blur-md p-3 flex flex-col justify-between shadow-[0_0_20px_rgba(168,85,247,0.15)] z-10 transition-all hover:scale-105">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-300">Client Web App</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200">React 19</span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">Next.js App Router</span>
              <div className="absolute -top-3 -right-2 bg-purple-600 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-lg flex items-center gap-1">
                <span>📎 2 Notes</span>
              </div>
            </div>

            {/* Canvas Node 2: API Gateway */}
            <div className="absolute left-[300px] top-[120px] w-48 h-24 rounded-xl bg-indigo-950/40 border border-indigo-500/40 backdrop-blur-md p-3 flex flex-col justify-between shadow-[0_0_20px_rgba(99,102,241,0.15)] z-10 transition-all hover:scale-105">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-300">API Gateway</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200">Express</span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">REST & WebSocket</span>
              <div className="absolute -top-3 -right-2 bg-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-lg flex items-center gap-1">
                <span>🤖 AI Suggestion</span>
              </div>
            </div>

            {/* Canvas Node 3: Postgres Database */}
            <div className="absolute right-[60px] top-[120px] w-44 h-24 rounded-xl bg-emerald-950/40 border border-emerald-500/40 backdrop-blur-md p-3 flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.15)] z-10 transition-all hover:scale-105">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300">Postgres DB</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200">Supabase</span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">Persistence Store</span>
            </div>

            {/* AI Ghost Shape Preview Overlay */}
            <div className="absolute bottom-[50px] left-[300px] w-48 h-20 rounded-xl border-2 border-dashed border-cyan-400/50 bg-cyan-950/20 backdrop-blur-sm p-3 flex items-center justify-center animate-pulse z-10">
              <span className="text-xs font-medium text-cyan-300 flex items-center gap-1.5">
                <Sparkles size={14} /> AI Ghost: Redis Cache
              </span>
            </div>

            {/* Simulated Live Cursor 1: Alex */}
            <div 
              className="absolute z-30 transition-all duration-75 pointer-events-none flex items-center gap-1"
              style={{ left: `${cursorAlex.x}px`, top: `${cursorAlex.y}px` }}
            >
              <MousePointer2 size={18} className="text-pink-400 fill-pink-400 drop-shadow-md" />
              <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-semibold shadow-md whitespace-nowrap">
                Alex (Architect)
              </span>
            </div>

            {/* Simulated Live Cursor 2: Sarah */}
            <div 
              className="absolute z-30 transition-all duration-75 pointer-events-none flex items-center gap-1"
              style={{ left: `${cursorSarah.x}px`, top: `${cursorSarah.y}px` }}
            >
              <MousePointer2 size={18} className="text-cyan-400 fill-cyan-400 drop-shadow-md" />
              <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-bold shadow-md whitespace-nowrap">
                Sarah (Eng)
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================
            INTERACTIVE FEATURE SHOWCASE TABS
           =================================================== */}
        <div className="w-full max-w-5xl mb-28">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-300">
              Engineered for Modern Systems
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
              Explore the core feature suite powering real-time system architecture and collaborative diagramming.
            </p>
          </div>

          {/* Showcase Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl max-w-2xl mx-auto">
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "ai" 
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles size={16} /> AI Assist
            </button>
            <button
              onClick={() => setActiveTab("layout")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "layout" 
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Wand2 size={16} /> Mess Cleanup
            </button>
            <button
              onClick={() => setActiveTab("context")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "context" 
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <FileCode2 size={16} /> Context Layer
            </button>
            <button
              onClick={() => setActiveTab("replay")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "replay" 
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <History size={16} /> Time-Travel
            </button>
          </div>

          {/* Showcase Tab Contents */}
          <div className="glow-card p-8 min-h-[280px] flex flex-col justify-center">
            {activeTab === "ai" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
                <div>
                  <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block mb-2">01 / Deep AI Intelligence</span>
                  <h3 className="text-2xl font-bold mb-3 text-white">AI Copilot & Architecture Assist</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Type a prompt like <em className="text-purple-300">"Add a microservice architecture with Redis cache and API gateway"</em>. SynapseBoard streams ghost shapes onto the canvas in real time.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-purple-300 font-semibold">
                    <CheckCircle2 size={16} className="text-emerald-400" /> Press <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-white">Tab</kbd> to accept ghost shape suggestions instantly.
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#090912] border border-white/10 font-mono text-xs text-cyan-300 leading-relaxed shadow-inner">
                  <span className="text-gray-500">// Streaming AI Architecture Assist...</span><br />
                  <span className="text-purple-400">POST</span> /api/ai/architecture-assist<br />
                  <span className="text-emerald-400">✓ Recommendation:</span> Insert Redis Cache cluster<br />
                  <span className="text-emerald-400">✓ Recommendation:</span> Add Kafka Message Queue<br />
                  <span className="text-amber-400">⚡ Status:</span> 2 Ghost shapes ready for canvas commit
                </div>
              </div>
            )}

            {activeTab === "layout" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
                <div>
                  <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest block mb-2">02 / Automated DAG Topology</span>
                  <h3 className="text-2xl font-bold mb-3 text-white">Mess Cleanup Engine</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Stop manually aligning canvas boxes. One click triggers a 350ms cubic-bezier animated auto-layout that reorganizes messy canvas nodes into clean hierarchical DAG layers.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold">
                    <CheckCircle2 size={16} className="text-emerald-400" /> Cubic-bezier easing physics with zero layout overlap.
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#090912] border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/10 pb-2">
                    <span>DAG Topology Matrix</span>
                    <span className="text-indigo-400 font-mono">Layout Physics: 350ms</span>
                  </div>
                  <div className="flex items-center justify-around py-4">
                    <div className="px-3 py-1.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs">Layer 0</div>
                    <span className="text-gray-600">➔</span>
                    <div className="px-3 py-1.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs">Layer 1</div>
                    <span className="text-gray-600">➔</span>
                    <div className="px-3 py-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs">Layer 2</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "context" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
                <div>
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2">03 / Shape Metadata Layer</span>
                  <h3 className="text-2xl font-bold mb-3 text-white">Executable Context Layer</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Attach notes, reference links, code snippets with syntax highlighting, and file documents directly to individual shapes with visual canvas context badges.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-cyan-300 font-semibold">
                    <CheckCircle2 size={16} className="text-emerald-400" /> Interactive glowing badges render directly on canvas shapes.
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#090912] border border-white/10 flex flex-col gap-2 font-mono text-xs">
                  <div className="p-2 rounded bg-white/5 border border-white/10 flex items-center justify-between text-purple-300">
                    <span>📝 Rich Text Notes</span>
                    <span className="text-gray-500">Auto-saved</span>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10 flex items-center justify-between text-blue-300">
                    <span>🔗 External Docs Link</span>
                    <span className="text-gray-500">https://api.docs</span>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/10 flex items-center justify-between text-emerald-300">
                    <span>💻 Code Snippet (TypeScript)</span>
                    <span className="text-gray-500">Syntax Highlighted</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "replay" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block mb-2">04 / Revision Timeline</span>
                  <h3 className="text-2xl font-bold mb-3 text-white">Time-Travel Replay</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Scrub through diagram history step-by-step with interactive playback controls. Review how your team's architecture evolved over time.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                    <CheckCircle2 size={16} className="text-emerald-400" /> Up to 50 historical canvas snapshots supported.
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#090912] border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>History Slider (Step 12 / 24)</span>
                    <span className="text-emerald-400">Playing @ 1x</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 w-1/2"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            STATS & METRICS BAR
           =================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl mb-24">
          <StatCard number="350ms" label="Auto-Align Layout" icon={<Zap className="text-yellow-400" />} />
          <StatCard number="100%" label="Type-Safe Codebase" icon={<ShieldCheck className="text-emerald-400" />} />
          <StatCard number="Instant" label="Mermaid Export" icon={<FileCode2 className="text-blue-400" />} />
          <StatCard number="Live" label="Multiplayer Sync" icon={<Users className="text-purple-400" />} />
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#050508] py-8 text-center text-xs text-gray-500">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 SynapseBoard. Production-grade architecture whiteboard.</span>
          <div className="flex items-center gap-6">
            <a href="https://github.com/Tejas3479/whiteboard" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              GitHub Repository <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </footer>

      {/* ===================================================
          JOIN ROOM MODAL
         =================================================== */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md p-6 bg-[#0f0f18] border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-5 animate-fade-in-scale">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogIn size={20} className="text-purple-400" />
                <h3 className="font-bold text-lg text-white">Join Whiteboard Room</h3>
              </div>
              <button 
                onClick={() => setShowJoinModal(false)}
                className="text-gray-400 hover:text-white text-sm font-bold px-2 py-1 rounded hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Enter a room ID code or paste a full SynapseBoard link to join a collaborative session.
            </p>

            <form onSubmit={handleJoinRoom} className="flex flex-col gap-4">
              <input 
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="e.g. ab12cd34ef or full link"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-all text-sm font-mono"
                autoFocus
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!roomIdInput.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Join Board <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ number, label, icon }: { number: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="glow-card p-6 flex flex-col items-center text-center">
      <div className="mb-2 p-2 rounded-lg bg-white/5">{icon}</div>
      <span className="text-2xl md:text-3xl font-extrabold text-white mb-1 font-mono">{number}</span>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
    </div>
  );
}
