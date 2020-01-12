import reducer, {
  UIActionTypes,
  UIState,
  updateTitle,
  showContextMenu,
  UPDATE_TITLE,
  SHOW_CONTEXT_MENU,
} from './ui';

import { RESULT_LIST_ITEM } from '../../utils/contextMenu';

describe('ui actions', () => {
  describe('updateTitle', () => {
    it('should dispatch a updateTitle request', () => {
      const dispatch = jest.fn();
      const title = 'title';
      updateTitle(title)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: UPDATE_TITLE,
        title
      });
    });
  });
  
  describe('showContextMenu', () => {
    it('should dispatch a showContextMenu request', () => {
      const dispatch = jest.fn();
      const context = { path: '/path/to/123' };
      showContextMenu({
        type: RESULT_LIST_ITEM,
        context
      })(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: SHOW_CONTEXT_MENU,
        options: {
          type: RESULT_LIST_ITEM,
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

  it('should handle UPDATE_TITLE', () => {
    expect(reducer({} as UIState, {
      type: UPDATE_TITLE,
      title: 'title'
    })).toEqual({});
  });

  it('should handle SHOW_CONTEXT_MENU', () => {
    expect(reducer({} as UIState, {
      type: SHOW_CONTEXT_MENU,
      options: {
        type: RESULT_LIST_ITEM,
        context: { path: '/path/to/123' }
      }
    })).toEqual({});
  });
});