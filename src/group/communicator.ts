import { Group } from "./group";

export class Communicator<T> {
  readonly signalId: string;
  readonly clientId: string;
  private readonly group: Group<T>;
  private readonly onLeave: () => void;
  private hasLeft = false;
  constructor(args: {
    clientId: string;
    group: Group<T>;
    onLeave: () => void;
  }) {
    this.signalId = args.group.signalId;
    this.clientId = args.clientId;
    this.group = args.group;
    this.onLeave = args.onLeave;
  }

  broadcast(msg: T) {
    if (this.hasLeft) { return; }
    return this.group.broadcast(this.clientId, msg);
  }
  leave() {
    this.hasLeft = true;
    return this.onLeave();
  }
}
