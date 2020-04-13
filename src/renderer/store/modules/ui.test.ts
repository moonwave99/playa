import reducer, {
  UIActionTypes,
  UIState,
  UILibraryView,
  updateState,
  updateTitle,
  setEditPlaylistTitle,
  setEditArtistTitle,
  setLibraryView,
  UPDATE_STATE,
  UPDATE_TITLE,
  SET_EDIT_PLAYLIST_TITLE,
  SET_EDIT_ARTIST_TITLE,
  SET_LIBRARY_VIEW
} from './ui';

describe('ui actions', () => {
  describe('updateState', () => {
    it('should dispatch a updateState request', () => {
      const dispatch = jest.fn();
      const params = {};
      updateState(params)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: UPDATE_STATE,
        params
      });
    });
  });

  describe('updateTitle', () => {
    it('should dispatch a updateTitle request', () => {
      const dispatch = jest.fn();
      const title = {
        main: 'title',
        sub: 'sub'
      };
      updateTitle(title)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: UPDATE_TITLE,
        title
      });
    });
  });

  describe('setEditPlaylistTitle', () => {
    it('should dispatch a setEditPlaylistTitle request', () => {
      const dispatch = jest.fn();
      setEditPlaylistTitle(true)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: SET_EDIT_PLAYLIST_TITLE,
        editPlaylistTitle: true
      });
    });
  });

  describe('setEditArtistTitle', () => {
    it('should dispatch a setEditArtistTitle request', () => {
      const dispatch = jest.fn();
      setEditArtistTitle(true)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: SET_EDIT_ARTIST_TITLE,
        editArtistTitle: true
      });
    });
  });

  describe('setLibraryView', () => {
    it('should dispatch a setLibraryView request', () => {
      const dispatch = jest.fn();
      setLibraryView(UILibraryView.Artists)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: SET_LIBRARY_VIEW,
        libraryView: UILibraryView.Artists
      });
    });
  });
});

describe('ui reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as UIActionTypes)).toEqual({
      started: true,
      title: {
        main: 'Playa'
      },
      editPlaylistTitle: false,
      editArtistTitle: false,
      libraryView: UILibraryView.Timeline
    });
  });

  it('should handle UPDATE_STATE', () => {
    expect(reducer({} as UIState, {
      type: UPDATE_STATE,
      params: {}
    })).toEqual({});
  });

  it('should handle UPDATE_TITLE', () => {
    expect(reducer({} as UIState, {
      type: UPDATE_TITLE,
      title: {
        main: 'title',
        sub: 'sub'
      }
    })).toEqual({
      title: {
        main: 'title',
        sub: 'sub'
      }
    });
  });

  it('should handle SET_EDIT_PLAYLIST_TITLE', () => {
    expect(reducer({} as UIState, {
      type: SET_EDIT_PLAYLIST_TITLE,
      editPlaylistTitle: true
    })).toEqual({
      editPlaylistTitle: true
    });
  });

  it('should handle SET_EDIT_ARTIST_TITLE', () => {
    expect(reducer({} as UIState, {
      type: SET_EDIT_ARTIST_TITLE,
      editArtistTitle: true
    })).toEqual({
      editArtistTitle: true
    });
  });

  it('should handle SET_LIBRARY_VIEW', () => {
    expect(reducer({} as UIState, {
      type: SET_LIBRARY_VIEW,
      libraryView: UILibraryView.Artists
    })).toEqual({
      libraryView: UILibraryView.Artists
    });
  });
});
