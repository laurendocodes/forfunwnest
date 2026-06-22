import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExternalMusicApiService } from './external-music-api.service';

@Injectable()
export class TracksService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly musicApiService: ExternalMusicApiService // Fictional third-party wrapper API
  ) {}

  async getAllSong(searchQuery?: string) {
    if (!searchQuery) {
      return await this.prismaService.track.findMany({ take: 20 }); // Limit fallback entries
    }

    // 1. Look up inside your local PostgreSQL cache first
    const localTracks = await this.prismaService.track.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { artistName: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
    });

    // 2. If found locally, return them instantly to save network overhead
    if (localTracks.length > 0) {
      return localTracks;
    }

    // 3. Cache Miss: Fetch live data from external API (Spotify/YouTube metadata API)
    const externalTracks = await this.musicApiService.searchAndGetTrack(searchQuery);

    // 4. Save those results to your database asynchronously so they exist next time
    const savedTracks = await Promise.all(
      externalTracks.map((track) =>
        this.prismaService.track.upsert({
          where: { youtubeId: track.id }, // Use the third-party unique identifier matching your platform structure
          update: {},
          create: {
            youtubeId: track.id,
            title: track.title,
            artistName: track.artist,
            durationMs: track.durationMs,
            audioUrl: track.streamUrl, // Direct streaming pipeline provider link
            coverUrl: track.albumArtUrl,
          },
        })
      )
    );

    return savedTracks;
  }

 async getTrackStream(id: string) {
    let track;

    // 1. Try to find the track in our local DB first
    // We check both the auto-increment Int ID (if it's a number) or the string youtubeId
    const isNumberId = !isNaN(Number(id));

    if (isNumberId) {
      track = await this.prismaService.track.findUnique({
        where: { id: Number(id) },
      });
    } else {
      track = await this.prismaService.track.findUnique({
        where: { youtubeId: id },
      });
    }

    // 2. CACHE MISS: If track is null, fetch it directly from YouTube using the string ID
    if (!track) {
      try {
        // We call a single video detail extractor from our YouTube service
        const externalTrack = await this.musicApiService.getTrackDetailsByYoutubeId(id);
        
        // Save it to PostgreSQL so it's cached for next time
        track = await this.prismaService.track.create({
          data: {
            youtubeId: externalTrack.id,
            title: externalTrack.title,
            artistName: externalTrack.artist,
            durationMs: externalTrack.durationMs,
            audioUrl: externalTrack.streamUrl,
            coverUrl: externalTrack.albumArtUrl,
          },
        });
      } catch (error) {
        throw new NotFoundException(`Track with YouTube ID "${id}" could not be resolved.`);
      }
    }

    // 3. Return the stream URL information back to the controller
    return {
      trackId: track.id,
      youtubeId: track.youtubeId,
      title: track.title,
      streamUrl: track.audioUrl,
    };}
    

    
}