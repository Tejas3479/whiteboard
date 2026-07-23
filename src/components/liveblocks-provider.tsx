'use client';

import React, { ReactNode } from 'react';
import {
  LiveblocksProvider as LiveblocksProviderBase,
  RoomProvider,
  ClientSideSuspense,
} from '@liveblocks/react';
import { LoadingSpinner } from './loading-spinner';

interface LiveblocksProviderProps {
  roomId: string;
  children: ReactNode;
}

const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || 'pk_dev_placeholder_key';

export function LiveblocksProvider({ roomId, children }: LiveblocksProviderProps) {
  return (
    <LiveblocksProviderBase publicApiKey={publicApiKey}>
      <RoomProvider id={roomId} initialPresence={{ cursor: null, name: 'Anonymous' }}>
        <ClientSideSuspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="lg" text="Connecting to room..." />
            </div>
          </div>
        }>
          {() => children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProviderBase>
  );
}
