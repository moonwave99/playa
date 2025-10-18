import { matchPath, matchRoutes } from "react-router";

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
    return false;
  }
  const match = matchPath(route.path, path);
  return !!match;
}

export function getRouteMatch(path: string) {
  const allRoutes = matchRoutes(routes, path);
  return allRoutes ? allRoutes[0] : null;
}
