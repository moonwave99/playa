import { History } from "./history";

describe("History - constructor", () => {
  it("initializes a new History", () => {
    const history = new History();
    expect(history.getState()).toMatchObject({
      currentEntry: null,
      backEntries: [],
      forwardEntries: [],
      canGoBack: false,
      canGoForward: false,
    });
  });
});

describe("History - onChange", () => {
  it("does nothing is no handle has been set", () => {
    const onChange = vi.fn();
    const history = new History();
    history.push({
      title: "New Page",
      href: "/path/to/page",
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("sets the event handler for when the history changes", () => {
    const onChange = vi.fn();
    const history = new History();
    history.onChange(onChange);
    const page = {
      title: "New Page",
      href: "/path/to/page",
    };
    history.push(page);
    expect(onChange).toHaveBeenCalledWith({
      currentEntry: page,
      backEntries: [],
      forwardEntries: [],
      canGoBack: false,
      canGoForward: false,
    });
  });
});

describe("History - push", () => {
  it("adds a new entry to the history", () => {
    const onChange = vi.fn();
    const history = new History();
    history.onChange(onChange);

    const page = {
      title: "New Page",
      href: "/path/to/page",
    };

    const anotherPage = {
      title: "Another Page",
      href: "/path/to/another-page",
    };

    history.push(page);
    expect(onChange).toHaveBeenCalledWith({
      currentEntry: page,
      backEntries: [],
      forwardEntries: [],
      canGoBack: false,
      canGoForward: false,
    });

    expect(history.getState()).toMatchObject({
      currentEntry: page,
    });

    history.push(anotherPage);
    expect(history.getState()).toEqual({
      currentEntry: anotherPage,
      backEntries: [page],
      forwardEntries: [],
      canGoBack: true,
      canGoForward: false,
    });
  });
});

describe("History - goBack", () => {
  it("does nothing if there is no previous history", () => {
    const onChange = vi.fn();
    const history = new History();
    history.onChange(onChange);

    const page = {
      title: "New Page",
      href: "/path/to/page",
    };

    history.push(page);
    expect(history.getState()).toMatchObject({
      currentEntry: page,
    });

    history.goBack();
    expect(history.getState()).toMatchObject({
      currentEntry: page,
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("goes back one step if there is previous history", () => {
    const onChange = vi.fn();
    const history = new History();
    history.onChange(onChange);

    const firstPage = {
      title: "First Page",
      href: "/path/to/first-page",
    };

    const secondPage = {
      title: "Second Page",
      href: "/path/to/second-page",
    };

    const thirdPage = {
      title: "Third Page",
      href: "/path/to/third-page",
    };

    history.push(firstPage);
    expect(history.getState()).toMatchObject({ currentEntry: firstPage });
    history.push(secondPage);
    expect(history.getState()).toMatchObject({ currentEntry: secondPage });
    history.push(thirdPage);
    expect(history.getState()).toMatchObject({ currentEntry: thirdPage });
    history.goBack();
    expect(history.getState()).toEqual({
      currentEntry: secondPage,
      backEntries: [firstPage],
      forwardEntries: [thirdPage],
      canGoBack: true,
      canGoForward: true,
    });

    expect(onChange).toHaveBeenCalledTimes(4);
  });
});

describe("History - goForward", () => {
  it("does nothing if there is no future history", () => {
    const onChange = vi.fn();
    const history = new History();
    history.onChange(onChange);

    const page = {
      title: "New Page",
      href: "/path/to/page",
    };

    history.push(page);
    expect(history.getState()).toMatchObject({ currentEntry: page });

    history.goForward();
    expect(history.getState()).toMatchObject({ currentEntry: page });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("goes forward one step if there is future history", () => {
    const onChange = vi.fn();
    const history = new History();
    history.onChange(onChange);

    const firstPage = {
      title: "First Page",
      href: "/path/to/first-page",
    };

    const secondPage = {
      title: "Second Page",
      href: "/path/to/second-page",
    };

    const thirdPage = {
      title: "Third Page",
      href: "/path/to/third-page",
    };

    history.push(firstPage);
    expect(history.getState()).toMatchObject({ currentEntry: firstPage });
    history.push(secondPage);
    expect(history.getState()).toMatchObject({ currentEntry: secondPage });
    history.push(thirdPage);
    expect(history.getState()).toMatchObject({ currentEntry: thirdPage });
    history.goBack();
    expect(history.getState()).toMatchObject({ currentEntry: secondPage });

    history.goForward();
    expect(history.getState()).toEqual({
      currentEntry: thirdPage,
      backEntries: [firstPage, secondPage],
      forwardEntries: [],
      canGoBack: true,
      canGoForward: false,
    });

    expect(onChange).toHaveBeenCalledTimes(5);
  });
});
