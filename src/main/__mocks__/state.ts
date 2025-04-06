import { beforeEach } from 'vitest';
import { mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(send);
});

export const send = vi.fn();