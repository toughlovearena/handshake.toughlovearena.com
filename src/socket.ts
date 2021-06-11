import * as WebSocket from 'ws';
import { Registry } from './registry';
import { Room } from './room';

interface HandshakeData {
  type: 'register' | 'ready' | 'signal' | 'error';
  message: string;
}

export type CleanupSocket = (sc: SocketContainer) => void;

export class SocketContainer {
  readonly clientId: string;
  private readonly socket: WebSocket;
  private readonly registry: Registry;
  private readonly onCleanup: CleanupSocket;

  // stateful
  private room: Room<HandshakeData>;
  private pending: string[] = [];

  constructor(deps: {
    clientId: string;
    socket: WebSocket;
    registry: Registry;
    onCleanup: CleanupSocket;
  }) {
    this.clientId = deps.clientId;
    this.socket = deps.socket;
    this.registry = deps.registry;
    this.onCleanup = deps.onCleanup;

    const { socket } = this;
    socket.on('message', (msg: any) => this.onMessage(msg));
    socket.on('error', () => this.cleanup());
    socket.on('close', () => this.cleanup());
  }

  onMessage(msg: string) {
    const data = JSON.parse(msg) as HandshakeData;
    if (data.type === 'register') {
      return this.register(data);
    }
    const { room } = this;
    if (room === undefined) {
      this.pending.push(msg);
      return;
    }
    if (data.type === 'signal') {
      room.broadcast(this.clientId, data);
      return;
    }
    throw new Error('unsupported type: ' + data.type);
  }

  private cleanup() {
    if (this.room) {
      this.registry.leave(this.room, this.clientId);
    }
    this.socket.terminate();
    this.onCleanup(this);
  }
  private register(data: HandshakeData): void {
    if (this.room !== undefined) {
      throw new Error('signal already registered');
    }
    const signalId = data.message;
    this.room = this.registry.get(signalId);
    this.room.register(this.clientId, cbdata => this.socket.send(JSON.stringify(cbdata)));
    this.processPending();
  }
  private processPending() {
    const toProcess = this.pending.concat();
    this.pending = [];
    toProcess.forEach(pendingMsg => this.onMessage(pendingMsg));
  }

  health() {
    return {
      clientId: this.clientId,
      room: this.room?.signalId,
      pending: this.pending,
    };
  }
}
