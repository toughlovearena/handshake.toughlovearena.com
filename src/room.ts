import { HandshakeData } from "./socket";

interface SignalCallback {
  (data: HandshakeData): void;
}

export class Room {
  private readonly signalId: string;
  private readonly history: HandshakeData[] = [];
  private readonly clients: Record<string, SignalCallback> = {};
  constructor(signalId: string) {
    this.signalId = signalId;
  }

  register(sourceId: string, cb: SignalCallback) {
    this.clients[sourceId] = cb;
    this.history.forEach(data => cb(data));
  }

  broadcast(sourceId: string, data: HandshakeData) {
    this.history.push(data);
    Object.keys(this.clients).forEach(key => {
      if (key === sourceId) { return; }
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
