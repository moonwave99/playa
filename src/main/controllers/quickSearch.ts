import { getResults } from "../db/quickSearch";

export function quickSearchController() {
  return {
    getResults,
  };
}

export const actions: (keyof ReturnType<typeof quickSearchController>)[] = [
  "getResults",
];
