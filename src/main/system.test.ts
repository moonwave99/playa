import { describe, it, expect } from "vitest";
import { parsePath } from "./system";

describe("parsePath function", () => {
  it("Parses input correctly", () => {
    const output = parsePath('/A/Artist/[Album]/1999 - My Title');
    expect(output).toEqual({
      title: 'My Title',
      type: 'Album',
      year: 1999,
      path: 'My Title',
      fullPath: 'A/Artist/[Album]/1999 - My Title',
      artist: {
        name: 'Artist'
      }
    })
  });

  it("Returns null if path is malformed", () => {
    const output = parsePath('/A/Artist/[Album]/1999 - My Title/More/Stuff');
    expect(output).toEqual(null);
  });
});
