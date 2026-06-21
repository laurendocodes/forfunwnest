import { WebSocketGateway } from '@nestjs/websockets';
import { SyncService } from './sync.service';

@WebSocketGateway()
export class SyncGateway {
  constructor(private readonly syncService: SyncService) {}
}
