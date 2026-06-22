import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Request } from 'express';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { GetUser } from 'src/common/decorators/getuser.decorator';

@ApiTags('playlist')
@Controller('playlists')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  async getAllPlaylists(@GetUser() userId: number) {
    // The JwtGuard decodes your token and attaches the user data to req.user
  
    return this.playlistsService.getAllTrack(userId);
  }

  @Post()
  async createPlaylist(
@GetUser() userId: number,
    @Body() body: { name: string; isPrivate?: boolean }
  ) {

    return this.playlistsService.createPlaylist(userId, body.name, body.isPrivate);
  }

  @Get('/liked-songs')
  async getLikedSongs(@GetUser() userId: number) {

    return this.playlistsService.getLikedSongsPlaylist(userId);
  }

  @Post('/:id/tracks')
  async addSongToPlaylist(
    @Param('id') id: string, 
    @Body() body: { trackId: number }
  ) {
    // Route parameter IDs arrive as strings, so we cast them to Numbers for Prisma
    return this.playlistsService.addSongToPlaylist(Number(id), body.trackId);
  }

  @Delete('/:id/tracks/:trackId')
  async deleteSongFromPlaylist(
    @Param('id') id: string, 
    @Param('trackId') trackId: string
  ) {
    return this.playlistsService.deleteSongFromPlaylist(Number(id), Number(trackId));
  }
}