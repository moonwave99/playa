import { getTrackById } from "../db/track";

export function trackController() {
  return {
    getTrackById,
  };
}

export const actions: (keyof ReturnType<typeof trackController>)[] = [
  "getTrackById",
];
