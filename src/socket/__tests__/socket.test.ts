import { Organizer } from '../../group';
import { HandshakeData } from '../../types';
import { SocketContainer } from '../socket';
import { FakeSocket } from './__mocks__/fakeSocket';

describe('socket', () => {
  let organizer: Organizer<HandshakeData>;
  let ws: FakeSocket;
  let cleanupCount = 0;
  let sut: SocketContainer;

  function sendMessage(msg: HandshakeData) {
    ws._trigger('message', JSON.stringify(msg));
  }
  const groupId = 's1';
  const registerData: HandshakeData = {
    type: 'register',
    message: groupId,
  };
  const signalData1: HandshakeData = {
    type: 'signal',
    message: 'data1',
  };
  const signalData2: HandshakeData = {
    type: 'signal',
    message: 'data2',
  };
  const signalData3: HandshakeData = {
    type: 'signal',
    message: 'data3',
  };
  function getGroupSnapshot() {
    return organizer.health().filter(g => g.signalId === groupId)[0];
  }

  beforeEach(() => {
    organizer = new Organizer<HandshakeData>();
    ws = new FakeSocket();
    cleanupCount = 0;
    sut = new SocketContainer({
      clientId: 'c1',
      socket: ws._cast(),
      organizer,
      onCleanup: () => cleanupCount++,
    });
  });

  test('invalid data causes error', () => {
    expect(() => ws._trigger('message', JSON.stringify({ type: 'register', message: 'hello' }))).not.toThrow();
    expect(() => ws._trigger('message', '')).toThrow();
    expect(() => ws._trigger('message', JSON.stringify({ type: 'badtype', message: 'hello' }))).toThrow();
  });

  test('register twice caused error', () => {
    expect(sut.health().group).toBeUndefined();
    sendMessage(registerData);
    expect(sut.health().group).toBe(groupId);
    expect(() => sendMessage(registerData)).toThrow();
  });

  test('register allows receiving signals', () => {
    expect(getGroupSnapshot()).toBeUndefined();
    sendMessage(registerData);
    expect(getGroupSnapshot()).toBeTruthy();
    expect(getGroupSnapshot().history).toStrictEqual([]);
    sendMessage(signalData1);
    expect(getGroupSnapshot().history).toStrictEqual([signalData1]);
    sendMessage(signalData2);
    expect(getGroupSnapshot().history).toStrictEqual([signalData1, signalData2]);
  });

  test('signals sent before register are queued up', () => {
    sendMessage(signalData1);
    sendMessage(signalData2);
    expect(getGroupSnapshot()).toBeUndefined();
    sendMessage(registerData);
    expect(getGroupSnapshot()).toBeTruthy();
    expect(getGroupSnapshot().history).toStrictEqual([signalData1, signalData2]);
    sendMessage(signalData3);
    expect(getGroupSnapshot().history).toStrictEqual([signalData1, signalData2, signalData3]);
  });
});
