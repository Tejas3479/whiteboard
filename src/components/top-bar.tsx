'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Link as LinkIcon, Sun, Moon, Download, Check, FileCode } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

import { Editor } from 'tldraw';

interface TopBarProps {
  editor?: Editor | null;
}

export function TopBar({ editor }: TopBarProps) {
  const { theme, toggleTheme, connectedUsers } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [mermaidCode, setMermaidCode] = useState('');
  const [copiedMermaid, setCopiedMermaid] = useState(false);

  // Dummy users for demo
  const mockUsers = connectedUsers?.length > 0 ? connectedUsers : [
    { id: '1', name: 'Alice', color: '#FF5733' },
    { id: '2', name: 'Bob', color: '#33FF57' },
    { id: '3', name: 'Charlie', color: '#3357FF' },
    { id: '4', name: 'Dave', color: '#F333FF' },
  ];
  
  const displayUsers = mockUsers.slice(0, 4);
  const overflowCount = Math.max(0, mockUsers.length - 4);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenExport = async () => {
    let shapesData: Array<Record<string, unknown>> = [];
    if (editor) {
      const pageShapes = Array.from(editor.getCurrentPageShapes());
      shapesData = pageShapes.map((s) => ({
        id: s.id,
        type: s.type,
        props: s.props,
      }));
    }

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shapes: shapesData, format: 'mermaid' }),
      });
      const data = await res.json();
      setMermaidCode(data.mermaidCode || `graph TD\n    A[Client App] --> B(API Gateway)\n    B --> C[(PostgreSQL DB)]`);
    } catch {
      setMermaidCode(`graph TD\n    A[Client App] --> B(API Gateway)\n    B --> C[(PostgreSQL DB)]`);
    }

    setShowExportModal(true);
  };

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopiedMermaid(true);
    setTimeout(() => setCopiedMermaid(false), 2000);
  };

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-full h-14 flex items-center justify-between px-4 glass z-50"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* LEFT: Logo & Room Name */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-md">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              SynapseBoard
            </span>
          </Link>
          
          <div 
            className="h-4 w-px" 
            style={{ backgroundColor: 'var(--border)' }} 
          />
          
          <input 
            type="text" 
            defaultValue="Architecture Whiteboard"
            className="bg-transparent border-none outline-none font-medium hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded transition-colors"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        {/* CENTER: Empty */}
        <div className="flex-1" />

        {/* RIGHT: Users & Actions */}
        <div className="flex items-center gap-3">
          {/* Connected Users */}
          <div className="flex items-center -space-x-2">
            {displayUsers.map((user) => (
              <div 
                key={user.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-900 shadow-sm"
                style={{ backgroundColor: user.color || 'var(--accent)' }}
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {overflowCount > 0 && (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-gray-900 z-10"
                style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--text-primary)' }}
              >
                +{overflowCount}
              </div>
            )}
          </div>

          <div 
            className="h-4 w-px mx-1" 
            style={{ backgroundColor: 'var(--border)' }} 
          />

          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            {copied ? <Check size={14} className="text-green-500" /> : <LinkIcon size={14} />}
            {copied ? 'Copied!' : 'Share'}
          </button>
          
          {/* Export Code Button */}
          <button 
            onClick={handleOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90 transition-opacity shadow-sm"
          >
            <Download size={14} />
            Export Code
          </button>
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-lg p-6 glass rounded-2xl border shadow-2xl flex flex-col gap-4 animate-fade-in-scale"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode size={20} className="text-purple-400" />
                <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Export Diagram to Code</h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Export your canvas architecture directly into Mermaid.js format for Markdown, GitHub PRs, or documentation.
            </p>

            <pre className="p-4 rounded-lg bg-black/40 text-green-400 font-mono text-xs overflow-x-auto border border-white/10">
              {mermaidCode}
            </pre>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg border hover:bg-white/5"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Close
              </button>
              <button 
                onClick={handleCopyMermaid}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center gap-1.5 hover:opacity-90"
              >
                {copiedMermaid ? <Check size={14} /> : <FileCode size={14} />}
                {copiedMermaid ? 'Copied Code!' : 'Copy Mermaid Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
