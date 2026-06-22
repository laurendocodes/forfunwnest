import { Controller, Get, Param, ParseIntPipe, Query, Req, Res, UseGuards } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import ytdl from '@distube/ytdl-core';
import type{ Request, Response } from 'express';
import { spawn } from 'child_process';
import { Public } from '@prisma/client/runtime/library';
import { PublicRoute } from 'src/common/decorators/public.decorator';


@ApiTags('tracks')
@Controller('tracks')
@ApiBearerAuth()
@UseGuards(JwtGuard ) 
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}


  @ApiQuery({ name: 'search', required: false })
    @Get()
  async getAllSong(@Query('searchQuery') string ) {
    
    return this.tracksService.getAllSong();

  } 
@Get('/:id/play')
@PublicRoute()
  async playAudioStream(@Param('id') id: string, @Res() res: Response) {
    const videoUrl = `https://www.youtube.com/watch?v=${id}`;

    // 1. Set clean streaming headers for an infinite web-compatible MP3 stream
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    // 2. Spawn yt-dlp to get the absolute raw audio data (no extra container processing)
    const ytDlp = spawn('yt-dlp', [
      '-q',
      '--no-progress',
      '-f', 'bestaudio',
      '-o', '-', // Output raw audio stream bytes
      videoUrl,
    ]);

    // 3. Spawn a dedicated ffmpeg instance configured to format live-streaming MP3 chunks on the fly
    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',           // Read input from the stdin pipe (output of yt-dlp)
      '-acodec', 'libmp3lame',  // Encode to highly standard MP3 audio format
      '-ab', '128k',            // Set a stable bitrate (perfect for mobile audio players)
      '-f', 'mp3',              // Force output format to be standard streaming MP3 container layout
      '-muxdelay', '0',         // CRITICAL: Minimize delay and optimize chunks for real-time streaming
      'pipe:1',                 // Output the final clean audio data bytes to stdout
    ]);

    // 4. Connect the plumbing together
    ytDlp.stdout.pipe(ffmpeg.stdin); // Feed yt-dlp raw data directly into FFmpeg's encoder input
    ffmpeg.stdout.pipe(res);         // Pipe FFmpeg's beautiful, valid MP3 stream chunks directly to the web browser / Flutter app

    // Error logging to catch issues
    ytDlp.stderr.on('data', (data) => console.error(`yt-dlp log: ${data.toString()}`));
    ffmpeg.stderr.on('data', (data) => {
      // ffmpeg logs naturally to stderr, only look for serious errors if needed
    });

    // Cleanup processes on request close to prevent orphan memory tasks on your MacBook
    res.on('close', () => {
      ytDlp.kill();
      ffmpeg.kill();
    });
  }
    @Get(':id')
    @ApiParam({name:'id', required: true })
  async getSongDetail(@Param('id', ) id:any, @Req() req:any) {
    return this.tracksService.getTrackStream(id);

  }
    @Get(':id/stream')
    @ApiParam({name:'id', required: true })
  async getTrackStream(@Param('id', ) id:any, @Req() req:any) {
    return this.tracksService.getTrackStream(id);

  }

  //   @Get(':id/stream')
  // async getSongStreaemingUrl(@Param('id', ) id:number, @Req() req:any) {
  //   return this.tracksService.getSongStreaemingUrl(id);

  



}
