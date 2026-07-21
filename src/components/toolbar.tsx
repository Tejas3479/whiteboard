'use client';

import React from 'react';
import { 
  MousePointer2, 
  Hand, 
  Pen, 
  Square, 
  Circle, 
  ArrowUpRight, 
  Type, 
  Eraser, 
  Sparkles 
} from 'lucide-react';
import { useAppStore, Tool } from '@/store/app-store';

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

  return (
    <div 
      className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-2 glass z-50 animate-slide-up"
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => handleToolSelect(tool.id)}
          className="relative group w-10 h-10 flex items-center justify-center rounded-md transition-all duration-200"
          style={{
            backgroundColor: activeTool === tool.id ? 'var(--accent-alpha)' : 'transparent',
            color: activeTool === tool.id ? 'var(--accent)' : 'var(--text-secondary)',
            boxShadow: activeTool === tool.id ? '0 0 10px var(--accent-alpha)' : 'none',
          }}
        >
          <tool.icon size={20} />
          
          {/* Tooltip */}
          <div 
            className="absolute left-full ml-3 px-2 py-1 text-xs whitespace-nowrap rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 glass"
            style={{ 
              backgroundColor: 'var(--surface-elevated)', 
              color: 'var(--text-primary)',
              border: '1px solid var(--border)' 
            }}
          >
            {tool.label}
          </div>
        </button>
      ))}

      <div 
        className="w-full h-px my-1" 
        style={{ backgroundColor: 'var(--border)' }} 
      />

      <button
        onClick={toggleAiPanel}
        className="relative group w-10 h-10 flex items-center justify-center rounded-md transition-all duration-300 overflow-hidden"
        style={{
          background: aiPanelOpen ? 'var(--accent)' : 'transparent',
          color: aiPanelOpen ? 'white' : 'var(--text-secondary)',
          boxShadow: aiPanelOpen ? '0 0 15px var(--accent)' : 'none',
        }}
      >
        {!aiPanelOpen && (
          <div className="absolute inset-0 opacity-20 hover:opacity-100 transition-opacity bg-gradient-to-tr from-purple-500 to-blue-500 animate-pulse-glow" />
        )}
        <Sparkles size={20} className="relative z-10" />
        
        {/* Tooltip */}
        <div 
          className="absolute left-full ml-3 px-2 py-1 text-xs whitespace-nowrap rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 glass"
          style={{ 
            backgroundColor: 'var(--surface-elevated)', 
            color: 'var(--text-primary)',
            border: '1px solid var(--border)' 
          }}
        >
          AI Copilot
        </div>
      </button>
    </div>
  );
}
