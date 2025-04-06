import { beforeEach } from 'vitest';
import { mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(run);
});

export const run = vi.fn();