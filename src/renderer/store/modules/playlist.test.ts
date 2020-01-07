import reducer, {
  Playlist,
  PlaylistActionTypes,
  PlaylistState,
  requestAllPlaylists,
  loadAllPlaylists,
  loadPlaylist,
  savePlaylist,
  updatePlaylist,
  deletePlaylist,
  removePlaylist,
  PLAYLIST_REQUEST_ALL,
  PLAYLIST_LOAD_ALL,
  PLAYLIST_LOAD,
  PLAYLIST_SAVE,
  PLAYLIST_UPDATE,
  PLAYLIST_DELETE,
  PLAYLIST_REMOVE
} from './playlist';

describe('playlist actions', () => {
  describe('requestAllPlaylists', () => {
    it('dispatches a requestAllPlaylists request', () => {
      const dispatch = jest.fn();
      requestAllPlaylists()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: PLAYLIST_REQUEST_ALL
      });
    });
  });

  describe('loadAllPlaylists', () => {
    it('dispatches a loadAllPlaylists request', () => {
      const dispatch = jest.fn();
      const playlists: Playlist[] = [];
      loadAllPlaylists(playlists)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: PLAYLIST_LOAD_ALL,
        playlists
      });
    });
  });

  describe('loadPlaylist', () => {
    it('dispatches a loadPlaylist request', () => {
      const dispatch = jest.fn();
      const id: Playlist['_id'] = '123';
      loadPlaylist(id)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: PLAYLIST_LOAD,
        id
      });
    });
  });

  describe('savePlaylist', () => {
    it('dispatches a savePlaylist request', () => {
      const dispatch = jest.fn();
      const playlist = {} as Playlist;
      savePlaylist(playlist)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: PLAYLIST_SAVE,
        playlist
      });
    });
  });

  describe('updatePlaylist', () => {
    it('dispatches a updatePlaylist request', () => {
      const dispatch = jest.fn();
      const playlist = {} as Playlist;
      updatePlaylist(playlist)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: PLAYLIST_UPDATE,
        playlist
      });
    });
  });

  describe('deletePlaylist', () => {
    it('dispatches a deletePlaylist request', () => {
      const dispatch = jest.fn();
      const playlist = {} as Playlist;
      deletePlaylist(playlist)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: PLAYLIST_DELETE,
        playlist
      });
    });
  });

  describe('removePlaylist', () => {
    it('dispatches a removePlaylist request', () => {
      const dispatch = jest.fn();
      const playlist = {} as Playlist;
      removePlaylist(playlist)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: PLAYLIST_REMOVE,
        playlist
      });
    });
  });
});

describe('playlist reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as PlaylistActionTypes)).toEqual({
      allById: {},
      current: null
    });
  });

  it('should handle PLAYLIST_REQUEST_ALL', () => {
    expect(reducer({} as PlaylistState, {
      type: PLAYLIST_REQUEST_ALL
    })).toEqual({});
  });
});
