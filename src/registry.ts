import { Communicator } from "./communicator";
import { Room } from "./room";

export class Registry<T> {
  private readonly lookup: Record<string, Room<T>> = {};

  getComm(signalId: string, clientId: string): Communicator<T> {
    this.lookup[signalId] = this.lookup[signalId] ?? new Room<T>(signalId);
    return new Communicator(clientId, this.lookup[signalId]);
  }
  leave(comm: Communicator<T>) {
    const room = this.lookup[comm.signalId]
    room.unregister(comm.clientId);
    if (room.isEmpty()) {
      delete this.lookup[room.signalId];
    }
  }

  health() {
    return Object.values(this.lookup).map(room => room.health());
  }
}
