import { formatTrackNumber, formatDuration } from './tracklist';

describe('formatTrackNumber', () => {
  it('should pad numbers <10 with 0', () => {
    expect(formatTrackNumber(3)).toEqual('03');
  });
  it('should return numbers >=10 unchanged', () => {
    expect(formatTrackNumber(10)).toEqual('10');
  });
});

describe('formatDuration', () => {
  it('should return 00:0s when seconds are <10', () => {
    expect(formatDuration(0)).toEqual('00:00');
    expect(formatDuration(9)).toEqual('00:09');
  });
  it('should return 00:ss when seconds are 10<s<59', () => {
    expect(formatDuration(11)).toEqual('00:11');
    expect(formatDuration(59)).toEqual('00:59');
  });
  it('should return 0m:ss when seconds are 60<s<600', () => {
    expect(formatDuration(60)).toEqual('01:00');
    expect(formatDuration(301)).toEqual('05:01');
  });
  it('should return mm:ss when seconds are 600<s<3600', () => {
    expect(formatDuration(600)).toEqual('10:00');
    expect(formatDuration(3599)).toEqual('59:59');
  });
  it('should return hh:mm:ss when seconds are s>3600', () => {
    expect(formatDuration(3600)).toEqual('01:00:00');
    expect(formatDuration(3600 + 300 + 23)).toEqual('01:05:23');
  });
});
