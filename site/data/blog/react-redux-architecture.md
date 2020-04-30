---
title: The React/Redux architecture
slug: react-redux-architecture
date: 2020-02-1T00:00:00.000Z
published: true
---
Many practices flourished in the React ecosystems, addressing from project files hierarchy to where and how store the app state, to components styles. Here are my choices in regard.

## The `src` organisation

The folder structure of an application should favour the development process first of all. How often am I accessing a file? Should other people of the team have non frequent access to any part of it? [This article by David Gilbertson
][react-app-structure] contains a lot of sound considerations in this direction.

Each **component** lives in a folder named as the component itself, among with specs and styles. The hierarchy system is completely arbitr..ahem is mixed: some components are contained inside the parent component, some others live ad the base level because are shared.

```bash
src
  renderer
    components
      AlbumListView
        AlbumListView.tsx
        AlbumListView.test.tsx
        AlbumListView.scss
        AlbumView
          AlbumView.tsx
          AlbumView.test.tsx
          AlbumView.scss
```

There are some **providers** that are `HOC` around pure view layers. They take care of data fetching and event handling, to keep UI easy to test:

```typescript
export const PlaylistContainer = (): ReactElement => {
  const dispatch = useDispatch();
  const { _id } = useParams();

  const {
    playlist,
    albums,
    isLoading
    ...
  } = useSelector((state: ApplicationState) => getPlaylistById(state, _id));

  useEffect(() => {
    ...
  }, [playlist.title]);

  function onAlbumContextMenu() { ... }
  function onAlbumDoubleClick() { ... }
  
  const shouldShowPlaylist = !isLoading && playlist.albums.length === Object.keys(albums).length;
  if (!shouldShowPlaylist) {
    return null;
  }
	return (
    <CSSTransition
      in={!isLoading}
      timeout={300}
      classNames="playlist-view"
      unmountOnExit>
      <PlaylistView
        albums={albums}
        playlist={playlist}
        onAlbumContextMenu={onAlbumContextMenu}
        onAlbumDoubleClick={onAlbumDoubleClick}/>
     </CSSTransition>
	);
};
```

## Styles

I used no particular library (besides a normaliser). I am very fond of [Robert Bringhurst][bringhurst] lectures on typography, and grid systems in general. With `rem` units and SASS preprocessing, it is easy to use a size scale that keeps everythin _in beat_.

Styles are imported directly from modules via `style-loader`:

```javascript
// App.tsx
import React, { FC, ReactElement, useState, useEffect, useRef } from 'react';
...
import './App.scss';
```

Why no inline styles? I am just fine with SASS preprocessing / interpolation / mixins.

## Redux

I like Redux because it acts more like a **low level glue**, rather than as a **rigid framework**. It makes you think about the solutions, and gives you freedom of implementation. Such freedom has a price, called a lot of code to write (and to test). There is a lot of boilerplate to be written, mainly because of Typescript definitions, but once the foundation is stable I didn't have to add much more material: combining existing actions is enough.

### Selectors

Selectors are used in `useSelector` hooks or inside `(re-)reselect` selectors.

```typescript
// /src/renderer/store/modules/album.ts
export const selectors = {
  state: ({ albums }: { albums: AlbumState }): AlbumState => albums,
  allById: ({ albums }: { albums: AlbumState }): EntityHashMap<Album> => albums.allById,
  findById: ({ albums }: { albums: AlbumState }, id: Album['_id']): Album => albums.allById[id],
  findByList: ({ albums }: { albums: AlbumState }, ids: Album['_id'][]): Album[] => ids.map(id => albums.allById[id]),
  findByVariousArtists: ({ albums }: { albums: AlbumState }): Album[] =>
    toArray(albums.allById).filter(({ isAlbumFromVA }) => isAlbumFromVA)
};

// Usage example
import { selectors as albumSelectors } from '../../store/modules/album';

...

const albums = useSelector((state: ApplicationState) => {
  return albumSelectors.findByList(state, listOfAlbumIDs)
});
```

Is it worth having them, as opposed to write ad hoc composite selectors every time? As long as they are tested, they cost nothing and they make simple compositions self-explaining.

For more complex cases, `reselect` does the job:

