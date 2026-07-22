"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { useContextStore } from "@/store/context-store";
import { Editor } from "tldraw";

import { TopBar } from "@/components/top-bar";
import { Toolbar } from "@/components/toolbar";
import { AiPanel } from "@/components/ai-panel";
import { ContextPanel } from "@/components/context-panel";
import { PresenceCursors } from "@/components/presence-cursors";
import { ZoomControls } from "@/components/zoom-controls";
import { LiveblocksProvider } from "@/components/liveblocks-provider";
import { TimeTravelReplay } from "@/components/time-travel-replay";
import { ContextBadges } from "@/components/context-badges";

const CanvasWrapper = dynamic(() => import("@/components/canvas-wrapper"), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">Loading canvas...</div>
});

export default function BoardPage() {
  const params = useParams();
  const id = params.id as string;
  
  const setCurrentRoom = useAppStore((state) => state.setCurrentRoom);
  const aiPanelOpen = useAppStore((state) => state.aiPanelOpen);
  const { openContextPanel, closeContextPanel, activeShapeId, setRoomId } = useContextStore();
  
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    if (id) {
      setRoomId(id);
      setCurrentRoom({
        id,
        name: `Room ${id.substring(0, 4)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }, [id, setCurrentRoom, setRoomId]);

  // Reactive selection listener for shape selection changes on canvas
  useEffect(() => {
    if (!editor) return;

    const unlisten = editor.store.listen(
      () => {
        const selectedShapes = Array.from(editor.getSelectedShapes());
        if (selectedShapes.length > 0) {
          const first = selectedShapes[0];
          const shapeIdStr = first.id.toString();
          if (shapeIdStr !== activeShapeId) {
            const label = (first.props as { text?: string })?.text || 'Selected Component';
            openContextPanel(shapeIdStr, label);
          }
        }
      },
      { scope: 'session', source: 'user' }
    );

    return () => {
      unlisten();
    };
  }, [editor, activeShapeId, openContextPanel, closeContextPanel]);

  return (
    <LiveblocksProvider roomId={id || "default-room"}>
      <div className="w-screen h-screen overflow-hidden relative bg-[var(--background)] text-[var(--foreground)]">
        {/* Tldraw Canvas Layer */}
        <div className="absolute inset-0 z-0">
          <CanvasWrapper onMount={setEditor} />
        </div>

        {/* UI Overlay Layer */}
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col">
          {/* Top Bar */}
          <div className="pointer-events-auto">
            <TopBar editor={editor} />
          </div>
          
          <div className="flex-1 relative flex">
            {/* Left Toolbar */}
            <div className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2">
              <Toolbar editor={editor} />
            </div>

            {/* Context Layer Panel */}
            <div className="pointer-events-auto">
              <ContextPanel />
            </div>

            {/* Right AI Panel */}
            {aiPanelOpen && (
              <div className="pointer-events-auto absolute right-4 top-4 bottom-20 w-80 shadow-2xl transition-all duration-300 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
                <AiPanel editor={editor} />
              </div>
            )}

            {/* Bottom Replay Control */}
            <div className="pointer-events-auto">
              <TimeTravelReplay editor={editor} />
            </div>

            {/* Bottom Right Zoom Controls */}
            <div className="pointer-events-auto absolute bottom-4 right-4">
              <ZoomControls editor={editor} />
            </div>
          </div>

          {/* Context Badges Layer */}
          <ContextBadges editor={editor} />

          {/* Presence Layer */}
          <PresenceCursors editor={editor} />
        </div>
      </div>
    </LiveblocksProvider>
  );
}
