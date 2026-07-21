import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    return NextResponse.json({
      room: {
        id,
        name: `Architecture Room ${id.substring(0, 4)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
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
    return NextResponse.json({ success: true, deletedRoomId: id });
  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
