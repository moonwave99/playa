import api from '../api';
import { beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

beforeEach(() => {
  mockReset(mockedApi);
});

const mockedApi = mockDeep<typeof api>();
export default mockedApi;