import cors from 'cors';
import WebSocketExpress, { Router } from 'websocket-express';
import { SocketManager } from './manager';
import { SocketContainer } from './socket';

export class Server {
  private app = new WebSocketExpress();

  constructor(gitHash: string) {
    const router = new Router();
    const started = new Date();
    const manager = new SocketManager();

    router.get('/', (req, res) => {
      res.redirect('/health');
    });
    router.get('/health', (req, res) => {
      const data = {
        gitHash,
        started,
      };
      res.send(data);
    });

    // ws
    router.ws('/connect', async (req, res) => {
      const ws = await res.accept();
      const sc = new SocketContainer(ws);
      manager.push(sc);
    });

    this.app.use(cors());
    this.app.use(WebSocketExpress.json());
  }

  listen(port: number) {
    this.app.createServer().listen(port, () => {
      // tslint:disable-next-line:no-console
      console.log(`server started at http://localhost:${port}`);
    });
  }
}
