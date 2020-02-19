import { saveData } from './saveData';

describe('saveData', () => {
  it('should persist data to disk', async () => {
    const path = await saveData('data', '/tmp/file', 'utf8');
    expect(path).toBe('/tmp/file');
  });
})
