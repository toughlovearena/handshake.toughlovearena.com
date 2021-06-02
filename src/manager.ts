import { SocketContainer } from "./socket";

export class SocketManager {
  private sockets: SocketContainer[] = [];

  push(sc: SocketContainer) {
    this.sockets.push(sc);
  }
}
