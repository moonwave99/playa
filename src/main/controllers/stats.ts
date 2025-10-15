import { getStats } from "../db/stats";

export function statsController() {
  return {
    getStats,
  };
}

export const actions: (keyof ReturnType<typeof statsController>)[] = [
  "getStats",
];
