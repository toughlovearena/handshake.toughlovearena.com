import * as WebSocket from 'ws';
import { WebsocketError } from './error';

export class SocketContainer {
  constructor(ws: WebSocket) {
    ws.on('message', (msg: any) => {
      ws.send(`echo ${msg}`);
    });
    ws.on('error', () => {
      ws.send(new WebsocketError());
    });
    ws.send('hello');
  }
}
