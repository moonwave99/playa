import { useLocation, matchRoutes, type Params } from "react-router";
import Link from "./Link";
import { routes, type Route } from "../routes";
import styles from "./Breadcrumbs.module.css";

type RouteWithParams = Route & { params: Params };

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
};

export default function BreadCrumbs({ isDetailPage }: BreadCrumbsProps) {
  const location = useLocation();
  const breadcrumbs = getBreadCrumbs(location)
    .map(renderEntry)
    .filter((x) => !!x);

  function renderEntry(
    { path, name, renderBreadcrumb, params }: RouteWithParams,
    index: number,
    entries: RouteWithParams[]
  ) {
    const isLast = index == entries.length - 1;
    if (isLast && isDetailPage) {
      return null;
    }
    const output = renderBreadcrumb
      ? renderBreadcrumb({
          id: +params.id,
          className: styles.content,
        })
      : name;
    if (isLast) {
      return output;
    }
    return <Link to={path}>{output}</Link>;
  }

  return (
    <ul className={styles.view}>
      {breadcrumbs.map((entry, index) => (
        <li key={index}>
          <span className={styles.breadCrumb}>{entry}</span>
        </li>
      ))}
    </ul>
  );
}
