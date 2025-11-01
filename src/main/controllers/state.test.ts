import { clearPrisma } from "@/test/prisma-utils";
import { stateController } from "./state";
import { StateManager } from "../stateManager";
import { History } from "../history";

afterEach(clearPrisma);

const defaultParams = {
  send: vi.fn(),
  stateManager: new StateManager(),
  history: new History(),
};

describe("stateController - setInputFocused function", () => {
  it("sets the input focus status", async () => {
    const stateManager = new StateManager();
    const { setInputFocused } = stateController({
      ...defaultParams,
      stateManager,
    });
    expect(stateManager.isInputFocused()).toBe(false);
    setInputFocused(true);
    expect(stateManager.isInputFocused()).toBe(true);
    setInputFocused(false);
    expect(stateManager.isInputFocused()).toBe(false);
  });
});

describe("stateController - setOnboarding function", () => {
  it("sets the onboarding status", async () => {
    const stateManager = new StateManager();
    const { setOnboarding } = stateController({
      ...defaultParams,
      stateManager,
    });
    expect(stateManager.isOnboarding()).toBe(false);
    setOnboarding(true);
    expect(stateManager.isOnboarding()).toBe(true);
    setOnboarding(false);
    expect(stateManager.isOnboarding()).toBe(false);
  });
});

describe("stateController - setNavOpen function", () => {
  it("sets the nav open status", async () => {
    const stateManager = new StateManager();
    const { setNavOpen } = stateController({
      ...defaultParams,
      stateManager,
    });
    expect(stateManager.isNavOpen()).toBe(false);
    setNavOpen(true);
    expect(stateManager.isNavOpen()).toBe(true);
    setNavOpen(false);
    expect(stateManager.isNavOpen()).toBe(false);
  });
});

describe("stateController - setModalOpen function", () => {
  it("sets the modal status", async () => {
    const stateManager = new StateManager();
    const { setModalOpen } = stateController({
      ...defaultParams,
      stateManager,
    });
    expect(stateManager.isModalOpen()).toBe(false);
    setModalOpen(true);
    expect(stateManager.isModalOpen()).toBe(true);
    setModalOpen(false);
    expect(stateManager.isModalOpen()).toBe(false);
  });
});

describe("stateController - setSelection function", () => {
  it("sets the current release selection", async () => {
    const stateManager = new StateManager();
    const { setSelection } = stateController({
      ...defaultParams,
      stateManager,
    });
    expect(stateManager.getSelection("artist")).toEqual([]);
    setSelection("artist", [1, 2]);
    expect(stateManager.getSelection("artist")).toEqual([1, 2]);
  });
});

describe("stateController - navigate function", () => {
  it("sets the current path", async () => {
    const stateManager = new StateManager();
    const history = new History();
    const { navigate } = stateController({
      ...defaultParams,
      stateManager,
      history,
    });
    history.onChange((historyState) =>
      stateManager.setPath(historyState.currentEntry.href)
    );
    expect(stateManager.getState().path).toBe("");
    navigate({
      title: "Homepage",
      href: "/homepage",
    });
    expect(stateManager.getState().path).toBe("/homepage");
  });
});

describe("stateController - goBack function", () => {
  it("goes back in the history", async () => {
    const stateManager = new StateManager();
    const history = new History();
    const { goBack } = stateController({
      ...defaultParams,
      stateManager,
      history,
    });
    history.onChange((historyState) =>
      stateManager.setPath(historyState.currentEntry.href)
    );

    history.push({
      title: "First Page",
      href: "/path/to/first-page",
    });
    history.push({
      title: "Second Page",
      href: "/path/to/second-page",
    });

    expect(stateManager.get("path")).toBe("/path/to/second-page");

    goBack();

    expect(stateManager.get("path")).toBe("/path/to/first-page");
  });
});

describe("stateController - goForward function", () => {
  it("goes forward in the history", async () => {
    const stateManager = new StateManager();
    const history = new History();
    const { goBack, goForward } = stateController({
      ...defaultParams,
      stateManager,
      history,
    });
    history.onChange((historyState) =>
      stateManager.setPath(historyState.currentEntry.href)
    );

    history.push({
      title: "First Page",
      href: "/path/to/first-page",
    });
    history.push({
      title: "Second Page",
      href: "/path/to/second-page",
    });

    expect(stateManager.get("path")).toBe("/path/to/second-page");

    goBack();

    expect(stateManager.get("path")).toBe("/path/to/first-page");

    goForward();

    expect(stateManager.get("path")).toBe("/path/to/second-page");
  });
});

describe("stateController - clearSelection function", () => {
  it("dispatches a clearSelection message", async () => {
    const send = vi.fn();
    const { clearSelection } = stateController({
      ...defaultParams,
      send,
    });
    clearSelection();
    expect(send).toHaveBeenCalledWith("clearSelection");
  });
});
