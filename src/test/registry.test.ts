import { Registry } from '../registry';

describe('registry', () => {
  test('getComm() is idempotent', () => {
    const sut = new Registry();
    expect(sut.health().length).toBe(0);

    sut.getComm('a', 'c1');
    expect(sut.health().length).toBe(1);
    sut.getComm('b', 'c2');
    expect(sut.health().length).toBe(2);
    sut.getComm('a', 'c3');
    expect(sut.health().length).toBe(2);
  });

  test('leave() removes empty rooms', () => {
    const sut = new Registry();
    expect(sut.health().length).toBe(0);
    const comm1 = sut.getComm('a', 'c1');
    const comm2 = sut.getComm('a', 'c2');
    expect(sut.health().length).toBe(1);

    comm1.register(() => { });
    comm2.register(() => { });
    expect(sut.health().length).toBe(1);
    expect(sut.health()[0].clients.length).toBe(2);

    sut.leave(comm1);
    expect(sut.health().length).toBe(1);
    expect(sut.health()[0].clients.length).toBe(1);

    sut.leave(comm2);
    expect(sut.health().length).toBe(0);
  });
});
