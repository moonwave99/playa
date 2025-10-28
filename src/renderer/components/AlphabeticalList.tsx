import { useTranslation } from "react-i18next";
import type { Artist, Collection, Group } from "@/types/types";
import { getEntityLink } from "@/lib/links";
import { ensurePlural } from "@/lib/utils";
import useRestoreListPosition from "../hooks/useRestoreListPosition";
import useAlphabeticalList from "../query/useAlphabeticalList";
import ErrorView from "./ErrorView";
import Loading from "./Loading";
import List from "./List";
import Link from "./Link";

import cx from "clsx";
import styles from "./AlphabeticalList.module.css";
import pageStyles from "../pages/Page.module.css";

type Item = Artist | Collection | Group;

type AlphabeticalListProps = {
  entity: "artist" | "collection" | "group";
  columns?: number;
};

export default function AlphabeticalList({
  entity,
  columns = 1,
}: AlphabeticalListProps) {
  const { t } = useTranslation();
  const { items, error, isPending } = useAlphabeticalList(entity);

  const { scrollInfo, storeScrollInfo, ref } = useRestoreListPosition({
    key: [`${entity}List`],
  });

  function renderEntry(item: Item) {
    if (item.entityType === "Artist") {
      return <Link to={getEntityLink(item)}>{item.name}</Link>;
    }
    return <Link to={getEntityLink(item)}>{item.title}</Link>;
  }

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  const letters = items.map((x) => x[0]);

  return !items.length ? (
    <div className={pageStyles.placeholder} data-testid="AlphabeticalList">
      {t("placeholders.emptyList", { entity: ensurePlural(entity) })}
    </div>
  ) : (
    <div className={cx(styles.view, styles[`columns-${columns}`])}>
      <div className={styles.letters}>
        {letters.map((x, index) => (
          <button key={x} onClick={() => ref.current.scrollToIndex(index)}>
            {x}
          </button>
        ))}
      </div>
      <List
        ref={ref}
        className={styles.list}
        items={items}
        overscan={1}
        onUnmount={storeScrollInfo}
        columnsConfig={[{ count: 1, width: 400 }]}
        estimateSize={(_, index: number) => ({
          width: "100%",
          height: (Math.floor(items[index][1].length / columns) + 3) * 24,
        })}
        render={({ item }) => (
          <article key={item[0]} data-letter={item[0]}>
            <h3>
              {item[0]} <span className={styles.count}>({item[1].length})</span>
            </h3>
            <ul>
              {item[1].map((entry) => (
                <li key={entry.id}>{renderEntry(entry)}</li>
              ))}
            </ul>
          </article>
        )}
        scrollBehavior={{
          align: "start",
        }}
        scrollInfo={scrollInfo}
        testId="AlphabeticalList"
      />
    </div>
  );
}
