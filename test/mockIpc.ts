export const ipcEvent = {} as object;

export class IpcMock {
  handlers: { [key:string] : (...args: any[]) => unknown }; // eslint-disable-line
  send: Function;
  invoke: Function;
  constructor() {
    this.handlers = {};
    this.send = jest.fn();
    this.invoke = jest.fn(() => ({}));
  }
  on(event: string, handler: (...args: any[]) => unknown) { // eslint-disable-line
    this.handlers[event] = jest.fn(handler);
  }
  trigger(event: string, ...args: any[]) { // eslint-disable-line
    const handler = this.handlers[event];
    if (!handler) {
      return false;
    }
    handler(ipcEvent, ...args);
  }
}
