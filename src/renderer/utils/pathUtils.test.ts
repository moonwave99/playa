import { encodePath, getYearFromPath } from './pathUtils';

describe('encodePath', () => {
  it('should encode question marks', () => {
    const path = "/path/to/What's the story? Morning glory";
    expect(encodePath(path)).toEqual("/path/to/What's the story%3F Morning glory");
  });
});

describe('getYearFromPath', () => {
  it('should return the album year if path contains a 4 digit number', () => {
    const path = '/path/to/1999 - album';
    expect(getYearFromPath(path)).toBe(1999);
  });
  it('should return undefined if path does not contain a 4 digit number', () => {
    const path = '/path/to/album';
    expect(getYearFromPath(path)).toBe(undefined);
  });
  it('should return undefined if path is null', () => {
    expect(getYearFromPath(null)).toBe(undefined);
  });
});
