import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import api from "@/renderer/api";
import { formatEntityType } from "@/lib/utils";
import ListCard, { type Item } from "@/renderer/components/ListCard";
import ErrorView from "@/renderer/components/ErrorView";
import Loading from "@/renderer/components/Loading";

import { Icon } from "@/renderer/icons";
import styles from "./LatestEntriesView.module.css";

type LatestEntriesViewProps<T extends Item> = {
  entity: "artist" | "collection" | "group";
  selectedIndex: number;
  isPending: boolean;
  error: Error;
  entries: T[];
  onEntryClick: (index: number) => void;
};

export default function LatestEntriesView<T extends Item>({
  entity,
  selectedIndex = -1,
  isPending,
  error,
  entries,
  onEntryClick,
}: LatestEntriesViewProps<T>) {
  const { t } = useTranslation();

  if (isPending) {
    return <Loading className={styles.loader} />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  function onContextMenu(item: T) {
    if (item.entityType === "artist") {
      api.menu.artist(item);
    }
    if (item.entityType === "collection") {
      api.menu.collection(item);
    }
    if (item.entityType === "group") {
      api.menu.group(item);
    }
  }

  const formattedEntity = formatEntityType(entity, {
    capital: true,
    plural: true,
  });

  return (
    <section className={styles.view} data-testid={`Latest${formattedEntity}`}>
      <header className={styles.header}>
        <h3>
          <Icon isFor={`pages.${entity}`} />
          <Link to={`/${entity}s`}>
            {t("pages.HomePage.latest", { entity: formattedEntity })}
          </Link>
        </h3>
      </header>
      {!entries?.length ? (
        <div className={styles.placeholder}>
          {t("placeholders.emptyList", { entity: formattedEntity })}
        </div>
      ) : (
        <ul className={styles.list}>
          {entries.map((x, index) => (
            <li key={x.id} data-id={`item-${entity}-${index}`}>
              <ListCard
                onContextMenu={() => onContextMenu(x)}
                hasFocus={selectedIndex === index}
                selected={selectedIndex === index}
                item={x}
                onClick={() => onEntryClick(index)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
