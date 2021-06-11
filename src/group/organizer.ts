import { Communicator } from "./communicator";
import { Group, SignalCallback } from "./group";

export class Organizer<T> {
  private readonly lookup: Record<string, Group<T>> = {};

  join(args: {
    signalId: string,
    clientId: string,
    cb: SignalCallback<T>,
  }): Communicator<T> {
    this.lookup[args.signalId] = this.lookup[args.signalId] ?? new Group<T>(args.signalId);
    const group = this.lookup[args.signalId];
    group.register(args.clientId, args.cb);
    return new Communicator({
      clientId: args.clientId,
      group,
      onLeave: () => this.onCommLeave(args),
    });
  }
  private onCommLeave(args: {
    signalId: string,
    clientId: string,
  }) {
    const group = this.lookup[args.signalId];
    if (group) {
      group.unregister(args.clientId);
      if (group.isEmpty()) {
        delete this.lookup[group.signalId];
      }
    }
  }

  health() {
    return Object.values(this.lookup).map(group => group.health());
  }
}
