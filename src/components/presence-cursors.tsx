'use client';

import React, { useEffect } from 'react';
import { useOthers, useUpdateMyPresence } from '@liveblocks/react';
import { useAppStore } from '@/store/app-store';

interface UserPresence {
  cursor?: { x: number; y: number } | null;
  name?: string;
  color?: string;
}

export function PresenceCursors() {
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers((othersList) =>
    othersList.map((user) => ({
      connectionId: user.connectionId,
      presence: user.presence as unknown as UserPresence,
    }))
  );
  const currentUser = useAppStore((state) => state.currentUser);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      updateMyPresence({
        cursor: { x: e.clientX, y: e.clientY },
        name: currentUser.name,
        color: currentUser.color,
      });
    };

    const handlePointerLeave = () => {
      updateMyPresence({ cursor: null });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [updateMyPresence, currentUser]);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {others.map(({ connectionId, presence }) => {
        if (!presence?.cursor) return null;

        const x = presence.cursor.x;
        const y = presence.cursor.y;
        const color = presence.color || '#3b82f6';
        const name = presence.name || 'Collaborator';

        return (
          <div
            key={connectionId}
            className="absolute top-0 left-0 animate-fade-in-scale transition-transform duration-75 ease-out"
            style={{
              transform: `translate3d(${x}px, ${y}px, 0)`,
            }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill={color} 
              stroke="white" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="drop-shadow-md"
              style={{ transform: 'rotate(-15deg)' }}
            >
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
              <path d="M13 13l6 6" />
            </svg>
            
            <div 
              className="mt-1 px-2 py-0.5 rounded-full text-white text-[10px] font-medium shadow-sm whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
