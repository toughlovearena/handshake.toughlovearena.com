import { Room, SignalCallback } from "./room";

export class Communicator<T> {
  readonly signalId;
  constructor(public readonly clientId: string, private readonly room: Room<T>) {
    this.signalId = room.signalId;
  }

  register(cb: SignalCallback<T>) {
    return this.room.register(this.clientId, cb);
  }
  broadcast(msg: T) {
    return this.room.broadcast(this.clientId, msg);
  }
}
