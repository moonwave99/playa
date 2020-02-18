import mockFs from 'mock-fs';

import loadAlbum from './loadAlbum';

describe('loadAlbum', () => {
  afterAll(() => {
    mockFs.restore();
  });
  const path = '/path/to/dir';
  it('should load music files from path', async () => {
    mockFs({
      [path]: {
        '01 - Spanish Air.mp3': '',
        '02 - Celias Dream.mp3': '',
        'log.txt': '',
        'empty-dir': {}
      }
    });
    const albumContent = await loadAlbum(path);
    expect(albumContent).toEqual([
      `${path}/01 - Spanish Air.mp3`,
      `${path}/02 - Celias Dream.mp3`,
    ]);
  });
});
