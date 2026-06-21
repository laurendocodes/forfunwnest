import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncGateway } from './sync.gateway';

@Module({
  providers: [SyncGateway, SyncService],
})
export class SyncModule {}
