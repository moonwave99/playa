import { formatTrackNumber } from './tracklist';

describe('formatTrackNumber', () => {
  it('should pad numbers <10 with 0', () => {
    expect(formatTrackNumber(3)).toEqual('03');
  });
  it('should return numbers >=10 unchanged', () => {
    expect(formatTrackNumber(10)).toEqual('10');
  });
});
