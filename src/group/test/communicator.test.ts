import { Communicator } from "../communicator";
import { Group } from "../group";

class FakeGroup<T> {
  readonly _broadcast: { clientId: string, message: T }[] = [];
  _leaveCount = 0;
  broadcast(clientId: string, msg: T) {
    this._broadcast.push({ clientId, message: msg });
  }
}

describe('communicator', () => {
  test('broadcast', () => {
    const fakeGroup = new FakeGroup<string>();
    let leaveCount = 0;
    const sut = new Communicator<string>({
      clientId: 'c1',
      group: fakeGroup as any as Group<string>,
      onLeave: () => leaveCount++,
    });

    expect(fakeGroup._broadcast).toStrictEqual([]);
    expect(leaveCount).toBe(0);

    sut.broadcast('hello1');
    expect(fakeGroup._broadcast).toStrictEqual([
      { clientId: 'c1', message: 'hello1' },
    ]);
    expect(leaveCount).toBe(0);

    sut.broadcast('hello2');
    expect(fakeGroup._broadcast).toStrictEqual([
      { clientId: 'c1', message: 'hello1' },
      { clientId: 'c1', message: 'hello2' },
    ]);
    expect(leaveCount).toBe(0);

    sut.leave();
    expect(fakeGroup._broadcast).toStrictEqual([
      { clientId: 'c1', message: 'hello1' },
      { clientId: 'c1', message: 'hello2' },
    ]);
    expect(leaveCount).toBe(1);

    sut.broadcast('hello3');
    expect(fakeGroup._broadcast).toStrictEqual([
      { clientId: 'c1', message: 'hello1' },
      { clientId: 'c1', message: 'hello2' },
    ]);
    expect(leaveCount).toBe(1);
  });
});
