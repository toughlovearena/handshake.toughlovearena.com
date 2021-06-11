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
      onLeave: () => this.onCommLeave({
        clientId: args.clientId,
        group,
      }),
    });
  }
  private onCommLeave(args: {
    clientId: string,
    group: Group<T>,
  }) {
    args.group.unregister(args.clientId);
    if (args.group.isEmpty()) {
      delete this.lookup[args.group.signalId];
    }
  }

  health() {
    return Object.values(this.lookup).map(group => group.health());
  }
}
