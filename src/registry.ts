import { Room } from "./room";

export class Registry {
  private readonly lookup: Record<string, Room> = {};

  get(signalId: string): Room {
    this.lookup[signalId] = this.lookup[signalId] ?? new Room(signalId);
    return this.lookup[signalId];
  }

  health() {
    return Object.values(this.lookup).map(room => room.health());
  }
}
