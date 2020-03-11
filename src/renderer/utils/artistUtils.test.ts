import { formatArtistName } from './artistUtils';

describe('formatArtistName', () => {
  it('should format the artist name', () => {
    expect(formatArtistName('Slowdive')).toBe('Slowdive');
    expect(formatArtistName('_various-artists')).toBe('Various Artists');
  });
});
