'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Link as LinkIcon, Sun, Moon, Download, Check, FileCode, Upload, Eye, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Editor, createShapeId, TLShapeId } from 'tldraw';
import { parseAndCompileMermaid } from '@/lib/mermaid-compiler';

interface TopBarProps {
  editor?: Editor | null;
}

export function TopBar({ editor }: TopBarProps) {
  const { theme, toggleTheme, connectedUsers, followingUserId, setFollowingUserId } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [mermaidCode, setMermaidCode] = useState('');
  const [importCode, setImportCode] = useState('graph TD\n    A[Web App] --> B(API Gateway)\n    B --> C[(Postgres DB)]');
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

    setActiveTab('export');
    setShowExportModal(true);
  };

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopiedMermaid(true);
    setTimeout(() => setCopiedMermaid(false), 2000);
  };

  const handleExportSvg = async () => {
    if (!editor) return;
    const shapeIds = Array.from(editor.getCurrentPageShapeIds());
    if (shapeIds.length === 0) return;
    try {
      const svgRes = await editor.getSvgElement(shapeIds);
      if (svgRes?.svg) {
        const svgString = new XMLSerializer().serializeToString(svgRes.svg);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'synapseboard-architecture.svg';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to export SVG:', err);
    }
  };

  const handleExportPng = async () => {
    if (!editor) return;
    const shapeIds = Array.from(editor.getCurrentPageShapeIds());
    if (shapeIds.length === 0) return;
    try {
      const svgRes = await editor.getSvgElement(shapeIds);
      if (svgRes?.svg) {
        const svgString = new XMLSerializer().serializeToString(svgRes.svg);
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 1200;
          canvas.height = img.height || 800;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#09090b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = 'synapseboard-architecture.png';
            a.click();
          }
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }
    } catch (err) {
      console.error('Failed to export PNG:', err);
    }
  };

  const handleCompileMermaidToCanvas = () => {
    if (!editor || !importCode.trim()) return;

    const center = editor.getViewportPageBounds().center;
    const { shapes } = parseAndCompileMermaid(importCode, center);

    if (shapes.length > 0) {
      editor.createShapes(shapes as unknown as Parameters<typeof editor.createShapes>[0]);
    }
    setShowExportModal(false);
  };

  const handleToggleFollowUser = (userId: string) => {
    if (followingUserId === userId) {
      setFollowingUserId(null);
    } else {
      setFollowingUserId(userId);
    }
  };

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-full h-14 flex items-center justify-between px-4 glass z-50"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* LEFT: Logo & Room Name */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-md">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500 hidden sm:block">
              SynapseBoard
            </span>
          </Link>
          
          <div 
            className="h-4 w-px hidden md:block" 
            style={{ backgroundColor: 'var(--border)' }} 
          />
          
          <input 
            type="text" 
            defaultValue="Architecture Whiteboard"
            className="bg-transparent border-none outline-none font-medium hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded transition-colors text-sm md:text-base hidden md:block"
            style={{ color: 'var(--text-primary)' }}
          />

          {followingUserId && (
            <button 
              onClick={() => setFollowingUserId(null)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center gap-1.5 animate-pulse hover:bg-purple-500/30 transition-colors"
            >
              <Eye size={12} /> Following Teammate (Click to stop)
            </button>
          )}
        </div>

        {/* CENTER: Empty */}
        <div className="flex-1" />

        {/* RIGHT: Users & Actions */}
        <div className="flex items-center gap-3">
          {/* Connected Users */}
          <div className="flex items-center -space-x-2">
            {displayUsers.map((user) => (
              <button 
                key={user.id}
                onClick={() => handleToggleFollowUser(user.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 transition-transform hover:scale-110 shadow-sm ${
                  followingUserId === user.id ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-110' : 'border-white dark:border-gray-900'
                }`}
                style={{ backgroundColor: user.color || 'var(--accent)' }}
                title={`Click to follow ${user.name}`}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
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
          
          {/* Export / Import Button */}
          <button 
            onClick={handleOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90 transition-opacity shadow-sm"
          >
            <Download size={14} />
            Export / Import
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

      {/* Export & Import Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
          <div 
            className="w-full max-w-xl p-6 glass rounded-2xl border shadow-2xl flex flex-col gap-4 animate-fade-in-scale"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <FileCode size={20} className="text-purple-400" />
                <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Architecture Import & Export Hub</h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Tab Switching */}
            <div className="flex items-center gap-2 p-1 rounded-lg bg-black/20 border border-white/5">
              <button
                onClick={() => setActiveTab('export')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'export' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Download size={14} /> Export Mermaid & Images
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'import' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Upload size={14} /> Import & Compile Mermaid
              </button>
            </div>

            {activeTab === 'export' ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-gray-400">
                  Export your active canvas architecture into PNG/SVG image files or standard Mermaid.js markdown syntax.
                </p>
                <pre className="p-4 rounded-lg bg-black/40 text-green-400 font-mono text-xs overflow-x-auto border border-white/10 max-h-48">
                  {mermaidCode}
                </pre>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportPng}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 text-white flex items-center gap-1.5"
                    >
                      <ImageIcon size={14} /> Export PNG
                    </button>
                    <button
                      onClick={handleExportSvg}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 text-white flex items-center gap-1.5"
                    >
                      <Download size={14} /> Export SVG
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowExportModal(false)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border hover:bg-white/5"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                    >
                      Close
                    </button>
                    <button 
                      onClick={handleCopyMermaid}
                      className="px-4 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center gap-1.5 hover:opacity-90"
                    >
                      {copiedMermaid ? <Check size={14} /> : <FileCode size={14} />}
                      {copiedMermaid ? 'Copied Code!' : 'Copy Mermaid Code'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-gray-400">
                  Paste any Mermaid markdown syntax below to compile it into interactive, movable tldraw shapes.
                </p>
                <textarea
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  rows={6}
                  className="w-full p-4 rounded-lg bg-black/40 text-purple-300 font-mono text-xs outline-none border border-white/10 focus:border-purple-500 transition-colors"
                />
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button 
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 text-xs font-medium rounded-lg border hover:bg-white/5"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCompileMermaidToCanvas}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center gap-1.5 hover:opacity-90"
                  >
                    <Sparkles size={14} /> Compile to Canvas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
