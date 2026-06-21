import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialGateway } from './social.gateway';

@Module({
  providers: [SocialGateway, SocialService],
})
export class SocialModule {}
