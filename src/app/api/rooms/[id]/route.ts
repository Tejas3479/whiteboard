import { NextResponse } from 'next/server';
import { PersistenceService } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = await PersistenceService.getRoom(id);

    return NextResponse.json({
      room,
      members: [
        { id: 'usr-1', name: 'Alice', role: 'owner' },
        { id: 'usr-2', name: 'Bob', role: 'editor' },
      ],
    });
  } catch (error) {
    console.error('Fetch room error:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await PersistenceService.deleteRoom(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Room not found or delete failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedRoomId: id });
  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
