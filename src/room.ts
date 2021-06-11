type SignalCallback<T> = (data: T) => void;

export class Room<T> {
  readonly signalId: string;
  private readonly history: T[] = [];
  private readonly clients: Record<string, SignalCallback<T>> = {};
  constructor(signalId: string) {
    this.signalId = signalId;
  }

  register(clientId: string, cb: SignalCallback<T>) {
    this.clients[clientId] = cb;
    this.history.forEach(data => cb(data));
  }
  unregister(clientId: string) {
    delete this.clients[clientId];
  }
  isEmpty() {
    return Object.keys(this.clients).length === 0;
  }

  broadcast(clientId: string, data: T) {
    this.history.push(data);
    Object.keys(this.clients).forEach(key => {
      if (key === clientId) { return; }
      const cb = this.clients[key];
      cb(data);
    });
  }

  health() {
    return {
      signalId: this.signalId,
      history: this.history,
      clients: Object.keys(this.clients),
    };
  }
}
