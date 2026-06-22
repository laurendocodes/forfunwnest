import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { count } from 'console';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlaylistsService {
   constructor(private readonly prismaService:PrismaService ){}


   async getAllTrack(userId: number ){

   const  tracks =  this.prismaService.playlist.findMany({where:  
      {
  userId:userId ,
  isLikedSongs:false 

      },
      include:{
     _count:{
      select:{tracks:true  }
     }
      }
      
      
 })
   }

   async createPlaylist(userId:number, name:string , isPrivate: boolean = false){
      return this.prismaService.playlist.create({
         data: {
           
            name:name,
            isPrivate:isPrivate,
             userId:userId,
          
         }
      })}


   
async addSongToPlaylist(playlistId: number, trackId: number) {
     const playlist = await this.prismaService.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) throw new NotFoundException('Playlist not found');

    try {
      return await this.prismaService.playlistTrack.create({
        data: {
          playlistId,
          trackId,
        },
      });
    } catch (error) {
      // Catch Prisma P2002 unique constraint failure (prevent duplicates)
      throw new ConflictException('This song is already inside this playlist.');
    }
  }


  // 3. Get the special system "Liked Songs" playlist containing all tracked entries
  async getLikedSongsPlaylist(userId: number) {
    // Look up or auto-initialize the system collection if it doesn't exist yet
    let likedPlaylist = await this.prismaService.playlist.findFirst({
      where: {
        userId: userId,
        isLikedSongs: true,
      },
      include: {
        tracks: {
          include: {
            track: true, 
          },
        },
      },
    });

    if (!likedPlaylist) {
      likedPlaylist = await this.prismaService.playlist.create({
        data: {
          name: 'Liked Songs',
          isLikedSongs: true,
          isPrivate: true,
          userId,
        },
        include: {
          tracks: { include: { track: true } },
        },
      });
    }

     return likedPlaylist.tracks.map((pt) => pt.track);
  }
   async deleteSongFromPlaylist(playlistId: number, trackId: number) {
    try {
      return await this.prismaService.playlistTrack.delete({
        where: {
          playlistId_trackId: {
            playlistId,
            trackId,
          },
        },
      });
    } catch (error) {
      throw new NotFoundException('The track relation could not be located inside this playlist.');
    }
  }
   }

   





