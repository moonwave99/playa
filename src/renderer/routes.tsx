import type { ReactElement } from "react";

import HomePage from "./pages/HomePage";
import ReleasesPage from "./pages/ReleasesPage";
import ReleasePage from "./pages/ReleasePage";
import ArtistsPage from "./pages/ArtistsPage";
import ArtistPage from "./pages/ArtistPage";
import CollectionsPage from "./pages/CollectionsPage";
import CollectionPage from "./pages/CollectionPage";
import GroupsPage from "./pages/GroupsPage";
import GroupPage from "./pages/GroupPage";

import api from "./api";

import useArtist from "./query/useArtist";
import useGroup from "./query/useGroup";
import useCollection from "./query/useCollection";
import useRelease from "./query/useRelease";

import { getReleaseTitle } from "@/lib/utils";

import { GoHomeFill } from "react-icons/go";

export type Route = {
  path: string;
  name: string;
  element: ReactElement;
  renderBreadcrumb?: (props: BreadcrumbProps) => ReactElement;
};

export const routes: Route[] = [
  {
    path: "/",
    name: "",
    element: <HomePage />,
    renderBreadcrumb: ({ className }) => (
      <span className={className}>
        <GoHomeFill /> Library
      </span>
    ),
  },
  {
    path: "/releases",
    name: "Releases",
    element: <ReleasesPage />,
  },
  {
    path: "/releases/:id",
    name: "",
    element: <ReleasePage />,
    renderBreadcrumb: (props) => <ReleaseBreadcrumb {...props} />,
  },
  {
    path: "/artists",
    name: "Artists",
    element: <ArtistsPage />,
  },
  {
    path: "/artists/:id",
    name: "",
    element: <ArtistPage />,
    renderBreadcrumb: (props) => <ArtistBreadcrumb {...props} />,
  },
  {
    path: "/collections",
    name: "Collections",
    element: <CollectionsPage />,
  },
  {
    path: "/collections/:id",
    name: "",
    element: <CollectionPage />,
    renderBreadcrumb: (props) => <CollectionBreadcrumb {...props} />,
  },
  {
    path: "/groups",
    name: "Groups",
    element: <GroupsPage />,
  },
  {
    path: "/groups/:id",
    name: "",
    element: <GroupPage />,
    renderBreadcrumb: (props) => <GroupBreadcrumb {...props} />,
  },
];

type BreadcrumbProps = {
  id: number;
  className?: string;
};

function ReleaseBreadcrumb({ id, className }: BreadcrumbProps) {
  const { release, isPending } = useRelease({ id });
  if (isPending || !release) {
    return null;
  }
  return (
    <span className={className}>
      {release.artist.name} - {getReleaseTitle(release)}
    </span>
  );
}

function ArtistBreadcrumb({ id, className }: BreadcrumbProps) {
  const { artist, isPending } = useArtist(id);
  if (isPending || !artist) {
    return null;
  }
  return <span className={className}>{artist.name}</span>;
}

function GroupBreadcrumb({ id, className }: BreadcrumbProps) {
  const { group, isPending } = useGroup(id);
  if (isPending || !group) {
    return null;
  }
  return (
    <span className={className} onContextMenu={() => api.menu.group(group)}>
      <span>{group.title}</span>
      <span>({group.artists.length} artists)</span>
    </span>
  );
}

function CollectionBreadcrumb({ id, className }: BreadcrumbProps) {
  const { collection, isPending } = useCollection(id);
  if (isPending || !collection) {
    return null;
  }
  return (
    <span
      className={className}
      onContextMenu={() => api.menu.collection(collection)}
    >
      <span>{collection.title}</span>
      <span>({collection.releases.length} releases)</span>
    </span>
  );
}
