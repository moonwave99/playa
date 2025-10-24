import type { MenuParams, TrackWithRelease } from "@/types/types";
import { buildMenu } from "../menu";

export const trackMenu =
  ({ controllers }: MenuParams) =>
  (track: TrackWithRelease) => {
    buildMenu([
      {
        label: "Playback Track",
        click: () =>
          controllers.system.playback({
            release_id: track.release.id,
            track_id: track.id,
          }),
      },
      {
        label: "Reveal Track in Finder",
        click: () => controllers.system.revealEntityInFinder(track),
      },
    ]);
    return true;
  };
