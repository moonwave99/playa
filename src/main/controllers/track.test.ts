import prisma from "../db/prisma";
import { clearPrisma } from "@/test/prisma-utils";
import { trackController } from "./track";
import { getFakeTracksForRelease } from "@/test/seed";

afterEach(clearPrisma);

describe("track - getTrackById function", () => {
  it("returns a Track by the given id", async () => {
    const track = getFakeTracksForRelease(1).at(0);
    await prisma.track.create({ data: track });

    const { getTrackById } = trackController();

    const result = await getTrackById(1);

    expect(result).toMatchObject(track);
  });
});
