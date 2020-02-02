import { encodePath } from './pathUtils';

describe('encodePath', () => {
  it('should encode question marks', () => {
    const path = "/path/to/What's the story? Morning glory";
    expect(encodePath(path)).toEqual("/path/to/What's the story%3F Morning glory");
  });
});
