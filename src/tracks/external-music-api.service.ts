import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as ytSearch from 'yt-search';
import * as ytdl from '@distube/ytdl-core';


export interface ExternalTrack {
  id: string;
  title: string;
  artist: string;
  durationMs: number;
  albumArtUrl: string;
  streamUrl: string;
}

@Injectable()
export class ExternalMusicApiService {
  
  async searchAndGetTrack(query: string): Promise<ExternalTrack[]> {
    try {
      // 1. Search YouTube for videos matching the query (e.g., "Blinding Lights audio")
      // We append "audio" or "lyrics" to get high-quality track streams instead of music videos
      const searchResults = await ytSearch(`${query} audio`);
      const videos = searchResults.videos.slice(0, 5); // Take top 5 results

      if (videos.length === 0) return [];

      // 2. Loop through results and fetch their direct audio stream configurations
      const trackPromises = videos.map(async (video) => {
        return this.getAudioStreamDetails(video);
      });

      return await Promise.all(trackPromises);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch tracks from streaming provider.');
    }
  }


  private async getAudioStreamDetails(video: ytSearch.VideoSearchResult): Promise<ExternalTrack> {
    // 3. Request the direct system media URLs from YouTube
    const info = await ytdl.getInfo(video.url);

    // Filter out formats to find the highest-quality audio-only stream (M4A / WebM)
    const audioFormat = ytdl.chooseFormat(info.formats, { 
      quality: 'highestaudio', 
      filter: 'audioonly' 
    });

    return {
      id: video.videoId, // Use YouTube ID as your unique identifier
      title: video.title,
      artist: video.author.name,
      durationMs: video.duration.seconds * 1000, // Convert seconds to milliseconds for Flutter
      albumArtUrl: video.thumbnail,
      streamUrl: audioFormat.url, // This is a direct URL that Flutter's audio_player can stream instantly!
    };
  }

  async getTrackDetailsByYoutubeId(youtubeId: string): Promise<ExternalTrack> {
  const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  const info = await ytdl.getInfo(videoUrl);
  
  const audioFormat = ytdl.chooseFormat(info.formats, { 
    quality: 'highestaudio', 
    filter: 'audioonly' 
  });

  return {
    id: youtubeId,
    title: info.videoDetails.title,
    artist: info.videoDetails.author.name,
    durationMs: parseInt(info.videoDetails.lengthSeconds) * 1000,
    albumArtUrl: info.videoDetails.thumbnails[0]?.url || '',
    streamUrl: audioFormat.url,
  };}
}