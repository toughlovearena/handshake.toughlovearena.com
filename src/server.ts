import cors from 'cors';
import WebSocketExpress, { Router } from 'websocket-express';
import { SocketManager } from './manager';
import { Registry } from './registry';
import { HandshakeData } from './types';

export class Server {
  private app = new WebSocketExpress();

  constructor(gitHash: string) {
    const router = new Router();
    const started = new Date();
    const registry = new Registry<HandshakeData>();
    const manager = new SocketManager(registry);

    router.get('/', (req, res) => {
      res.redirect('/health');
    });
    router.get('/health', (req, res) => {
      const data = {
        gitHash,
        started,
        sockets: manager.health(),
        registry: registry.health(),
      };
      res.send(data);
    });

    // ws
    router.ws('/connect', async (req, res) => {
      const ws = await res.accept();
      manager.create(ws);
    });

    this.app.use(cors());
    this.app.use(WebSocketExpress.json());
    this.app.use(router);
  }

  listen(port: number) {
    this.app.createServer().listen(port, () => {
      // tslint:disable-next-line:no-console
      console.log(`server started at http://localhost:${port}`);
    });
  }
}
