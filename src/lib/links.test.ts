import { getEntityLink, getReleaseLink } from "./links";

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
