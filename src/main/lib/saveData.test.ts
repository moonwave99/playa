import { saveData } from './saveData';

describe('saveData', () => {
  it('should persist data to disk', async () => {
    expect(async () => {
      await saveData('data', '/tmp/file', 'utf8')
    }).not.toThrow();
    try {
      await saveData('data', '/this/path/does/not/exist', 'utf8')
    } catch (error) {
      expect(error.message).toBe('Error writing to /this/path/does/not/exist');
    }
  });
})
