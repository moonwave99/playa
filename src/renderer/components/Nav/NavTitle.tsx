import { Routes, Route, useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import styles from "./Nav.module.css";
import api from "@/renderer/api";
import useTitle from "@/renderer/hooks/useTitle";
import useCollection from "@/renderer/query/useCollection";
import useGroup from "@/renderer/query/useGroup";

export default function NavTitle() {
  const { t } = useTranslation();

  return (
    <Routes>
      <Route path="/" element={<DefaultTitle title={t("nav.titles.home")} />} />
      {["releases", "artists", "collections", "groups"].map((entity) => (
        <Route
          key={entity}
          path={`/${entity}`}
          element={<DefaultTitle title={t(`nav.titles.${entity}`)} />}
        />
      ))}
      <Route path="/search" element={<SearchTitle />} />
      <Route path="/collections/:id" element={<CollectionTitle />} />
      <Route path="/groups/:id" element={<GroupTitle />} />
      <Route path="*" element={null} />
    </Routes>
  );
}

type DefaultTitleProps = {
  title: string;
};

function DefaultTitle({ title }: DefaultTitleProps) {
  useTitle(title);
  return (
    <h1 className={styles.title}>
      <span>{title}</span>
    </h1>
  );
}

function SearchTitle() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const title = t("nav.titles.search", { query: searchParams.get("query") });
  useTitle(title);
  return (
    <h1 className={styles.title}>
      <span>{title}</span>
    </h1>
  );
}

function GroupTitle() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { group, isPending } = useGroup(+id);

  useTitle(group && t(`nav.titles.group`, group));

  if (isPending || !group) {
    return null;
  }

  return (
    <h1 className={styles.title} onContextMenu={() => api.menu.group(group)}>
      <span>{group.title}</span>
    </h1>
  );
}

function CollectionTitle() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { collection, isPending } = useCollection(+id);

  useTitle(collection && t(`nav.titles.collection`, collection));

  if (isPending || !collection) {
    return null;
  }
  return (
    <h1
      className={styles.title}
      onContextMenu={() => api.menu.collection(collection)}
    >
      <span>{collection.title}</span>
    </h1>
  );
}
