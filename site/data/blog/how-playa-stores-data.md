---
title: "How Playa stores data"
slug: how-playa-stores-data
date: 2020-02-22T00:00:00.000Z
published: true
---
We all love a slick user interface that incarnates the _zeitgeist_, but without a well structured persistence layer it is of no use. Here I will give an overview of how I tried to make up for the lack of total outward slickness with sound invisible choices.

## What should be stored?

First thing: what should a music player persist?

If it holds a **library** of my music, it should definitely store it in an indexed way, e.g. a [RDBMS][rdbms] .  
What about the **playlists**? They deserve to be stored somewhere as well, either as files or as database entries.  
Last but not least, the **user session**: to grant a good UX, things like last opened playlist and volume settings should be persisted.

## Early days

In the first iteration of Playa, I stored the playlists as `.yaml` files, like:

```yaml
title: Playlist Title
lastPlayedAlbumId: a_25a6ee2e14d160875717bbf417fef140
lastPlayedTrackId: t_14f04ad6e0ff78b7a6e66304e3eb3ef3
lastScrolledAlbumId: null
tracklist:
  - /path/to/track_01.mp3
  - /path/to/track_02.mp3
  - /path/to/track_03.mp3
  - ...
```

Not bad, but I wasn't storing any track metadata, as I extracted it from the music files everytime I loaded a playlist. For long playlists, the lag was noticeable: this convinced me to cache this information in a database.

I tried to use [SQLite][sqlite], but I had many issues bundling it inside the Electron app. Before starting to write code that I could not commit to ship, I looked for alternatives. [LevelDB][leveldb] seemed a good choice, as it is embedded in browsers. [PouchDB][pouchdb] seemed the stablest wrapper that allowed:

1. to access the database from a **specific path** (good for separating dev/prod/test environment);
2. to perform an [indexed search][pouchdb-find].

On the downsides I must mention that the API is inconsistent at times (`rev` vs. `_rev`, `id` vs. `_id`, I am looking at you two), and some operations that are trivial in the relational world, are a bit more cumbersome in the NoSQL wildness (e.g. auto-incrementing the primary key or pagination).

## Data schema

PouchDB has no tables, so relationships between entities are totally up to the use we make of data, and there is no way to ensure [referential integrity][referential-integrity]. As the app schema is relatively simple and there are no concurrent ways of changing data, I can live with that.

The schema is relatively simple:

<iframe width="700" height="400" src='https://dbdiagram.io/embed/5e5bb6044495b02c3b879d7b'></iframe>

Things to notice:

1. the **primary keys** are stored as strings;
2. the relationship are saved as array of IDs.

