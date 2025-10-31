import { useLocation, matchRoutes, type Params } from "react-router";
import { useTranslation } from "react-i18next";
import Link from "../Link";
import { routes, type Route } from "@/renderer/routes";
import { Icon, SupportedIcons } from "@/renderer/icons";
import { getReleaseTitle } from "@/lib/utils";
import useArtist from "@/renderer/query/useArtist";
import useRelease from "@/renderer/query/useRelease";

import cx from "clsx";
import styles from "./Breadcrumbs.module.css";
import responsiveStyles from "@/renderer/responsive.module.css";

type RouteWithParams = Route & { params: Params };

const breadcrumbsMap = {
  home: BaseBreadcrumb,
  releases: BaseBreadcrumb,
  release: ReleaseBreadcrumb,
  artists: BaseBreadcrumb,
  artist: ArtistBreadcrumb,
  collections: BaseBreadcrumb,
  groups: BaseBreadcrumb,
  collection: BaseBreadcrumb,
  group: BaseBreadcrumb,
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
  useDarkText: boolean;
  isFullHeaderPage: boolean;
};

export default function BreadCrumbs({
  useDarkText,
  isFullHeaderPage,
}: BreadCrumbsProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const breadcrumbs = getBreadCrumbs(location);
  const isDetailPage = !!breadcrumbs.at(-1).params.id;
  const breadCrumbElements = breadcrumbs.map(renderEntry).filter((x) => !!x);

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
      className={cx(styles.view, responsiveStyles.hideOnSmallViewPort, {
        [styles.useDarkText]: useDarkText,
        [styles.isFullHeaderPage]: isFullHeaderPage,
      })}
      data-testid="breadcrumbs"
      role="navigation"
      aria-label="Breadcrumbs"
    >
      {breadCrumbElements.map((entry, index) => (
        <li key={index}>
          <span
            className={cx(styles.breadCrumb, {
              [styles.useDarkText]: useDarkText,
              [styles.isFullHeaderPage]: isFullHeaderPage,
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
      <Icon isFor={isFor} />{" "}
      <span className={responsiveStyles.hideOnMediumViewPort}>
        {t(`breadcrumbs.${isFor}`)}
      </span>
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
