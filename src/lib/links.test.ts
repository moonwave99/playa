import { getEntityLink } from "./links";

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
