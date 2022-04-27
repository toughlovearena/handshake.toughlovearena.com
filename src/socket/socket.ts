import * as WebSocket from 'ws';
import { Communicator, Organizer } from '../group';
import { TimeKeeper } from '../time';
import { HandshakeData } from '../types';

export type CleanupSocket = (sc: SocketContainer) => void;

export class SocketContainer {
  readonly clientId: string;
  private readonly socket: WebSocket;
  private readonly registry: Organizer<HandshakeData>;
  private readonly timeKeeper: TimeKeeper;
  private readonly createdAt: number;
  private updatedAt: number;
  private readonly onCleanup: CleanupSocket;
  static readonly TTL = 10 * 60 * 1000; // 10 minutes

  // stateful
  private comm: Communicator<HandshakeData>;
  private pending: string[] = [];

  constructor(deps: {
    clientId: string;
    socket: WebSocket;
    organizer: Organizer<HandshakeData>;
    timeKeeper: TimeKeeper;
    onCleanup: CleanupSocket;
  }) {
    this.clientId = deps.clientId;
    this.socket = deps.socket;
    this.registry = deps.organizer;
    this.timeKeeper = deps.timeKeeper;
    this.onCleanup = deps.onCleanup;

    // track times created, used
    this.createdAt = this.timeKeeper.now();
    this.updatedAt = this.createdAt;

    const { socket } = this;
    socket.on('message', (msg: any) => this.receive(msg));
    socket.on('error', () => this.cleanup());
    socket.on('close', () => this.cleanup());
  }

  checkAlive() {
    const now = this.timeKeeper.now();
    const diff = now - this.updatedAt;
    if (diff > SocketContainer.TTL) {
      this.cleanup();
    }
  }

  private send(data: HandshakeData) {
    this.updatedAt = this.timeKeeper.now();
    this.socket.send(JSON.stringify(data));
  }
  private receive(msg: string) {
    this.updatedAt = this.timeKeeper.now();
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
      this.comm.leave();
    }
    this.socket.terminate();
    this.onCleanup(this);
  }
  private register(data: HandshakeData): void {
    if (this.comm !== undefined) {
      throw new Error('signal already registered');
    }
    const signalId = data.message;
    this.comm = this.registry.join({
      signalId,
      clientId: this.clientId,
      cb: cbdata => this.send(cbdata),
    });
    this.processPending();
  }
  private processPending() {
    const toProcess = this.pending.concat();
    this.pending = [];
    toProcess.forEach(pendingMsg => this.receive(pendingMsg));
  }

  health(verbose?: boolean) {
    return {
      clientId: this.clientId,
      version: this.registry.version,
      group: this.comm?.signalId,
      ageInSeconds: Math.ceil((this.timeKeeper.now() - this.updatedAt) / 1000),
      pending: verbose ? this.pending : this.pending.length,
    };
  }
}
