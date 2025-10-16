import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import api from "./api";

import useArtist from "./query/useArtist";
import useGroup from "./query/useGroup";
import useCollection from "./query/useCollection";
import useRelease from "./query/useRelease";

import HomePage from "./pages/HomePage";
import ReleasesPage from "./pages/ReleasesPage";
import ReleasePage from "./pages/ReleasePage";
import ArtistsPage from "./pages/ArtistsPage";
import ArtistPage from "./pages/ArtistPage";
import CollectionsPage from "./pages/CollectionsPage";
import CollectionPage from "./pages/CollectionPage";
import GroupsPage from "./pages/GroupsPage";
import GroupPage from "./pages/GroupPage";

import { getReleaseTitle } from "@/lib/utils";

import { Icon, type SupportedIcons } from "./icons";

export type Route = {
  path: string;
  id: string;
  element: ReactElement;
  Breadcrumb?: (props: BreadcrumbProps) => ReactElement;
};

type BreadcrumbProps = {
  className?: string;
  isFor?: SupportedIcons;
  id?: number;
};

function BaseBreadcrumb({ className, isFor }: BreadcrumbProps) {
  const { t } = useTranslation();
  return (
    <span className={className}>
      <Icon isFor={isFor} /> {t(`breadcrumbs.${isFor}`)}
    </span>
  );
}

export const routes: Route[] = [
  {
    path: "/",
    id: "home",
    element: <HomePage />,
    Breadcrumb: BaseBreadcrumb,
  },
  {
    path: "/releases",
    id: "release",
    element: <ReleasesPage />,
    Breadcrumb: BaseBreadcrumb,
  },
  {
    path: "/releases/:id",
    id: "releases",
    element: <ReleasePage />,
    Breadcrumb: ReleaseBreadcrumb,
  },
  {
    path: "/artists",
    id: "artists",
    element: <ArtistsPage />,
    Breadcrumb: BaseBreadcrumb,
  },
  {
    path: "/artists/:id",
    id: "artist",
    element: <ArtistPage />,
    Breadcrumb: ArtistBreadcrumb,
  },
  {
    path: "/collections",
    id: "collections",
    element: <CollectionsPage />,
    Breadcrumb: BaseBreadcrumb,
  },
  {
    path: "/collections/:id",
    id: "collection",
    element: <CollectionPage />,
    Breadcrumb: CollectionBreadcrumb,
  },
  {
    path: "/groups",
    id: "groups",
    element: <GroupsPage />,
    Breadcrumb: BaseBreadcrumb,
  },
  {
    path: "/groups/:id",
    id: "group",
    element: <GroupPage />,
    Breadcrumb: GroupBreadcrumb,
  },
];

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
  const { t } = useTranslation();
  const { group, isPending } = useGroup(id);
  if (isPending || !group) {
    return null;
  }
  return (
    <span className={className} onContextMenu={() => api.menu.group(group)}>
      {t("breadcrumbs.group", {
        title: group.title,
        count: group.artists.length,
      })}
    </span>
  );
}

function CollectionBreadcrumb({ id, className }: BreadcrumbProps) {
  const { t } = useTranslation();
  const { collection, isPending } = useCollection(id);
  if (isPending || !collection) {
    return null;
  }
  return (
    <span
      className={className}
      onContextMenu={() => api.menu.collection(collection)}
    >
      {t("breadcrumbs.collection", {
        title: collection.title,
        count: collection.releases.length,
      })}
    </span>
  );
}
