jest.mock('./saveData');
jest.mock('jimp', () => {
  return {
    ...jest.requireActual('jimp'),
    read: (): object => ({
      resize: (): object => ({
        quality: jest.fn()
      }),
      writeAsync: async (): Promise<void> => {
        return;
      }
    })
  }
});
import DiscogsClient from './discogsClient';
import { saveData } from './saveData';
import { FileSystemError } from '../../errors';

(saveData as unknown as { mockImplementation: Function }).mockImplementation((
  _data: string,
  path: string
): Promise<void> => {
  if (path === '/path/to/covers/1.jpg') {
    return;
  }
  throw new FileSystemError(`Error writing to ${path}`);
});

describe('DiscogsClient', () => {
  const client = new DiscogsClient({
    coversPath: '/path/to/covers',
    artistPicturesPath: '/path/to/artistPictures',
    userAgent: 'playa/test',
    credentials: {
      consumerKey: 'DISCOGS_TEST_KEY',
      consumerSecret: 'DISCOGS_TEST_SECRET'
    }
  });
  describe('getAlbumCover', () => {
    it('should retrieve album cover from discogs', async () => {
      expect(
        await client.getAlbumCover('Slowdive', 'Just For a Day', '1')
      ).toBe('/path/to/covers/1.jpg');
      // second time hits the cache
      expect(
        await client.getAlbumCover('Slowdive', 'Just For a Day', '1')
      ).toBe('/path/to/covers/1.jpg');
    });

    it('should return null if cover is not found', async () => {
      expect(
        await client.getAlbumCover('Non Existing', 'Album', '666')
      ).toBe(null);
      // second time hits the cache
      expect(
        await client.getAlbumCover('Non Existing', 'Album', '666')
      ).toBe(null);
    });
  });

  describe('getAlbumCoverFromURL', () => {
    it('should persist image from url', async () => {
      expect(
        await client.getAlbumCoverFromURL('1', 'https://path/to/covers/1.jpg')
      ).toBe('/path/to/covers/1.jpg');
    });
  });
});
