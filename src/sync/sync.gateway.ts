import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SyncService } from 'src/sync/sync.service';


@WebSocketGateway({
  namespace: 'sync', // Flutter hooks into: ws://localhost:3000/sync
  cors: { origin: '*' },
})
export class SyncGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly syncService: SyncService) {}

  // Automatically cleans up sessions if a client socket disconnects unexpectedly
  handleDisconnect(client: Socket) {
    const roomCode = client.data.roomCode;
    if (roomCode && client.data.isHost) {
      this.syncService.closeRoom(roomCode);
      this.server.to(roomCode).emit('roomClosed', { message: 'Host has left the session.' });
    }
  }

  // EVENT 1: Flutter client initializes room creation
  @SubscribeMessage('createRoom')
  handleCreateRoom(@MessageBody() data: { hostId: number }, @ConnectedSocket() client: Socket) {
    const roomCode = this.syncService.createRoom(data.hostId);
    
    // Attach room details metadata context safely directly into Socket state
    client.data.roomCode = roomCode;
    client.data.isHost = true;
    
    client.join(roomCode); // Connect host socket to a virtual streaming room partition
    client.emit('roomCreated', { roomCode });
  }

  // EVENT 2: Guest feeds shared code to subscribe to room stream updates
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomCode: string; guestId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const session = this.syncService.joinRoom(data.roomCode, data.guestId);
      
      client.data.roomCode = data.roomCode;
      client.data.isHost = false;

      client.join(data.roomCode); // Add guest to socket channel group
      
      // Notify the host/room members that a new friend arrived
      this.server.to(data.roomCode).emit('guestJoined', { guestId: data.guestId });
      
      // Return the current room playback status array instantly back to the newly added client
      client.emit('currentAppState', session);
    } catch (error) {
client.emit('error', { message: error || '' });
    }
  }

  // EVENT 3: Bi-directional sync pulse stream (The core loop heartbeat)
  @SubscribeMessage('trackSync')
  handleTrackSync(
    @MessageBody() data: { roomCode: string; trackId: number; progressMs: number; isPlaying: boolean },
  ) {
    // 1. Refresh global parameters in our caching layer data-store map
    this.syncService.updateRoomState(data.roomCode, data.trackId, data.progressMs, data.isPlaying);

    // 2. Broadcast the refreshed timeline sequence updates to everyone else connected in the room channel
    this.server.to(data.roomCode).emit('playbackPulse', {
      trackId: data.trackId,
      progressMs: data.progressMs,
      isPlaying: data.isPlaying,
    });
  }
}