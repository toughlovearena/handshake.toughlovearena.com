import { Organizer } from '../../group';
import { HandshakeData } from '../../types';
import { SocketManager } from '../manager';
import { FakeSocket } from './__mocks__/fakeSocket';

describe('socketManager', () => {
  test('create()', () => {
    const organizer = new Organizer<HandshakeData>();
    const sut = new SocketManager(organizer);
    expect(sut.health().clients.length).toBe(0);

    const ws = new FakeSocket();
    sut.create(ws._cast());
    expect(sut.health().clients.length).toBe(1);

    ws._trigger('close');
    expect(sut.health().clients.length).toBe(0);
  });
});
