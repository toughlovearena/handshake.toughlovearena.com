import { Group } from "../group";
import { EmptyCallback } from './__mocks__/testHelpers';

describe('group', () => {
  test('register()', () => {
    const sut = new Group('signal');
    expect(sut.health().clients.length).toBe(0);

    sut.register('a', EmptyCallback);
    expect(sut.health().clients.length).toBe(1);

    sut.register('b', EmptyCallback);
    expect(sut.health().clients.length).toBe(2);

    // idempotent
    sut.register('b', EmptyCallback);
    expect(sut.health().clients.length).toBe(2);

    sut.unregister('a');
    expect(sut.health().clients.length).toBe(1);

    // idempotent
    sut.unregister('a');
    expect(sut.health().clients.length).toBe(1);
  });

  test('broadcast()', () => {
    const sut = new Group<string>('signal');

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
    const sut = new Group<string>('signal');

    const aInbox: string[] = [];
    sut.register('a', msg => aInbox.push(msg));
    sut.broadcast('a', 'a is lonely');

    const bInbox: string[] = [];
    sut.register('b', msg => bInbox.push(msg));

    expect(aInbox).toStrictEqual([]);
    expect(bInbox).toStrictEqual(['a is lonely']);
  });

  test('remove broadcast history on leave', () => {
    const sut = new Group<string>('signal');

    const aInbox: string[] = [];
    sut.register('a', msg => aInbox.push(msg));
    sut.broadcast('a', 'a was here');

    const bInbox: string[] = [];
    sut.register('b', msg => bInbox.push(msg));
    sut.broadcast('b', 'b came second');

    expect(sut.health(true).history).toStrictEqual([
      { clientId: 'a', message: 'a was here', },
      { clientId: 'b', message: 'b came second', },
    ]);
    sut.unregister('a');
    expect(sut.health(true).history).toStrictEqual([
      { clientId: 'b', message: 'b came second', },
    ]);
  });
});
