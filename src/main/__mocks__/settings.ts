import { beforeEach } from "vitest";
import { mockReset } from "vitest-mock-extended";

beforeEach(() => {
  mockReset(initSettings);
});

export const initSettings = vi.fn();
