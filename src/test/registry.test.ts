import { Registry } from '../registry';

describe('registry', () => {
  test('get() is idempotent', () => {
    const sut = new Registry();
    expect(sut.health().length).toBe(0);

    sut.get('a');
    expect(sut.health().length).toBe(1);
    sut.get('b');
    expect(sut.health().length).toBe(2);
    sut.get('a');
    expect(sut.health().length).toBe(2);
  });

  test('leave() removes empty rooms', () => {
    const sut = new Registry();
    expect(sut.health().length).toBe(0);
    const room = sut.get('a');
    expect(sut.health().length).toBe(1);

    room.register('c1', () => { });
    room.register('c2', () => { });
    expect(room.health().clients.length).toBe(2);

    sut.leave(room, 'c1');
    expect(sut.health().length).toBe(1);
    expect(room.health().clients.length).toBe(1);

    sut.leave(room, 'c2');
    expect(sut.health().length).toBe(0);
    expect(room.health().clients.length).toBe(0);
  });
});
