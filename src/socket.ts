import * as WebSocket from 'ws';
import { WebsocketError } from './error';
import { Registry } from './registry';

export interface HandshakeData {
  type: 'register' | 'ready' | 'signal' | 'error';
  message: string;
}

export class SocketContainer {
  static SOCKET_ID = 0;
  private readonly socket: WebSocket;
  private readonly registry: Registry;
  private readonly socketId: string;

  // stateful
  private signalId: string | undefined;
  private pending: string[] = [];

  constructor(deps: {
    socket: WebSocket;
    registry: Registry;
  }) {
    this.socketId = (SocketContainer.SOCKET_ID++).toString();
    this.socket = deps.socket;
    this.registry = deps.registry;

    const { socket } = this;
    socket.on('message', (msg: any) => this.onMessage(msg));
    socket.on('error', () => {
      socket.send(new WebsocketError());
    });
  }

  onMessage(msg: string) {
    const data = JSON.parse(msg) as HandshakeData;
    if (data.type === 'register') {
      return this.register(data);
    }
    const { signalId, registry } = this;
    if (signalId === undefined) {
      this.pending.push(msg);
      return;
    }
    const room = registry.get(signalId);
    room.broadcast(this.socketId, data);
  }

  private register(data: HandshakeData): void {
    if (this.signalId !== undefined) {
      throw new Error('signal already registered');
    }
    this.signalId = data.message;
    this.registry.get(this.signalId).register(this.socketId, cbdata => this.socket.send(cbdata));
    this.processPending();
  }
  private processPending() {
    const toProcess = this.pending.concat();
    this.pending = [];
    toProcess.forEach(pendingMsg => this.onMessage(pendingMsg));
  }

  health() {
    return {
      socketId: this.socketId,
      signalId: this.signalId,
      pending: this.pending,
    };
  }
}
