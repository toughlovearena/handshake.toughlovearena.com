import { SignalCallback } from "../../group";

export const EmptyCallback: SignalCallback<any> = () => {
  // do nothing
};

export class FakeGroup<T> {
  readonly _broadcast: { clientId: string, message: T }[] = [];
  broadcast(clientId: string, msg: T) {
    this._broadcast.push({ clientId, message: msg });
  }
}
