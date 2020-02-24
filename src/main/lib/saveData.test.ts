import { saveData } from './saveData';

describe('saveData', () => {
  it('should persist data to disk', async () => {
    const result = await saveData('data', '/tmp/file', 'utf8');
    expect(result).toBe(true);
  });
})
