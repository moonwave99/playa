import { formatTrackNumber, getNextTrack, getPrevTrack } from './tracklistUtils';

describe('formatTrackNumber', () => {
  it('should pad numbers <10 with 0', () => {
    expect(formatTrackNumber(3)).toEqual('03');
  });
  it('should return numbers >=10 unchanged', () => {
    expect(formatTrackNumber(10)).toEqual('10');
  });
});

const albums = [
  {
    _id: 'a',
    tracks: ['ta1', 'ta2', 'ta3']
  },
  {
    _id: 'b',
    tracks: ['tb1', 'tb2', 'tb3']
  },
  {
    _id: 'c',
    tracks: ['tc1', 'tc2', 'tc3']
  }
];

describe('getNextTrack', () => {
  it('should return { null, null } if track is not found', () => {
    expect(getNextTrack('td1', albums)).toEqual({
      albumId: null,
      trackId: null
    });
  });

  it('should return next track in the same album if track is not the last of album', () => {
    expect(getNextTrack('ta1', albums)).toEqual({
      albumId: 'a',
      trackId: 'ta2'
    });
  });

  it('should return first track of next album if track was the last of its album', () => {
    expect(getNextTrack('ta3', albums)).toEqual({
      albumId: 'b',
      trackId: 'tb1'
    });
  });

  it('should return { null, null } if track is last of last album', () => {
    expect(getNextTrack('tc3', albums)).toEqual({
      albumId: null,
      trackId: null
    });
  });

  it('should give the identity if composed with getPrevTrack', () => {
    const { trackId } = getNextTrack('ta1', albums);
    expect(getPrevTrack(trackId, albums)).toEqual({
      albumId: 'a',
      trackId: 'ta1'
    });
  });
});

describe('getPrevTrack', () => {
  it('should return { null, null } if track is not found', () => {
    expect(getPrevTrack('td1', albums)).toEqual({
      albumId: null,
      trackId: null
    });
  });

  it('should return prev track in the same album if track is not the first of album', () => {
    expect(getPrevTrack('ta2', albums)).toEqual({
      albumId: 'a',
      trackId: 'ta1'
    });
  });

  it('should return last track of prev album if track was the first of its album', () => {
    expect(getPrevTrack('tb1', albums)).toEqual({
      albumId: 'a',
      trackId: 'ta3'
    });
  });

  it('should return { null, null } if track is first of first album', () => {
    expect(getPrevTrack('ta1', albums)).toEqual({
      albumId: null,
      trackId: null
    });
  });

  it('should give the identity if composed with getNextTrack', () => {
    const { trackId } = getPrevTrack('ta2', albums);
    expect(getNextTrack(trackId, albums)).toEqual({
      albumId: 'a',
      trackId: 'ta2'
    });
  });
});
