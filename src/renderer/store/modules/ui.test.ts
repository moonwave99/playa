import reducer, {
  UIActionTypes,
  UIState,
  updateState,
  updateTitle,
  STATE_UPDATE,
  TITLE_UPDATE
} from './ui';

describe('ui actions', () => {
  describe('updateState', () => {
    it('should dispatch a updateState request', () => {
      const dispatch = jest.fn();
      const params = {};
      updateState(params)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: STATE_UPDATE,
        params
      });
    });
  });

  describe('updateTitle', () => {
    it('should dispatch a updateTitle request', () => {
      const dispatch = jest.fn();
      const title = 'title';
      updateTitle(title)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: TITLE_UPDATE,
        title
      });
    });
  });
});

describe('ui reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as UIActionTypes)).toEqual({ started: true});
  });

  it('should handle STATE_UPDATE', () => {
    expect(reducer({} as UIState, {
      type: STATE_UPDATE,
      params: {}
    })).toEqual({});
  });

  it('should handle TITLE_UPDATE', () => {
    expect(reducer({} as UIState, {
      type: TITLE_UPDATE,
      title: 'title'
    })).toEqual({});
  });
});
