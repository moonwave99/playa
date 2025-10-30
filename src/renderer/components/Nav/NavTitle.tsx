import { Routes, Route, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import styles from "./Nav.module.css";
import api from "@/renderer/api";
import useCollection from "@/renderer/query/useCollection";
import useGroup from "@/renderer/query/useGroup";
import { ReactNode } from "react";

export default function NavTitle() {
  const { t } = useTranslation();
  return (
    <Routes>
      <Route
        path="/"
        element={<DefaultTitle>{t("nav.titles.home")}</DefaultTitle>}
      />
      {["releases", "artists", "collections", "groups"].map((entity) => (
        <Route
          key={entity}
          path={`/${entity}`}
          element={<DefaultTitle>{t(`nav.titles.${entity}`)}</DefaultTitle>}
        />
      ))}
      <Route path="/collections/:id" element={<CollectionTitle />} />
      <Route path="/groups/:id" element={<GroupTitle />} />
      <Route path="*" element={null} />
    </Routes>
  );
}

type DefaultTitleProps = {
  children: ReactNode;
};

function DefaultTitle({ children }: DefaultTitleProps) {
  return (
    <h1 className={styles.title}>
      <span>{children}</span>
    </h1>
  );
}

function GroupTitle() {
  const { id } = useParams();
  const { group, isPending } = useGroup(+id);
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
  const { id } = useParams();
  const { collection, isPending } = useCollection(+id);
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
