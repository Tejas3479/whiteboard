import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// In-memory persistent store (backed by Supabase or DB env when available)
const roomsStore = new Map<string, { id: string; name: string; isPublic: boolean; createdAt: string; updatedAt: string }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body?.name || 'Untitled Architecture Board';
    const isPublic = body?.isPublic ?? true;

    const roomId = nanoid(10);
    const room = {
      id: roomId,
      name,
      isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    roomsStore.set(roomId, room);

    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const shareUrl = `${origin}/board/${roomId}`;

    return NextResponse.json({
      success: true,
      roomId,
      shareUrl,
      room,
    });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}

export async function GET() {
  const rooms = Array.from(roomsStore.values());
  return NextResponse.json({ rooms });
}
