import * as WebSocket from 'ws';

type EventCallback = (data?: any) => void

export class FakeSocket {
  _sent: any[] = [];
  _hooks: Record<string, EventCallback> = {};
  _terminateCount = 0;

  send(data: any) {
    this._sent.push(data);
  }
  on(eventType: string, cb: EventCallback) {
    this._hooks[eventType] = cb;
  }
  terminate() {
    this._terminateCount++;
  }

  _trigger(eventType: string, data?: string) {
    const cb = this._hooks[eventType];
    if (cb) {
      cb(data);
    }
  }
  _cast() {
    return this as any as WebSocket;
  }
}
