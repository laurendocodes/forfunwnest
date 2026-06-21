import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { ExternalMusicApiService } from './external-music-api.service';

@Module({
  controllers: [TracksController],
  providers: [TracksService,ExternalMusicApiService ],
})
export class TracksModule {}
