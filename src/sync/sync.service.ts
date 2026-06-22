import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

interface LocalSession {
  roomCode: string;
  hostId: number;
  currentTrackId: number | null;
  progressMs: number;
  isPlaying: boolean;
  guests: number[]; // Array of guest user IDs
}

@Injectable()
export class SyncService {
  // In-memory cache to handle ultra-fast playback updates without stressing PostgreSQL
  private activeSessions = new Map<string, LocalSession>();

  constructor(private readonly prismaService: PrismaService) {}

  // 1. Create a brand new synchronization room
  createRoom(hostId: number): string {
    // Generate a random uppercase 6-character room code (e.g., "JAMX92")
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newSession: LocalSession = {
      roomCode,
      hostId,
      currentTrackId: null,
      progressMs: 0,
      isPlaying: false,
      guests: [],
    };

    this.activeSessions.set(roomCode, newSession);
    return roomCode;
  }

  // 2. Add a guest user to an active room memory array
  joinRoom(roomCode: string, guestId: number): LocalSession {
    const session = this.activeSessions.get(roomCode);
    if (!session) {
      throw new NotFoundException(`Sync room ${roomCode} does not exist.`);
    }

    if (session.hostId !== guestId && !session.guests.includes(guestId)) {
      session.guests.push(guestId);
    }

    return session;
  }

  // 3. Update the playing track state (called constantly when host updates tracking positions)
  updateRoomState(roomCode: string, trackId: number, progressMs: number, isPlaying: boolean) {
    const session = this.activeSessions.get(roomCode);
    if (session) {
      session.currentTrackId = trackId;
      session.progressMs = progressMs;
      session.isPlaying = isPlaying;
    }
    return session;
  }

  // 4. Clean up room memory when host disconnects completely
  closeRoom(roomCode: string) {
    this.activeSessions.delete(roomCode);
  }
}