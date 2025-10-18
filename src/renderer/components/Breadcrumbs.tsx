import { useLocation, matchRoutes, type Params } from "react-router";
import { useTranslation } from "react-i18next";
import Link from "./Link";
import { routes, type Route } from "../routes";
import cx from "clsx";
import styles from "./Breadcrumbs.module.css";
import { Icon, SupportedIcons } from "../icons";
import { getReleaseTitle } from "@/lib/utils";
import api from "../api";
import useArtist from "../query/useArtist";
import useCollection from "../query/useCollection";
import useGroup from "../query/useGroup";
import useRelease from "../query/useRelease";

type RouteWithParams = Route & { params: Params };

const breadcrumbsMap = {
  home: BaseBreadcrumb,
  releases: BaseBreadcrumb,
  release: ReleaseBreadcrumb,
  artists: BaseBreadcrumb,
  artist: ArtistBreadcrumb,
  collections: BaseBreadcrumb,
  collection: CollectionBreadcrumb,
  groups: BaseBreadcrumb,
  group: GroupBreadcrumb,
};

function getBreadCrumbs(location: ReturnType<typeof useLocation>) {
  const allRoutes = matchRoutes(routes, location);
  const matchedRoute = allRoutes ? allRoutes[0] : null;

  if (!matchedRoute) {
    return [];
  }

  return routes
    .filter((x) => matchedRoute.route.path.includes(x.path))
    .map(({ path, ...rest }) => ({
      params: matchedRoute.params,
      path: Object.keys(matchedRoute.params).length
        ? Object.keys(matchedRoute.params).reduce(
            (path, param) =>
              path.replace(`:${param}`, matchedRoute.params[param] as string),
            path
          )
        : path,
      ...rest,
    }));
}

type BreadCrumbsProps = {
  isDetailPage: boolean;
  useDarkText: boolean;
};

export default function BreadCrumbs({
  isDetailPage,
  useDarkText,
}: BreadCrumbsProps) {
  const location = useLocation();
  const breadcrumbs = getBreadCrumbs(location)
    .map(renderEntry)
    .filter((x) => !!x);
  const { t } = useTranslation();

  function renderEntry(
    { path, id, params }: RouteWithParams,
    index: number,
    entries: RouteWithParams[]
  ) {
    const isLast = index == entries.length - 1;
    if (isLast && isDetailPage) {
      return null;
    }

    const Breadcrumb = breadcrumbsMap[id as keyof typeof breadcrumbsMap];

    const output = Breadcrumb ? (
      <Breadcrumb
        id={+params.id}
        isFor={id as SupportedIcons}
        className={styles.content}
      />
    ) : (
      t(`breadcrumbs.${id}`)
    );
    if (isLast) {
      return output;
    }
    return <Link to={path}>{output}</Link>;
  }

  return (
    <ul
      className={cx(styles.view, {
        [styles.useDarkText]: useDarkText,
        [styles.isDetailPage]: isDetailPage,
      })}
      data-testid="breadcrumbs"
      role="navigation"
      aria-label="Breadcrumbs"
    >
      {breadcrumbs.map((entry, index) => (
        <li key={index}>
          <span
            className={cx(styles.breadCrumb, {
              [styles.useDarkText]: useDarkText,
              [styles.isDetailPage]: isDetailPage,
            })}
          >
            {entry}
          </span>
        </li>
      ))}
    </ul>
  );
}

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
