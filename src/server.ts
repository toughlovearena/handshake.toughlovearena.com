import { Updater } from '@toughlovearena/updater';
import cors from 'cors';
import WebSocketExpress, { Router } from 'websocket-express';
import { Organizer } from './group';
import { SocketManager } from './socket';
import { RealClock } from './time';
import { HandshakeData } from './types';

export class Server {
  private app = new WebSocketExpress();

  constructor(updater: Updater) {
    const router = new Router();
    const manager = new SocketManager(
      version => new Organizer<HandshakeData>(version),
      RealClock,
    );

    router.get('/', (req, res) => {
      res.redirect('/health');
    });
    router.get('/health', async (req, res) => {
      const { verbose } = req.query;
      const gitHash = await updater.gitter.hash();
      const data = {
        gitHash,
        started: new Date(updater.startedAt),
        testVer: 3,
        manager: manager.health(!!verbose),
      };
      res.send(data);
    });

    // ws
    router.ws('/connect/:version', async (req, res) => {
      const { version } = req.params;
      const ws = await res.accept();
      manager.create(version, ws);
    });
    router.ws('/connect', async (req, res) => {
      const ws = await res.accept();
      manager.create('deprecated', ws);
    });

    this.app.use(cors());
    this.app.use(WebSocketExpress.json());
    this.app.use(router);

    // cron
    const period = 30 * 1000; // 30 seconds
    setInterval(() => {
      manager.checkAlive();
    }, period);
  }

  listen(port: number) {
    this.app.createServer().listen(port, () => {
      // tslint:disable-next-line:no-console
      console.log(`server started at http://localhost:${port}`);
    });
  }
}
