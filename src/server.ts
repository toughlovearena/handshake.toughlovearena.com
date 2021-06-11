import cors from 'cors';
import WebSocketExpress, { Router } from 'websocket-express';
import { Organizer } from './group';
import { SocketManager } from './manager';
import { HandshakeData } from './types';

export class Server {
  private app = new WebSocketExpress();

  constructor(gitHash: string) {
    const router = new Router();
    const started = new Date();
    const organizer = new Organizer<HandshakeData>();
    const manager = new SocketManager(organizer);

    router.get('/', (req, res) => {
      res.redirect('/health');
    });
    router.get('/health', (req, res) => {
      const data = {
        gitHash,
        started,
        sockets: manager.health(),
        organizer: organizer.health(),
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
