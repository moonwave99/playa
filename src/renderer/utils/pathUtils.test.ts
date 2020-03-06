import { encodePath, getYearFromPath } from './pathUtils';

describe('encodePath', () => {
  it('should encode symbols', () => {
    const path = "/path/to/What's th& story? Morning glory #1";
    expect(encodePath(path)).toEqual("/path/to/What's th%26 story%3F Morning glory %231");
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
