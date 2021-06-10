import { Room } from "./room";

export class Registry {
  private readonly lookup: Record<string, Room> = {};

  get(signalId: string): Room {
    this.lookup[signalId] = this.lookup[signalId] ?? new Room(signalId);
    return this.lookup[signalId];
  }
  leave(room: Room, clientId: string) {
    room.unregister(clientId);
    if (room.isEmpty()) {
      delete this.lookup[room.signalId];
    }
  }

  health() {
    return Object.values(this.lookup).map(room => room.health());
  }
}
