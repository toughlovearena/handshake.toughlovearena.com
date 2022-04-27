import * as WebSocket from 'ws';
import { DefaultMap } from '../defaultMap';
import { Organizer } from "../group";
import { TimeKeeper } from '../time';
import { HandshakeData } from '../types';
import { SocketContainer } from "./socket";

export class SocketManager {
  private clientTick = 0;
  private readonly sockets: Record<string, SocketContainer> = {};
  constructor(
    private readonly organizerFactory: (version: string) => Organizer<HandshakeData>,
    private readonly timeKeeper: TimeKeeper,
  ) { }

  private readonly organizers = new DefaultMap<string, Organizer<HandshakeData>>();

  create(version: string, ws: WebSocket) {
    const socketContainer = new SocketContainer({
      clientId: (this.clientTick++).toString(),
      socket: ws,
      organizer: this.organizers.get(version, () => this.organizerFactory(version)),
      timeKeeper: this.timeKeeper,
      onCleanup: sc => this.onSocketCleanup(sc),
    });
    this.sockets[socketContainer.clientId] = socketContainer;
  }
  private onSocketCleanup(socket: SocketContainer) {
    delete this.sockets[socket.clientId];
  }

  checkAlive() {
    Object.values(this.sockets).forEach(socket => socket.checkAlive());
    Array.from(this.organizers.entries()).forEach(entry => {
      const [version, org] = entry;
      if (org.isEmpty()) {
        this.organizers.remove(version);
      }
    });
  }

  health(verbose?: boolean) {
    return {
      tick: this.clientTick,
      clients: Object.values(this.sockets).map(s => s.health(verbose)),
      organizers: Array.from(this.organizers.entries()).map(entry => entry[1].health(verbose)),
    };
  }
}
