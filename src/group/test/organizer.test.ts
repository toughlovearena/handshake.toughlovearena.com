import { Organizer } from '../organizer';

describe('organizer', () => {
  const emptyCb = () => { };
  test('join() is idempotent', () => {
    const sut = new Organizer();
    expect(sut.health().length).toBe(0);

    sut.join({
      signalId: 'a',
      clientId: 'c1',
      cb: emptyCb,
    });
    expect(sut.health().length).toBe(1);
    sut.join({
      signalId: 'b',
      clientId: 'c2',
      cb: emptyCb,
    });
    expect(sut.health().length).toBe(2);
    sut.join({
      signalId: 'a',
      clientId: 'c3',
      cb: emptyCb,
    });
    expect(sut.health().length).toBe(2);
  });

  test('leave() removes empty rooms', () => {
    const sut = new Organizer();
    expect(sut.health().length).toBe(0);
    const comm1 = sut.join({
      signalId: 'a',
      clientId: 'c1',
      cb: emptyCb,
    });
    const comm2 = sut.join({
      signalId: 'a',
      clientId: 'c2',
      cb: emptyCb,
    });
    expect(sut.health().length).toBe(1);
    expect(sut.health()[0].clients.length).toBe(2);

    comm1.leave();
    expect(sut.health().length).toBe(1);
    expect(sut.health()[0].clients.length).toBe(1);

    comm2.leave();
    expect(sut.health().length).toBe(0);
  });
});
