import { Routes, Route, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import styles from "./Nav.module.css";
import api from "@/renderer/api";
import useCollection from "@/renderer/query/useCollection";
import useGroup from "@/renderer/query/useGroup";

export default function NavTitle() {
  const { t } = useTranslation();
  return (
    <Routes>
      <Route
        path="/"
        element={<h1 className={styles.title}>{t("nav.titles.home")}</h1>}
      />
      {["releases", "artists", "collections", "groups"].map((entity) => (
        <Route
          key={entity}
          path={`/${entity}`}
          element={
            <h1 className={styles.title}>{t(`nav.titles.${entity}`)}</h1>
          }
        />
      ))}
      <Route path="/collections/:id" element={<CollectionTitle />} />
      <Route path="/groups/:id" element={<GroupTitle />} />
      <Route path="*" element={null} />
    </Routes>
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
      {group.title}
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
      {collection.title}
    </h1>
  );
}
