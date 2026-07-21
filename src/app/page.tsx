"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Users, Download, LogIn, ArrowRight } from "lucide-react";
import { nanoid } from "nanoid";

export default function LandingPage() {
  const router = useRouter();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState("");

  const handleCreateBoard = () => {
    const boardId = nanoid(10);
    router.push(`/board/${boardId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomIdInput.trim()) return;

    // Handle full URL or room ID code
    let cleanId = roomIdInput.trim();
    if (cleanId.includes("/board/")) {
      cleanId = cleanId.split("/board/")[1];
    }
    router.push(`/board/${cleanId}`);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)] bg-black text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[var(--background)]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-[var(--accent,blue)]/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16 flex flex-col items-center text-center">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-white/80">
          Introducing SynapseBoard 1.0
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-[var(--accent,pink-500)] drop-shadow-sm">
          Think Together. <br className="hidden md:block" />Draw Smarter.
        </h1>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed font-[family-name:var(--font-geist-mono)]">
          Real-time collaborative whiteboard powered by AI diagram intelligence. 
          Turn your ideas into structured architecture instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full justify-center">
          <button 
            onClick={handleCreateBoard}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] hover:scale-105 transition-all duration-300 w-full sm:w-auto"
          >
            Create Board
          </button>
          <button 
            onClick={() => setShowJoinModal(true)}
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 hover:scale-105 transition-all duration-300 backdrop-blur-md w-full sm:w-auto"
          >
            Join Room
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <FeatureCard 
            icon={<Sparkles className="w-8 h-8 text-yellow-400" />}
            title="AI Copilot"
            description="AI suggests diagrams as you draw"
          />
          <FeatureCard 
            icon={<Users className="w-8 h-8 text-blue-400" />}
            title="Real-time Collab"
            description="See cursors and changes live"
          />
          <FeatureCard 
            icon={<Download className="w-8 h-8 text-green-400" />}
            title="Smart Export"
            description="Export to Mermaid, PNG, SVG"
          />
        </div>
      </div>

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in px-4">
          <div className="w-full max-w-md p-6 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-5 animate-fade-in-scale">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogIn size={22} className="text-purple-400" />
                <h3 className="font-bold text-xl text-white">Join Whiteboard Room</h3>
              </div>
              <button 
                onClick={() => setShowJoinModal(false)}
                className="text-gray-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-400">
              Enter a room ID or paste a full SynapseBoard link to join an existing collaborative session.
            </p>

            <form onSubmit={handleJoinRoom} className="flex flex-col gap-4">
              <input 
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="e.g. ab12cd34ef or full link"
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
                autoFocus
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!roomIdInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Join Board <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group cursor-default relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="mb-5 p-4 rounded-xl bg-white/5 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-center text-sm">{description}</p>
    </div>
  );
}
