import { albums } from '../../../../test/fixtures';

import reducer, {
  CoverActionTypes,
  CoverState,
  getCoverRequest,
  COVER_GET_REQUEST,
  COVER_GET_RESPONSE
} from './cover';

describe('album actions', () => {
  describe('getCoverRequest', () => {
    it.skip('should dispatch getCoverRequest request', () => {
      const dispatch = jest.fn();
      getCoverRequest(albums[0])(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: COVER_GET_REQUEST,
        album: albums[0]
      });
    });
  });
});

describe('cover reducer', () => {
  const initialState = {
    allById: {}
  }
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as CoverActionTypes))
      .toEqual(initialState);
  });

  it('should handle COVER_GET_REQUEST', () => {
    expect(reducer({} as CoverState, {
      type: COVER_GET_REQUEST,
      album: albums[0]
    })).toEqual({});
  });

  it('should handle COVER_GET_RESPONSE', () => {
    const path = '/path/to/cover.jpg';
    expect(reducer(initialState, {
      type: COVER_GET_RESPONSE,
      path,
      album: albums[0]
    })).toEqual({
      ...initialState,
      allById: { '1': path }
    });
  });
});
