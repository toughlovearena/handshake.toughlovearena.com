import { Organizer } from '../organizer';
import { EmptyCallback } from './__mocks__/testHelpers';

describe('organizer', () => {
  test('join() is idempotent', () => {
    const sut = new Organizer();
    expect(sut.health().length).toBe(0);

    sut.join({
      signalId: 'a',
      clientId: 'c1',
      cb: EmptyCallback,
    });
    expect(sut.health().length).toBe(1);
    sut.join({
      signalId: 'b',
      clientId: 'c2',
      cb: EmptyCallback,
    });
    expect(sut.health().length).toBe(2);
    sut.join({
      signalId: 'a',
      clientId: 'c3',
      cb: EmptyCallback,
    });
    expect(sut.health().length).toBe(2);
  });

  test('leave() removes empty rooms', () => {
    const sut = new Organizer();
    expect(sut.health().length).toBe(0);
    const comm1 = sut.join({
      signalId: 'a',
      clientId: 'c1',
      cb: EmptyCallback,
    });
    const comm2 = sut.join({
      signalId: 'a',
      clientId: 'c2',
      cb: EmptyCallback,
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
