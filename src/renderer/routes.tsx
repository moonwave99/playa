import { matchPath } from "react-router";

export type Route = {
  path: string;
  id: string;
};

export const routes: Route[] = [
  {
    path: "/",
    id: "home",
  },
  {
    path: "/releases",
    id: "releases",
  },
  {
    path: "/releases/:id",
    id: "release",
  },
  {
    path: "/artists",
    id: "artists",
  },
  {
    path: "/artists/:id",
    id: "artist",
  },
  {
    path: "/collections",
    id: "collections",
  },
  {
    path: "/collections/:id",
    id: "collection",
  },
  {
    path: "/groups",
    id: "groups",
  },
  {
    path: "/groups/:id",
    id: "group",
  },
];

export function isPage(page: string, path: string) {
  const route = routes.find(({ id }) => id === page);
  if (!route) {
    return {
      match: false,
      params: null,
    };
  }
  const match = matchPath(route.path, path);
  return {
    match: !!match,
    params: match?.params,
  };
}
