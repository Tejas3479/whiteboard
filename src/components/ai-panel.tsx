'use client';

import React, { useEffect, useCallback } from 'react';
import { X, Sparkles, SendHorizontal, Check, X as XIcon, Eye } from 'lucide-react';
import { useAppStore, AISuggestion } from '@/store/app-store';
import { Editor, createShapeId, TLShapeId } from 'tldraw';

interface AiPanelProps {
  editor?: Editor | null;
}

interface StreamNode {
  id?: string;
  label?: string;
  shape?: string;
  x?: number;
  y?: number;
}

interface StreamEdge {
  id?: string;
  label?: string;
  source?: string;
  target?: string;
}

interface ParsedSuggestionData {
  nodes?: StreamNode[];
  edges?: StreamEdge[];
}

export function AiPanel({ editor }: AiPanelProps) {
  const { 
    aiPanelOpen, 
    toggleAiPanel, 
    isAiThinking, 
    setIsAiThinking, 
    aiPrompt, 
    setAiPrompt,
    aiSuggestions,
    addAiSuggestion,
    removeAiSuggestion
  } = useAppStore();

  const quickSuggestions = [
    "Auth Flow", "API Architecture", "Database Schema", "AWS Serverless", "Kubernetes Cluster", "Kafka Event Pipeline"
  ];

  const handleAcceptSuggestion = useCallback((sugg: AISuggestion) => {
    if (editor) {
      const center = editor.getViewportPageBounds().center;
      let parsedData: ParsedSuggestionData = {};

      try {
        if (sugg.code) {
          parsedData = JSON.parse(sugg.code) as ParsedSuggestionData;
        }
      } catch (err) {
        console.error('Failed to parse suggestion code:', err);
      }

      const nodes: StreamNode[] = parsedData.nodes && parsedData.nodes.length > 0 ? parsedData.nodes : [
        { id: '1', label: 'Client App', shape: 'rectangle', x: 100, y: 100 },
        { id: '2', label: 'API Gateway', shape: 'rectangle', x: 350, y: 100 },
        { id: '3', label: 'Database', shape: 'ellipse', x: 600, y: 100 },
      ];

      const shapeMap: Record<string, TLShapeId> = {};
      const newShapes: Array<Record<string, unknown>> = [];

      nodes.forEach((n, idx) => {
        const shapeId = createShapeId();
        if (n.id) {
          shapeMap[n.id] = shapeId;
        }
        shapeMap[idx.toString()] = shapeId;

        const posX = center.x - 250 + (n.x || idx * 220);
        const posY = center.y - 40 + (n.y || 0);

        newShapes.push({
          id: shapeId,
          type: 'geo',
          x: posX,
          y: posY,
          props: {
            geo: n.shape === 'ellipse' || n.shape === 'cylinder' ? 'ellipse' : 'rectangle',
            w: 160,
            h: 80,
            color: idx === 0 ? 'violet' : idx === 1 ? 'blue' : 'green',
            fill: 'semi',
            text: n.label || 'Node',
          },
        });
      });

      // Add connecting arrows
      const edges: StreamEdge[] = parsedData.edges || [
        { source: nodes[0]?.id || '0', target: nodes[1]?.id || '1' },
        { source: nodes[1]?.id || '1', target: nodes[2]?.id || '2' },
      ];

      edges.forEach((e, idx) => {
        const startX = center.x - 90 + idx * 220;
        const startY = center.y;
        newShapes.push({
          id: createShapeId(),
          type: 'arrow',
          x: startX,
          y: startY,
          props: {
            start: { x: 0, y: 0 },
            end: { x: 90, y: 0 },
          },
        });
      });

      editor.createShapes(newShapes as unknown as Parameters<typeof editor.createShapes>[0]);
    }
    removeAiSuggestion(sugg.id);
  }, [editor, removeAiSuggestion]);

  const handlePreviewGhostShapes = (sugg: AISuggestion) => {
    if (!editor) return;
    const center = editor.getViewportPageBounds().center;
    const shapeId = createShapeId();

    editor.createShapes([
      {
        id: shapeId,
        type: 'geo',
        x: center.x - 80,
        y: center.y - 40,
        props: {
          geo: 'rectangle',
          w: 180,
          h: 90,
          color: 'grey',
          fill: 'pattern',
          dash: 'dashed',
          text: `Ghost: ${sugg.title || 'Preview'}`,
        },
      },
    ] as unknown as Parameters<typeof editor.createShapes>[0]);
  };

  const handleRejectSuggestion = (suggId: string) => {
    removeAiSuggestion(suggId);
  };

  // Keyboard shortcut: Press Tab to accept top suggestion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && aiSuggestions && aiSuggestions.length > 0) {
        e.preventDefault();
        handleAcceptSuggestion(aiSuggestions[0]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiSuggestions, editor, handleAcceptSuggestion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isAiThinking) return;

    setIsAiThinking(true);
    const currentPrompt = aiPrompt;
    setAiPrompt('');

    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to stream AI response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const nodes: StreamNode[] = [];
      const edges: StreamEdge[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line) as { type: string; data: StreamNode | StreamEdge };
            if (chunk.type === 'node') {
              nodes.push(chunk.data as StreamNode);
            } else if (chunk.type === 'edge') {
              edges.push(chunk.data as StreamEdge);
            }
          } catch (err) {
            console.error('Error parsing stream chunk:', err);
          }
        }
      }

      // Add AI suggestion to store
      addAiSuggestion({
        id: Date.now().toString(),
        title: `Diagram: ${currentPrompt}`,
        description: `Generated ${nodes.length} nodes and ${edges.length} connections. Press Tab or click Accept to add to canvas.`,
        code: JSON.stringify({ nodes, edges }),
      });
    } catch (err) {
      console.error('AI streaming error:', err);
      // Fallback
      addAiSuggestion({
        id: Date.now().toString(),
        title: `Diagram: ${currentPrompt}`,
        description: `Generated architecture diagram for "${currentPrompt}". Press Tab to accept.`,
      });
    } finally {
      setIsAiThinking(false);
    }
  };

  if (!aiPanelOpen) return null;

  return (
    <div 
      className="fixed right-0 top-14 bottom-0 w-[380px] glass z-40 flex flex-col border-l shadow-2xl animate-slide-left"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded">
            <Sparkles size={16} className="text-white" />
          </div>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>AI Copilot</h2>
        </div>
        <button 
          onClick={toggleAiPanel}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-500"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Quick Suggestions */}
        {(!aiSuggestions || aiSuggestions.length === 0) && !isAiThinking && (
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((sugg, i) => (
              <button
                key={i}
                onClick={() => setAiPrompt(sugg)}
                className="px-3 py-1.5 rounded-full text-sm border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ 
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                {sugg}
              </button>
            ))}
          </div>
        )}

        {/* Suggestions List */}
        {aiSuggestions?.map((sugg: AISuggestion) => (
          <div 
            key={sugg.id} 
            className="p-3 rounded-lg border flex flex-col gap-2 animate-fade-in-scale"
            style={{ 
              borderColor: 'var(--border)', 
              backgroundColor: 'var(--surface-elevated)' 
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{sugg.title}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">Press Tab</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sugg.description}</p>
            
            <div className="flex items-center gap-2 mt-2">
              <button 
                onClick={() => handleAcceptSuggestion(sugg)}
                className="flex-1 py-1.5 flex items-center justify-center gap-1 rounded bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <Check size={14} /> Accept
              </button>
              <button 
                onClick={() => handlePreviewGhostShapes(sugg)}
                className="py-1.5 px-2 flex items-center justify-center gap-1 rounded border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                title="Preview Ghost Shapes"
              >
                <Eye size={14} /> Ghost
              </button>
              <button 
                onClick={() => handleRejectSuggestion(sugg.id)}
                className="py-1.5 px-2 flex items-center justify-center gap-1 rounded border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium transition-colors" 
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <XIcon size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Loading State */}
        {isAiThinking && (
          <div className="p-4 rounded-lg border flex flex-col gap-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-elevated)' }}>
            <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="flex items-center gap-2 mt-2 text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse">
              <Sparkles size={12} className="text-purple-500" /> Generating Ghost Shapes...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe a diagram..."
            className="w-full pl-4 pr-10 py-3 rounded-lg border bg-transparent outline-none transition-colors focus:border-purple-500"
            style={{ 
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
            disabled={isAiThinking}
          />
          <button
            type="submit"
            disabled={!aiPrompt.trim() || isAiThinking}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <SendHorizontal size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
