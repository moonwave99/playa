import { getHashCode, intToHSL } from './colorUtils';

describe('getHashCode', () => {
  it('should return an integer hash from given string', () => {
    expect(getHashCode('Slowdive')).toBe(-1018661995);
  });
  it('should return 0 for the empty string', () => {
    expect(getHashCode('')).toBe(0);
  });
});

describe('intToHSL', () => {
  it('should return a formatted hsl property from given number', () => {
    expect(intToHSL(361, 10, 30)).toBe('hsl(1, 10%, 30%)');
  });
  it('should use default values', () => {
    expect(intToHSL(10)).toBe('hsl(10, 20%, 20%)');
  });
});