In the relational mindset this would grant you an anathema, but here it is fine: the relationships are mostly hierarchical, the volume of I/O operations is low, and we do not need to perform any `JOIN`s - more on that [later](#redux-stores).

How to be sure that there will be no duplicate primary keys? I used a different strategy for each entity:

- playlists: I used the **current timestamp**. It will be always different and ascendent, so documents will already be sorted;
- albums: I actually keep track of the highest value in the **redux store**, and I increment it on every album insertion;
- tracks: I use the **track filename** itself.

## Database client

I wrapped all the PouchDB interactions inside a class that wraps a database instance:

```typescript
export default class Database {
  private db;
  constructor({
    path,
    name,
  }: DatabaseParams) {
    const LocalPouchDB = PouchDB.defaults({ prefix: path });
    this.db = new LocalPouchDB(name);
  }

  // uses pouchdb-find plugin, see: https://pouchdb.com/guides/mango-queries.html
  async find<T>(selector: { [key: string]: string|number }): Promise<Array<T>> {...}

  // uses pouchdb-quick-search plugin, see: https://github.com/pouchdb-community/pouchdb-quick-search
  async search<T>(query: string, fields: string[]): Promise<Array<T>> {...}

  async findAll<T>(): Promise<Array<T>> {...}
  async get<T>(_id: string): Promise<T> {...}
  async getList<T>(ids: Entity['_id'][]): Promise<Array<T>> {...}
  
  async save<T extends Entity>(entity: T): Promise<T> {...}
  async saveBulk<T>(entities: T[]): Promise<T[]> {...}

  async delete<T extends Entity>(entity: T): Promise<Entity> {...}

  // marks the document as { _deleted: true }
  async deleteBulk<T>(entities: T[]): Promise<T[]> {...}

  // physically removes the document from the database
  async removeBulk<T>(entities: T[]): Promise<Result[]> {...}
}
```

I am definitely _not_ happy with how I named things: `search` vs `find`, `delete` and `remove`...with all chance I am going to refactor similar methods into a single public one, with a parameter that routes to the right internal implementation.

Some usage examples:

```typescript
// get albums of a playlist
const playlist = {
  ...
  albums: ['1', '2', '3']
}

const albumDB = new Database({ path: '/path/to/database', name: 'albums' });
const albums = await albumDB.getList<Album>(playlist.albums);

// add an album to a playlist
const playlist = {
  ...
  albums: ['1', '2', '3']
}

const album = {
  _id: '4',
  ...
}

const playlistDB = new Database({ path: '/path/to/database', name: 'playlists' });
const updatedPlaylist = await playlistDB.save<Playlist>({
  ...playlist,
  albums: [...playlist.albums, album._id]
});

```

Important: the database clients reside in the `main` process, so all interactions happens via `ipc` - no direct access via actions/stores.

## Redux stores

It is good practice to keep the stores as normalised as possible, i.e. without nested objects and with an hash that allows `O(1)` access:

```javascript
const playlistState = {
  allById: {
    '2020-02-03T12:56:50.342Z': {
      ...
      albums: ['1', '2', ...]
    },
    '2020-02-05T02:11:23.125Z': { ... },
    ...
  },
  ...
}

const albumState = {
  allById: {
    '1': {
      ...
      artist: '1',
      tracks: ['/path/to/track_01', '/path/to/track_02', ...]
    },
    '2': { ... },
    ...
  },
  ...
}

const artistState = {
  allById: {
    '1': {
      ...
      name: 'Slowdive'
    },
    '2': { ... },
    ...
  },
  ...
}

const trackState = {
  allById: {
    '/path/to/track_01': { ... },
    '/path/to/track_02': { ... },
    ...
  },
  ...
}
```

For instance, I can access a playlist by `id` via `state.playlists.allById[id]`.

**Many-to-one relationships** are easy to handle as well: `albums = playlist.albums.map(id => state.albums.allById[id])`.

More complex selectors for top-level React components are wrapped in a proper **reselect selector** of course.

## Session persistence

This was a straightforward task - a `JSON` file suffices:

```javascript
{
  "lastOpenedPlaylistId": "2020-02-03T12:56:50.342Z",
  "lastWindowSize": [1680, 1027],
  "lastWindowPosition": [0, 23],
  "queue": ["9946", "9947", "9948"],
  "volume": 1
}
```

I load it when the app starts and I use the values accordingly. Some are needed by Electron (window size and position), others by the React app - I inject the latter as `props` of the root component.

What about persistence timing? Window values are set and saved on app quit:

```javascript
app.on('will-quit', () => {
  appState.setState({
    lastWindowSize: mainWindow.getSize(),
    lastWindowPosition: mainWindow.getPosition()
  });
  appState.save();
});
```

The values determined by user interaction, like the last opened playlist, the playback queue or the volume level are updated via `ipc`:

```typescript
// renderer
ipc.send(IPC_UI_STATE_UPDATE, params);

// main
ipc.on(IPC_UI_STATE_UPDATE, (_event, params: object) => appState.setState(params));
```

While the Electron persistence strategies have still room for improvement in my opinion, I consider myself more than satisfied for the moment.

[rdbms]: https://en.wikipedia.org/wiki/Relational_database
[sqlite]: https://github.com/mapbox/node-sqlite3/
[leveldb]: https://github.com/google/leveldb
[pouchdb]: https://github.com/pouchdb/pouchdb
[pouchdb-find]: https://github.com/pouchdb/pouchdb/tree/master/packages/node_modules/pouchdb-find
[referential-integrity]: https://en.wikipedia.org/wiki/Referential_integrity
