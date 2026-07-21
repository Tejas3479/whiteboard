"use client";

import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css";

interface CanvasWrapperProps {
  onMount?: (editor: Editor) => void;
}

export default function CanvasWrapper({ onMount }: CanvasWrapperProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Tldraw onMount={onMount} />
    </div>
  );
}
