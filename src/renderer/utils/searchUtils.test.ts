import { parseQuery } from './searchUtils';

describe('parseQuery', () => {
  it('should return the original query if no fields: are matched', () => {
    const query = 'no fields here';
    expect(parseQuery(query)).toEqual({
      query
    });
  });

  it('should return a parsed query if any field: is matched', () => {
    let query = 'artist: Slowdive';
    expect(parseQuery(query)).toEqual({
      query: '',
      selector: { artist: 'Slowdive' }
    });

    query = 'artist: Slowdive year: 1990';
    expect(parseQuery(query)).toEqual({
      query: '',
      selector: { artist: 'Slowdive', year: 1990 }
    });

    query = 'artist: Slowdive type: ep';
    expect(parseQuery(query)).toEqual({
      query: '',
      selector: { artist: 'Slowdive', type: 'ep' }
    });

    query = 'blabla year: 1990 artist: Slowdive type: ep';
    expect(parseQuery(query)).toEqual({
      query: 'blabla',
      selector: { artist: 'Slowdive', type: 'ep', year: 1990 }
    });
  });
});
