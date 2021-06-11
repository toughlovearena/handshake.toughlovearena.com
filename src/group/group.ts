export type SignalCallback<T> = (data: T) => void;

interface HistoryRecord<T> {
  clientId: string;
  message: T;
}

export class Group<T> {
  readonly signalId: string;
  private history: HistoryRecord<T>[] = [];
  private readonly clients: Record<string, SignalCallback<T>> = {};
  constructor(signalId: string) {
    this.signalId = signalId;
  }

  register(clientId: string, cb: SignalCallback<T>) {
    this.clients[clientId] = cb;
    this.history.forEach(record => cb(record.message));
  }
  unregister(clientId: string) {
    delete this.clients[clientId];
    this.history = this.history.filter(record => record.clientId !== clientId);
  }
  isEmpty() {
    return Object.keys(this.clients).length === 0;
  }

  broadcast(clientId: string, data: T) {
    this.history.push({ clientId, message: data, });
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
