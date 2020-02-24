jest.mock('./saveData');
import DiscogsClient from './discogsClient';
import { saveData } from './saveData';

(saveData as unknown as { mockImplementation: Function }).mockImplementation((
  _data: string,
  path: string
) => {
  if (path === '/path/to/covers/1.jpg') {
    return true;
  }
  return null;
});

describe('DiscogsClient', () => {
  const client = new DiscogsClient({
    coversPath: '/path/to/covers',
    userAgent: 'playa/test',
    credentials: {
      consumerKey: 'DISCOGS_TEST_KEY',
      consumerSecret: 'DISCOGS_TEST_SECRET'
    }
  });
  describe('getAlbumCover', () => {
    it('should retrieve album cover from discogs', async () => {
      const cover = await client.getAlbumCover('Slowdive', 'Just For a Day', '1');
      expect(cover).toBe('/path/to/covers/1.jpg');
    });

    it('should return null if cover is not found', async () => {
      const cover = await client.getAlbumCover('Non Existing', 'Album', '666');
      expect(cover).toBe(null);
    });
  });
});
