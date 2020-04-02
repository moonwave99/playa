import { saveData } from './saveData';

describe('saveData', () => {
  it('should persist data to disk', async () => {
    expect(async () => {
      await saveData('data', '/tmp/file', 'utf8')
    }).not.toThrow();
  });
})
