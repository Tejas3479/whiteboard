import { create } from 'zustand';

export interface ContextLink {
  id: string;
  title: string;
  url: string;
}

export interface ContextCodeSnippet {
  id: string;
  language: string;
  code: string;
}

export interface ContextFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
}

export interface ShapeContext {
  shapeId: string;
  notes: string;
  links: ContextLink[];
  codeSnippets: ContextCodeSnippet[];
  files: ContextFile[];
}

interface ContextState {
  // Map of shapeId -> ShapeContext
  contexts: Record<string, ShapeContext>;
  
  // Selected shape context panel state
  activeShapeId: string | null;
  activeShapeLabel: string;
  isContextPanelOpen: boolean;
  
  // Actions
  openContextPanel: (shapeId: string, shapeLabel?: string) => void;
  closeContextPanel: () => void;
  getShapeContext: (shapeId: string) => ShapeContext;
  updateNotes: (shapeId: string, notes: string) => void;
  addLink: (shapeId: string, link: Omit<ContextLink, 'id'>) => void;
  removeLink: (shapeId: string, linkId: string) => void;
  addCodeSnippet: (shapeId: string, snippet: Omit<ContextCodeSnippet, 'id'>) => void;
  removeCodeSnippet: (shapeId: string, snippetId: string) => void;
  addFile: (shapeId: string, file: Omit<ContextFile, 'id'>) => void;
  removeFile: (shapeId: string, fileId: string) => void;
  hasContext: (shapeId: string) => boolean;
}

const defaultContext = (shapeId: string): ShapeContext => ({
  shapeId,
  notes: '',
  links: [],
  codeSnippets: [],
  files: [],
});

export const useContextStore = create<ContextState>((set, get) => ({
  contexts: {},
  activeShapeId: null,
  activeShapeLabel: 'Selected Component',
  isContextPanelOpen: false,

  openContextPanel: (shapeId: string, shapeLabel?: string) => {
    set({
      activeShapeId: shapeId,
      activeShapeLabel: shapeLabel || 'Selected Component',
      isContextPanelOpen: true,
    });
  },

  closeContextPanel: () => {
    set({ isContextPanelOpen: false, activeShapeId: null });
  },

  getShapeContext: (shapeId: string) => {
    return get().contexts[shapeId] || defaultContext(shapeId);
  },

  updateNotes: (shapeId: string, notes: string) => {
    set((state) => {
      const current = state.contexts[shapeId] || defaultContext(shapeId);
      return {
        contexts: {
          ...state.contexts,
          [shapeId]: { ...current, notes },
        },
      };
    });
  },

  addLink: (shapeId: string, link) => {
    set((state) => {
      const current = state.contexts[shapeId] || defaultContext(shapeId);
      const newLink: ContextLink = { ...link, id: Date.now().toString() };
      return {
        contexts: {
          ...state.contexts,
          [shapeId]: { ...current, links: [...current.links, newLink] },
        },
      };
    });
  },

  removeLink: (shapeId: string, linkId: string) => {
    set((state) => {
      const current = state.contexts[shapeId];
      if (!current) return state;
      return {
        contexts: {
          ...state.contexts,
          [shapeId]: {
            ...current,
            links: current.links.filter((l) => l.id !== linkId),
          },
        },
      };
    });
  },

  addCodeSnippet: (shapeId: string, snippet) => {
    set((state) => {
      const current = state.contexts[shapeId] || defaultContext(shapeId);
      const newSnippet: ContextCodeSnippet = { ...snippet, id: Date.now().toString() };
      return {
        contexts: {
          ...state.contexts,
          [shapeId]: { ...current, codeSnippets: [...current.codeSnippets, newSnippet] },
        },
      };
    });
  },

  removeCodeSnippet: (shapeId: string, snippetId: string) => {
    set((state) => {
      const current = state.contexts[shapeId];
      if (!current) return state;
      return {
        contexts: {
          ...state.contexts,
          [shapeId]: {
            ...current,
            codeSnippets: current.codeSnippets.filter((c) => c.id !== snippetId),
          },
        },
      };
    });
  },

  addFile: (shapeId: string, file) => {
    set((state) => {
      const current = state.contexts[shapeId] || defaultContext(shapeId);
      const newFile: ContextFile = { ...file, id: Date.now().toString() };
      return {
        contexts: {
          ...state.contexts,
          [shapeId]: { ...current, files: [...current.files, newFile] },
        },
      };
    });
  },

  removeFile: (shapeId: string, fileId: string) => {
    set((state) => {
      const current = state.contexts[shapeId];
      if (!current) return state;
      return {
        contexts: {
          ...state.contexts,
          [shapeId]: {
            ...current,
            files: current.files.filter((f) => f.id !== fileId),
          },
        },
      };
    });
  },

  hasContext: (shapeId: string) => {
    const ctx = get().contexts[shapeId];
    if (!ctx) return false;
    return (
      Boolean(ctx.notes?.trim()) ||
      ctx.links.length > 0 ||
      ctx.codeSnippets.length > 0 ||
      ctx.files.length > 0
    );
  },
}));
