export type HistoryState = {
  currentEntry: HistoryEntry;
  backEntries: HistoryEntry[];
  forwardEntries: HistoryEntry[];
  canGoBack: boolean;
  canGoForward: boolean;
  direction: HistoryDirection;
};

export type HistoryDirection = -1 | 0 | 1;

export type HistoryEntry = {
  title: string;
  href: string;
};

export type HistoryHandler = (params: HistoryState) => void;

export class History {
  private history: HistoryEntry[];
  private index: number;
  private handler: HistoryHandler;
  private direction: HistoryDirection;
  constructor() {
    this.history = [];
    this.index = -1;
    this.direction = 0;
  }
  getState() {
    return {
      currentEntry: this.getCurrentEntry(),
      backEntries: this.getBackEntries(),
      forwardEntries: this.getForwardEntries(),
      canGoBack: this.canGoBack(),
      canGoForward: this.canGoForward(),
      direction: this.direction,
    };
  }
  push(entry: HistoryEntry) {
    this.history = [...this.history.slice(0, this.index + 1), entry];
    this.index = this.history.length - 1;
    this.direction = 0;
    this.onUpdate();
  }
  goBack() {
    if (!this.canGoBack()) {
      return;
    }
    this.index--;
    this.direction = -1;
    this.onUpdate();
  }
  goForward() {
    if (!this.canGoForward()) {
      return;
    }
    this.index++;
    this.direction = 1;
    this.onUpdate();
  }
  onChange(handler: HistoryHandler) {
    this.handler = handler;
  }
  private getCurrentEntry() {
    return this.history[this.index] || null;
  }
  private getBackEntries() {
    return [...this.history].slice(0, this.index);
  }
  private getForwardEntries() {
    return [...this.history].slice(this.index + 1);
  }
  canGoBack() {
    return this.index > 0;
  }
  canGoForward() {
    return this.index < this.history.length - 1;
  }
  private onUpdate() {
    if (!this.handler) {
      return;
    }
    this.handler(this.getState());
  }
}