```typescript
import { createSelector } from 'reselect';

...

export const playerSelector = createSelector(
  selectors.state,
  playlistSelectors.allById,
  albumSelectors.allById,
  trackSelectors.allById,
  waveformSelectors.allById,
  (player, playlists, albums, tracks, waveforms): GetPlayerInfoSelection => {
    const {
      currentPlaylistId,
      currentAlbumId,
      currentTrackId,
      queue
    } = player;
    return {
      currentPlaylist: playlists[currentPlaylistId],
      currentAlbum: albums[currentAlbumId],
      currentAlbumId,
      currentTrack: tracks[currentTrackId],
      waveform: waveforms[currentTrackId],
      queue: queue.map(x => albums[x])
    };
  }
);
```

It makes the component smaller:

```typescript
import {
	playerSelector
} from '../../store/modules/player';

...

const {
  currentPlaylist,
  currentAlbum,
  currentTrack,
  queue,
  waveform
} = useSelector(playerSelector);
```

Bonus: you test the selector in the store context, leaving the UI to its UI things.

### Actions

I use the the standard `redux-thunk` as async handler middleware. Here we have an example of **sync** vs **async** action:

```typescript
export const getAlbumListResponse = (results: Album[]): Function =>
  (dispatch: Function): void => {
    dispatch({
      type: ALBUM_GET_LIST_RESPONSE,
      results
    });
  }

export const getAlbumListRequest = (ids: Album['_id'][]): Function =>
  async (dispatch: Function): Promise<void> => {
    dispatch(
      getAlbumListResponse(
        await ipc.invoke(IPC_ALBUM_GET_LIST_REQUEST, ids)
      )
    );
  }
```

In the first case (`getAlbumListResponse`), an action of type `ALBUM_GET_LIST_RESPONSE` is dispatched (and thus handled by the reducer).

In the second (`getAlbumListRequest`), we have to wait for the response of the `ipc.invoke` call. We could have moved it outside the action, but that would have given responsibility to the caller context (with all chance, a React component).

In order to keep everything in our tidy black box, it is enough to mark the function as `async` (and to update the return type to `Promise<void>`). Now the action is dispatched after `await`ing for the results.

Pay attention to how the request and response handlers are separated, both in the actions and in the reducer. In this case I've chosen _not_ to dispatch a `ALBUM_GET_LIST_REQUEST` action, because I am not updating the UI accordingly. Let's make a more universal example:

```typescript
// action creator
export const getDataRequest = (query: string): Function =>
  async (dispatch: Function): Promise<void> => {
    dispatch({
      type: GET_DATA_REQUEST,
      query
    });
    try {
      const data = await someService.get(query);
      dispatch({
        type: GET_DATA_RESPONSE,
        data
      });
    } catch(error) {
      dispatch({
        type: GET_DATA_ERROR,
        error
      });      
    }
  }
  
// reducer
function reducer(state, action) {
  switch (action.type) {
    case GET_DATA_REQUEST:
      return {
        ...state,
        loading: true
      };
    case GET_DATA_RESPONSE:
      return {
        ...state,
        loading: false,
        error: null,
        data: action.data
      };
    case GET_DATA_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error
      };
  } 
);

// compo
function Compo() {
  const { data, loading, error } = useSelector( ... );
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>{ error.message }</div>;
  }
  
  // do something with data
  return ...;
}
```

This way, we cover all cases and we split responsibility between actions. The UI knows when to display a spinner or if to display an error message. This is also important because it makes the components independent - an action may be fired from a part of the UI, and the effects may be reflected elsewhere.

As an action creator can dispatch multiple actions, we are not tied to dispatch actions of the same store - think about dispatching a common error or UI handler actions.

**Note**: in the Playa case, the `getAlbumListResponse` wrapper was needed because the list could come from different sources.

## What I would like to improve

- implement centralised error handling;
- wrap `ipc`/database communication in an additional layer to improve testability;
- fine grain some selectors to prevent redundant component re-renders.

[react-app-structure]: https://medium.com/hackernoon/the-100-correct-way-to-structure-a-react-app-or-why-theres-no-such-thing-3ede534ef1ed
[bringhurst]: https://en.wikipedia.org/wiki/The_Elements_of_Typographic_Style
