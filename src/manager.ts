import * as WebSocket from 'ws';
import { Registry } from "./registry";
import { SocketContainer } from "./socket";

export class SocketManager {
  private clientTick = 0;
  private readonly registry: Registry;
  private readonly sockets: Record<string, SocketContainer> = {};
  constructor(registry: Registry) {
    this.registry = registry;
  }

  create(ws: WebSocket) {
    const socketContainer = new SocketContainer({
      clientId: (this.clientTick++).toString(),
      socket: ws,
      registry: this.registry,
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
