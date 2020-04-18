---
title: Testing Playa
slug: testing
date: 2020-02-8T00:00:00.000Z
published: true
---
I have to be honest: I seldom tested my applications, at least not thoroughly. This time I wanted not only to strive for good coverage, but to use a **test-first** approach, at least for when the prototype reached an usable level.

I will talk about:

1. [Jest setup](#jest-setup);
2. [Testing React components](#testing-react-components);
3. [Testing Redux actions and stores](#testing-redux);
4. [Testing utils](#testing=uutils).

## Jest setup

First, the tests reside next to the code they refer to, see:

```bash
src
  main
    lib
      database.test.ts
      database.ts
      ...
  renderer
    components
      SearchView
        SearchView.scss
        SearchView.test.tsx
        SearchView.tsx
      ...
```

The jest configuration instructs the following:

- to transform the `.ts`/`.tsx` files to js;
- to mock imported styles / images;
- to map some modules to the corresponding mocks.

```javascript
// jest.config.js
module.exports = {
  roots: [
    "<rootDir>/src"
  ],
  testMatch: [
    "**/?(*.)+(test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  setupFilesAfterEnv: [
    "<rootDir>/test/testSetup.ts"
  ],
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "<rootDir>/test/__mocks__/styleMock.js",
    "\\.(gif|ttf|eot|svg)$": "<rootDir>/test/__mocks__/fileMock.js",
    "disconnect": "<rootDir>/test/__mocks__/disconnect.js",
    "electron": "<rootDir>/test/__mocks__/electron.js",
    "music-metadata": "<rootDir>/test/__mocks__/music-metadata.js",
    "pouchdb": "<rootDir>/test/__mocks__/pouchdb.ts",
    "@fortawesome/react-fontawesome": "<rootDir>/test/__mocks__/@fortawesome/react-fontawesome.tsx"
  }
}
```

In `testSetup.ts` there are the global mocks:

```typescript
import React = require('react');
import initI18n from '../src/renderer/initializers/initI18n';

// disables useLayoutEffect for CSSTransition component
React.useLayoutEffect = React.useEffect;

// allows injecting any kind of object into the jest global variable
const globalAny: any = global;

// yelds a second of white noise for the waveform generator
globalAny.AudioContext = jest.fn().mockImplementation(() => ({
  decodeAudioData: () => ({
    duration: 1,
    length: 44100,
    numberOfChannels: 2,
    sampleRate: 44100,
    getChannelData: () => Array.from(Array(44100).keys()).map(() => Math.random())
  })
}));

// mocks HTTP fetch()
globalAny.fetch = require("jest-fetch-mock");
globalAny.fetchMock = globalAny.fetch;

// initialises i18next
initI18n();
```

Ready to go with `yarn test` that runs `$ jest --config jest.config.js`, hoping to always see green fields.

## Testing React components

The line between unit and integration test for React components is blurry: how do we test _just_ the contract, i.e. the expected output for the given input, by completely ignoring the implementation?

For simple components, it is definitely feasible:

```tsx
// component
const Label = ({ text }): ReactElement => {
  return <span className="label">{text}</span>;
}

// test
it('should render a .label', () => {
  const wrapper = render(<Label text="hello"/>);
  expect(wrapper.is('.label')).toBe(true);
  expect(wrapper.text()).toBe('hello');
});
```

We are checking that the passed `prop` is used as expected, and that the renderer element has the proper class.

But the higher we go in the component hierarchy, the more subcomponents we expect to be rendered. My rule is to check **just for the direct children**, e.g. I check that a `List` has the right number of `ListItems`: I am handling the tested component not like a complete black box, because I know the implementation of its children, but not even am I dissecting it.

A common mistake is to test the internal state of the component. We do not have to check the internals of the component, as long as it does what it promises to do.

### Testing components that useCustomHooks

Many components include `useDispatch`/`useSelector`, `useDrag/Drop`, `useHistory`/`useLocation`, all hooks that throw an exception if not run in a specific context. They should be rendered / mounted in such context in order to be tested, for instance:

```tsx
const wrapper = render(
  <Provider store={mockedStore}>
    <AlbumView
      currentTrackId={null}
      album={albums[0]}
      dragType={''}
      albumActions={[]}
      onContextMenu={jest.fn()}
      onDoubleClick={jest.fn()}/> 
  </Provider>
);
```

**Important:** even if the component itself does not use any hook, its children may do!

Tired of wrapping almost every element in two or three mocked layers, I wrote some `testUtils` with all the wrappers and and a function that composes them upon need:

```tsx
const routerWrapper = function(element: ReactElement) {
  return <MemoryRouter>{element}</MemoryRouter>;
}

const providerWrapper = function(element: ReactElement, store: object = defaultStore) {
  const mockedStore = configureMockStore([thunk])(store);
  return <Provider store={mockedStore}>{element}</Provider>;
}

const dndProviderWrapper = function(element: ReactElement) {
  return <DndProvider backend={Backend}>{element}</DndProvider>;
}

// the renderer (shallow, render, mount) come from enzyme
export function wrap(renderer: Renderers, ...wrappers: Wrappers[]): Function { ... }

export const shallowInRouter =
  (element: ReactElement) => wrap(Renderers.shallow, Wrappers.Router)(element);
export const renderInRouter =
  (element: ReactElement) => wrap(Renderers.render, Wrappers.Router)(element);
export const mountInRouter =
  (element: ReactElement) => wrap(Renderers.mount, Wrappers.Router)(element);
  
// composition order reflects the one of the real app,
// i.e. the redux provider being the outermost
export const shallowInAll = wrap(
  Renderers.shallow,
  Wrappers.Provider,
  Wrappers.Router,
  Wrappers.DndProvider
);

export const renderInAll = wrap(
  Renderers.render,
  Wrappers.Provider,
  Wrappers.Router,
  Wrappers.DndProvider
);

export const mountInAll = wrap(
  Renderers.mount,
  Wrappers.Provider,
  Wrappers.Router,
  Wrappers.DndProvider
);
```

## Testing Redux

### Redux actions

Actions are one of the most vital parts of the application, because they glue together the user interaction with the model and the view layer. The responsibility of every single **action creator** should be clear, among with its expected behaviour.

Let's have a look at `getAllPlaylistsRequest`:

```typescript
export const getAllPlaylistsRequest = (): Function =>
  async (dispatch: Function): Promise<void> => {
    const playlists = await ipc.invoke(IPC_PLAYLIST_GET_ALL_REQUEST);
    dispatch({
      type: PLAYLIST_GET_ALL_RESPONSE,
      playlists
    });
  }
```

Remember that the app uses [redux-thunk][redux-thunk] for handling **asynchronous actions**. This is why the function is returning _another `async` function_ that takes `dispatch` as an argument, and not a plain action (i.e. an object with type and params).

In plain redux in fact, we would just have checked the return value of the creator:

```typescript
// plain redux example, not part of the app
const getAllPlaylistsResponse = (playlists) => {
  return {
    type: PLAYLIST_GET_ALL_RESPONSE,
    playlists
  }
}

const action = getAllPlaylistsResponse(playlists);
expect(action.type).toBe(PLAYLIST_GET_ALL_RESPONSE);
expect(action.playlists).toEqual(playlists);
```

In our case we must tackle the problem from a different angle: we should **spy** on the passed `dispatch` function, and see if it has been called with the right action parameters!

We need a little configuration in order to achieve this, namely:

- to use [redux-mock-store][redux-mock-store];
- to pass the `dispatch` function of the mocked store to the action creator we want to test;
- to inspect the contents of `store.getActions()` after the action creator has been called.

```typescript
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

describe('getAllPlaylistsRequest', () => {
  it('should dispatch PLAYLIST_GET_ALL_RESPONSE', async () => {
    // we pass the empty object as the initial state, ymmv
    const store = mockStore({});
    
    // always remember to await if the creator makes async calls!
    await getAllPlaylistsRequest()(store.dispatch);
    expect(store.getActions()).toEqual([{
      type: PLAYLIST_GET_ALL_RESPONSE,
      playlists
    }]);
  });
});
```

`store.getActions()` is the secret of our success: it returns all the calls to `store.dispatch`, so we can check that everything went as expected. In this case, the tested function makes an async call to the database via `ipc`, then dispatches a `PLAYLIST_GET_ALL_RESPONSE` action with `playlists` as parameter.

**Important:** the responsibility of an action creator/action is _not_ to return data. It may be one of the desired effects on the store, but in the end it should **just dispatch actions**. The store itself will take care of returning a proper update of the current state based on the incoming action.

Let's make an example with a little more branching - a creator that fetches the playlist if not present in the store, and does nothing in case it is already present.

```typescript
export const getSinglePlaylistsRequest = (id: string): Function =>
  async (dispatch: Function, getState: Function): Promise<void> => {
    const { playlists } = getState();
    if (playlists.allById[id]) {
      return;
    }
    const playlist = await ipc.invoke(IPC_PLAYLIST_GET_SINGLE_REQUEST, id);
    dispatch({
      type: PLAYLIST_GET_SINGLE_RESPONSE,
      playlist
    });
  }
```

Notice how we are passing the `id` parameter to the creator this time - it will be available in the closure of the action itself. Another parameter is passed to the async function, the `getState` function of the store, that allows inspection on the current state.

Of course one must know how the state is structured, in this case it is required to access the playlists from the `playlists.allById`  hashmap.

Let's test the thing:

```typescript
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const mockStore = configureStore([thunk]);

describe('getSinglePlaylistsRequest', () => {
  it('should dispatch PLAYLIST_GET_SINGLE_RESPONSE if requested playlist is not in store', async () => {
    // now we have to pass the proper initial state
    const store = mockStore({
      playlists: {
        allById: {}
      }
    });
    // we pass '1' as playlist id
    await getSinglePlaylistsRequest('1')(store.dispatch);
    expect(store.getActions()).toEqual([{
      type: PLAYLIST_GET_SINGLE_RESPONSE,
      playlist: someExpectedMockedValue
    }]);
  });
  
  it('should dispatch nothing if requested playlist is in store', async () => {
    // now we have to pass the proper initial state
    const store = mockStore({
      playlists: {
        allById: {
          '1': someMockedValue
        }
      }
    });
    await getSinglePlaylistsRequest('1')(store.dispatch);
    expect(store.getActions()).toEqual([]);
  });  
});
```

That's it! This is of tremendous help at understanding the actions flow and all the possible cases, in a predictable way because we always know the initial state before testing.

### Redux store reducers

If the action creator dispatch actions inside them, something should take care of performing something with such actions - the **store reducers** do.

```typescript
// EntityHashMap<T> is just { [key]: string: T }
export interface PlaylistState {
  allById: EntityHashMap<Playlist>;
}

const INITIAL_STATE: PlaylistState = {
	allById: {}
}

export default function reducer(
  state: PlaylistState = INITIAL_STATE,
  action: PlaylistActionTypes
): PlaylistState {
  switch (action.type) {    
    case PLAYLIST_GET_ALL_RESPONSE:
      return {
        ...state,
        // ensureAll<T> ensures that every array entry is a T
        //   by filling missing values with defaults.
        // toObj transforms an array into an hash of { [entry._id]: entry }.
        allById: toObj(ensureAll<Playlist>(action.playlists, getDefaultPlaylist))
      };
    ...
    default:
      return state;
  }
}
```

Let's skip all the `ActionTypes` typing magic for a second and let's focus on the reducer. A reducer is a **pure function** that returns an updated stated based on the current state and the incoming action. It should neither write nor read nor request anything. If it is the case, chances are that such side effects **should be moved into the action creator itself**, that is perfectly allowed to make calls and dispatch as many action as it wants.

In this case, if the incoming action is of type `PLAYLIST_GET_ALL_RESPONSE`, the new state is expected to be `{ allById: anHashOfTheIncomingPlaylists }`. Easy, let's test it:

```typescript
describe('playlist reducer', () => {
  it('should handle PLAYLIST_GET_ALL_RESPONSE', () => {
    const playlists = [{ _id: '1', ... }, { _id: '2', ... }];
    expect(reducer({} as PlaylistState, {
      type: PLAYLIST_GET_ALL_RESPONSE,
      playlists
    })).toEqual({
      allById: {
        "1": playlists[0],
        "2": playlists[1]
      }
    });
  });
  ...
});
```

Looks like a very simple test, isn't it? It is a good symptom! It means that the application is well tokenised into bits of little and precise responsibility.

## Testing utils

Here I used a 100% **test first approach** (don't dig into the repo history to disprove me please). This is because it is much faster and safer to implement a function in a vacuum, just to ensure the contract is respected. Of course one can work on any library function while it already plugged inside another component, but it is better to save the overhead of providing the right input / checking if the unexpected results are due to another part of the application.

This way the tests are used as a playground: for instance, I had to impement `getPrevTrack` and `getNextTrack` functions to navigate the playback queue. Instead of reloading the app and interacting with the playback bar every time, I just run the test file:

```typescript
// tracklistUtils.test.ts
import { getNextTrack, getPrevTrack } from './tracklistUtils';

const albums = [
  {
    _id: 'a',
    tracks: ['ta1', 'ta2', 'ta3']
  },
  {
    _id: 'b',
    tracks: ['tb1', 'tb2', 'tb3']
  },
  {
    _id: 'c',
    tracks: ['tc1', 'tc2', 'tc3']
  }
];

describe('getNextTrack', () => {
  it('should return { null, null } if track is not found', () => {
    expect(getNextTrack('td1', albums)).toEqual({
      albumId: null,
      trackId: null
    });
  });

  it('should return next track in the same album if track is not the last of album', () => {
    expect(getNextTrack('ta1', albums)).toEqual({
      albumId: 'a',
      trackId: 'ta2'
    });
  });

  it('should return first track of next album if track was the last of its album', () => {
    expect(getNextTrack('ta3', albums)).toEqual({
      albumId: 'b',
      trackId: 'tb1'
    });
  });

  it('should return { null, null } if track is last of last album', () => {
    expect(getNextTrack('tc3', albums)).toEqual({
      albumId: null,
      trackId: null
    });
  });

  it('should give the identity if composed with getPrevTrack', () => {
    const { trackId } = getNextTrack('ta1', albums);
    expect(getPrevTrack(trackId, albums)).toEqual({
      albumId: 'a',
      trackId: 'ta1'
    });
  });
});
```

Et voilà, contract fulfilled!

## Final considerations

Even though I have not reached the coverage threshold I am aiming at, testing Playa was of immense help in understanding and entwining the testing and implementation processes.

[redux-thunk]: https://github.com/reduxjs/redux-thunk
[redux-mock-store]: https://github.com/dmitry-zaets/redux-mock-store
