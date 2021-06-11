import * as WebSocket from 'ws';
import { Organizer } from "./group/organizer";
import { SocketContainer } from "./socket";
import { HandshakeData } from './types';

export class SocketManager {
  private clientTick = 0;
  private readonly sockets: Record<string, SocketContainer> = {};
  constructor(private readonly organizer: Organizer<HandshakeData>) { }

  create(ws: WebSocket) {
    const socketContainer = new SocketContainer({
      clientId: (this.clientTick++).toString(),
      socket: ws,
      organizer: this.organizer,
      onCleanup: sc => this.onSocketCleanup(sc),
    });
    this.sockets[socketContainer.clientId] = socketContainer;
  }
  onSocketCleanup(socket: SocketContainer) {
    delete this.sockets[socket.clientId];
  }

  health() {
    return {
      tick: this.clientTick,
      clients: Object.values(this.sockets).map(s => s.health()),
    };
  }
}
