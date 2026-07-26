'use client';

import React, { useState } from 'react';
import { 
  MousePointer2, 
  Hand, 
  Pen, 
  Square, 
  Circle, 
  ArrowUpRight, 
  Type, 
  Eraser, 
  Sparkles,
  Wand2,
  FileText
} from 'lucide-react';
import { useAppStore, Tool } from '@/store/app-store';
import { useContextStore } from '@/store/context-store';
import { executeMessCleanup } from '@/lib/auto-layout';

import { Editor } from 'tldraw';

interface ToolbarProps {
  editor?: Editor | null;
}

const tools: { id: Tool; icon: React.ElementType; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'hand', icon: Hand, label: 'Hand' },
  { id: 'draw', icon: Pen, label: 'Draw' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Arrow' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
];

export function Toolbar({ editor }: ToolbarProps) {
  const { activeTool, setActiveTool, aiPanelOpen, toggleAiPanel } = useAppStore();
  const { isContextPanelOpen, openContextPanel, closeContextPanel } = useContextStore();
  const [cleanedCount, setCleanedCount] = useState<number | null>(null);

  const handleToolSelect = (toolId: Tool) => {
    setActiveTool(toolId);
    if (!editor) return;

    switch (toolId) {
      case 'select':
        editor.setCurrentTool('select');
        break;
      case 'hand':
        editor.setCurrentTool('hand');
        break;
      case 'draw':
        editor.setCurrentTool('draw');
        break;
      case 'rectangle':
      case 'ellipse':
        editor.setCurrentTool('geo');
        break;
      case 'arrow':
        editor.setCurrentTool('arrow');
        break;
      case 'text':
        editor.setCurrentTool('text');
        break;
      case 'eraser':
        editor.setCurrentTool('eraser');
        break;
    }
  };

  const handleMessCleanup = async () => {
    if (!editor) return;
    const count = await executeMessCleanup(editor);
    setCleanedCount(count);
    setTimeout(() => setCleanedCount(null), 2000);
  };

  const handleToggleContext = () => {
    if (isContextPanelOpen) {
      closeContextPanel();
    } else {
      if (!editor) return;
      const selectedShapes = Array.from(editor.getSelectedShapes());
      if (selectedShapes.length > 0) {
        const first = selectedShapes[0];
        const label = (first.props as { text?: string })?.text || 'Selected Component';
        openContextPanel(first.id.toString(), label);
      } else {
        openContextPanel('global-board-notes', 'Board Main Notes');
      }
    }
  };

  return (
    <div 
      className="fixed left-2 md:left-4 top-1/2 -translate-y-1/2 flex flex-row md:flex-col gap-1 md:gap-2 p-1.5 md:p-2 glass z-50 animate-slide-up max-h-[80vh] overflow-x-auto md:overflow-y-auto border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      style={{ borderRadius: 'var(--radius-xl)' }}
    >
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => handleToolSelect(tool.id)}
          className={`relative group w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0 ${
            activeTool === tool.id 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.35)] scale-105' 
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <tool.icon size={16} className="md:w-5 md:h-5 transition-transform group-hover:scale-110 group-active:scale-95" />
          
          {/* Tooltip */}
          <div 
            className="absolute left-full ml-3 px-2.5 py-1 text-xs whitespace-nowrap rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 glass font-medium shadow-xl border border-white/10 text-gray-200"
          >
            {tool.label}
          </div>
        </button>
      ))}

      <div 
        className="w-full h-px my-1 bg-white/10" 
      />

      {/* MESS CLEANUP BUTTON */}
      <button
        onClick={handleMessCleanup}
        className="relative group w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl transition-all duration-300 overflow-hidden bg-gradient-to-tr from-amber-500/20 to-purple-500/20 hover:from-amber-500/40 hover:to-purple-500/40 border border-amber-500/40 text-amber-300 hover:scale-105 shadow-sm"
        title="Mess Cleanup — Auto-align diagram structure"
      >
        <Wand2 size={18} className="text-amber-400 group-hover:rotate-12 transition-transform" />
        
        {/* Tooltip */}
        <div 
          className="absolute left-full ml-3 px-2.5 py-1 text-xs whitespace-nowrap rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 glass font-semibold text-amber-300 shadow-xl border border-amber-500/30"
        >
          {cleanedCount !== null ? `Aligned ${cleanedCount} shapes!` : 'Mess Cleanup (Auto-Align)'}
        </div>
      </button>

      {/* CONTEXT LAYER BUTTON */}
      <button
        onClick={handleToggleContext}
        className={`relative group w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
          isContextPanelOpen 
            ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/50 scale-105' 
            : 'hover:bg-white/10 text-gray-300 border border-transparent'
        }`}
        title="Context Layer — Attach Notes, Links, Code & Files"
      >
        <FileText size={18} className={isContextPanelOpen ? 'text-white' : 'text-purple-400 group-hover:scale-110 transition-transform'} />
        
        {/* Tooltip */}
        <div 
          className="absolute left-full ml-3 px-2.5 py-1 text-xs whitespace-nowrap rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 glass font-medium shadow-xl border border-white/10 text-gray-200"
        >
          Context Layer (Notes/Links/Code)
        </div>
      </button>

      <div 
        className="w-full h-px my-1 bg-white/10" 
      />

      {/* AI COPILOT BUTTON */}
      <button
        onClick={toggleAiPanel}
        className={`relative group w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl transition-all duration-300 overflow-hidden ${
          aiPanelOpen 
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_25px_rgba(147,51,234,0.5)] border border-purple-400/50 scale-105' 
            : 'hover:bg-white/10 text-gray-300 border border-transparent'
        }`}
      >
        {!aiPanelOpen && (
          <div className="absolute inset-0 opacity-20 hover:opacity-100 transition-opacity bg-gradient-to-tr from-purple-500 to-blue-500 animate-pulse-glow" />
        )}
        <Sparkles size={18} className="relative z-10 text-cyan-300 group-hover:rotate-12 transition-transform" />
        
        {/* Tooltip */}
        <div 
          className="absolute left-full ml-3 px-2.5 py-1 text-xs whitespace-nowrap rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 glass font-medium shadow-xl border border-white/10 text-gray-200"
        >
          AI Architecture Assist
        </div>
      </button>
    </div>
  );
}

