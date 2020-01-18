import reducer, {
  UIActionTypes,
  UIState,
  updateState,
  updateTitle,
  showContextMenu,
  STATE_UPDATE,
  TITLE_UPDATE,
  SHOW_CONTEXT_MENU,
} from './ui';

import { ContextMenuTypes } from '../../utils/contextMenuUtils';

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

  describe('showContextMenu', () => {
    it('should dispatch a showContextMenu request', () => {
      const dispatch = jest.fn();
      const context = { path: '/path/to/123', artist: 'Slowdive', title: 'Just for a Day' };
      showContextMenu({
        type: ContextMenuTypes.RESULT_LIST_ITEM,
        context
      })(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: SHOW_CONTEXT_MENU,
        options: {
          type: ContextMenuTypes.RESULT_LIST_ITEM,
          context
        }
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

  it('should handle SHOW_CONTEXT_MENU', () => {
    expect(reducer({} as UIState, {
      type: SHOW_CONTEXT_MENU,
      options: {
        type: ContextMenuTypes.RESULT_LIST_ITEM,
        context: { path: '/path/to/123', artist: 'Slowdive', title: 'Just for a Day' }
      }
    })).toEqual({});
  });
});
