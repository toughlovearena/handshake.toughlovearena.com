import * as WebSocket from 'ws';
import { Communicator } from './communicator';
import { Registry } from './registry';
import { HandshakeData } from './types';

export type CleanupSocket = (sc: SocketContainer) => void;

export class SocketContainer {
  readonly clientId: string;
  private readonly socket: WebSocket;
  private readonly registry: Registry<HandshakeData>;
  private readonly onCleanup: CleanupSocket;

  // stateful
  private comm: Communicator<HandshakeData>;
  private pending: string[] = [];

  constructor(deps: {
    clientId: string;
    socket: WebSocket;
    registry: Registry<HandshakeData>;
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
    const { comm } = this;
    if (comm === undefined) {
      this.pending.push(msg);
      return;
    }
    if (data.type === 'signal') {
      comm.broadcast(data);
      return;
    }
    throw new Error('unsupported type: ' + data.type);
  }

  private cleanup() {
    if (this.comm) {
      this.registry.leave(this.comm);
    }
    this.socket.terminate();
    this.onCleanup(this);
  }
  private register(data: HandshakeData): void {
    if (this.comm !== undefined) {
      throw new Error('signal already registered');
    }
    const signalId = data.message;
    this.comm = this.registry.getComm(signalId, this.clientId);
    this.comm.register(cbdata => this.socket.send(JSON.stringify(cbdata)));
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
      room: this.comm?.signalId,
      pending: this.pending,
    };
  }
}
