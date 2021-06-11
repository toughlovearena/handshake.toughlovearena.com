import { Room } from "../room";

describe('room', () => {
  test('register()', () => {
    const sut = new Room('signal');
    expect(sut.health().clients.length).toBe(0);

    sut.register('a', () => { });
    expect(sut.health().clients.length).toBe(1);

    sut.register('b', () => { });
    expect(sut.health().clients.length).toBe(2);

    sut.unregister('a');
    expect(sut.health().clients.length).toBe(1);
  });

  test('broadcast()', () => {
    const sut = new Room<string>('signal');

    const aInbox: string[] = [];
    sut.register('a', msg => aInbox.push(msg));

    const bInbox: string[] = [];
    sut.register('b', msg => bInbox.push(msg));

    sut.broadcast('b', 'b says hello');
    expect(aInbox).toStrictEqual(['b says hello']);
    expect(bInbox).toStrictEqual([]);

    sut.broadcast('a', 'a responds');
    expect(aInbox).toStrictEqual(['b says hello']);
    expect(bInbox).toStrictEqual(['a responds']);
  });

  test('cache old broadcasts', () => {
    const sut = new Room<string>('signal');

    const aInbox: string[] = [];
    sut.register('a', msg => aInbox.push(msg));
    sut.broadcast('a', 'a is lonely');

    const bInbox: string[] = [];
    sut.register('b', msg => bInbox.push(msg));

    expect(aInbox).toStrictEqual([]);
    expect(bInbox).toStrictEqual(['a is lonely']);
  });
});
