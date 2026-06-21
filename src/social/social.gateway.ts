import { WebSocketGateway } from '@nestjs/websockets';
import { SocialService } from './social.service';

@WebSocketGateway()
export class SocialGateway {
  constructor(private readonly socialService: SocialService) {}
}
