import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncGateway } from './sync.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [SyncGateway, SyncService,PrismaService],
  exports: [SyncService],

})
export class SyncModule {}
