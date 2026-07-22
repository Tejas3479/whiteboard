// Supabase persistence client helper with in-memory / local fallback

export interface RoomRecord {
  id: string;
  name: string;
  is_public: boolean;
  snapshot_data?: string;
  created_at: string;
  updated_at: string;
}

// Memory / Local persistent fallback map for environments without Supabase credentials
const memoryRooms = new Map<string, RoomRecord>();

export class PersistenceService {
  private static supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  private static supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  public static async createRoom(name: string, isPublic: boolean = true): Promise<RoomRecord> {
    const roomId = Math.random().toString(36).substring(2, 12);
    const now = new Date().toISOString();
    
    const newRoom: RoomRecord = {
      id: roomId,
      name,
      is_public: isPublic,
      created_at: now,
      updated_at: now,
    };

    if (this.supabaseUrl && this.supabaseKey) {
      try {
        const res = await fetch(`${this.supabaseUrl}/rest/v1/rooms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(newRoom),
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data[0]) return data[0] as RoomRecord;
        }
      } catch (err) {
        console.warn('Supabase createRoom warning, falling back to local memory:', err);
      }
    }

    memoryRooms.set(roomId, newRoom);
    return newRoom;
  }

  public static async getRoom(id: string): Promise<RoomRecord | null> {
    if (this.supabaseUrl && this.supabaseKey) {
      try {
        const res = await fetch(`${this.supabaseUrl}/rest/v1/rooms?id=eq.${id}&select=*`, {
          method: 'GET',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data[0]) return data[0] as RoomRecord;
        }
      } catch (err) {
        console.warn('Supabase getRoom warning, falling back to local memory:', err);
      }
    }

    return memoryRooms.get(id) || {
      id,
      name: `Architecture Room ${id.substring(0, 4)}`,
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  public static async updateRoomSnapshot(id: string, snapshotData: string): Promise<boolean> {
    const now = new Date().toISOString();

    if (this.supabaseUrl && this.supabaseKey) {
      try {
        const res = await fetch(`${this.supabaseUrl}/rest/v1/rooms?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
          },
          body: JSON.stringify({
            snapshot_data: snapshotData,
            updated_at: now,
          }),
        });

        if (res.ok) return true;
      } catch (err) {
        console.warn('Supabase snapshot update warning:', err);
      }
    }

    const existing = memoryRooms.get(id);
    if (existing) {
      existing.snapshot_data = snapshotData;
      existing.updated_at = now;
      memoryRooms.set(id, existing);
    }
    return true;
  }

  public static async deleteRoom(id: string): Promise<boolean> {
    if (this.supabaseUrl && this.supabaseKey) {
      try {
        const res = await fetch(`${this.supabaseUrl}/rest/v1/rooms?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
          },
        });

        if (res.ok) return true;
      } catch (err) {
        console.warn('Supabase deleteRoom warning:', err);
      }
    }

    memoryRooms.delete(id);
    return true;
  }
}
