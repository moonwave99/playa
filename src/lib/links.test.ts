import {
  getURL,
  getYoutubeURL,
  getDiscogsURL,
  getRYMURL,
  getCover,
  getEntityLink,
  getReleaseLink,
  getCollectionLink,
  getGroupLink,
  getArtistLink,
  getRandomLink,
} from "./links";

describe("getURL function", () => {
  it("returns an URL with params", () => {
    expect(getURL("https://example.com", {})).toBe("https://example.com");
    expect(getURL("https://example.com", { a: "b", c: true, d: 1 })).toBe(
      "https://example.com?a=b&c=true&d=1"
    );
  });
});

describe("getYoutubeURL function", () => {
  it("returns a formatted YouTube URL", () => {
    expect(getYoutubeURL("yo")).toBe(
      "https://www.youtube.com/results?search_query=yo"
    );
  });
});

describe("getDiscogsURL function", () => {
  it("returns a formatted Discogs URL", () => {
    expect(getDiscogsURL("yo", "artist")).toBe(
      "https://www.discogs.com/search?type=artist&q=yo"
    );
  });
});

describe("getRYMURL function", () => {
  it("returns a formatted RYM URL", () => {
    expect(getRYMURL("yo", "artist")).toBe(
      "https://rateyourmusic.com/search?searchtype=a&searchterm=yo"
    );
    expect(getRYMURL("yo", "release")).toBe(
      "https://rateyourmusic.com/search?searchtype=l&searchterm=yo"
    );
    expect(getRYMURL("yo")).toBe(
      "https://rateyourmusic.com/search?searchtype=l&searchterm=yo"
    );
  });
});

describe("getCover function", () => {
  it("returns a playa cover URL", () => {
    expect(getCover("yo")).toBe("playa-cover://yo-cover.jpg");
  });
  it("adds a nonce to avoid cache", () => {
    expect(getCover("yo", true)).toMatch(
      /playa-cover:\/\/yo-cover.jpg\?(\d{4})/
    );
  });
});

describe("getEntityLink function", () => {
  it("returns the parent entity link if no id is passed", () => {
    expect(
      (["release", "artist", "collection", "group"] as const).map(
        (entityType) => getEntityLink({ entityType })
      )
    ).toEqual(["/releases", "/artists", "/collections", "/groups"]);
  });

  it("returns the detail entity link if an id is passed", () => {
    expect(
      (["release", "artist", "collection", "group"] as const).map(
        (entityType) => getEntityLink({ entityType, id: 1 })
      )
    ).toEqual(["/releases/1", "/artists/1", "/collections/1", "/groups/1"]);
  });
});

describe("getReleaseLink function", () => {
  it("returns the release link", () => {
    expect(getReleaseLink({ id: 1 })).toBe("/releases/1");
  });
  it("returns the release link with the track parameter", () => {
    expect(getReleaseLink({ id: 1, track_id: 2 })).toBe(
      "/releases/1?track_id=2"
    );
  });
});

describe("getArtist function", () => {
  it("returns the artist link", () => {
    expect(getArtistLink({ id: 1 })).toBe("/artists/1");
  });
});

describe("getCollection function", () => {
  it("returns the collection link", () => {
    expect(getCollectionLink({ id: 1 })).toBe("/collections/1");
  });
});

describe("getGroup function", () => {
  it("returns the group link", () => {
    expect(getGroupLink({ id: 1 })).toBe("/groups/1");
  });
});

describe("getRandomLink function", () => {
  it("returns a random link for the given entity type", () => {
    expect(
      getRandomLink(
        {
          artist: 5,
        },
        "artist"
      )
    ).toMatch(/\/artists\/(\d)/);
  });
});
