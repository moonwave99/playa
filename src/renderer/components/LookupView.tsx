import { useTranslation } from "react-i18next";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import type { HasId } from "@/types/types";
import { lowerCaseCompare } from "@/lib/utils";
import { Icon } from "../icons";
import cx from "clsx";
import styles from "./LookupView.module.css";

export type LookupViewProps<T extends HasId> = {
  value?: T;
  query?: string;
  items?: T[];
  allowCustomValue?: boolean;
  className?: string;
  isFetching?: boolean;
  autoFocus?: boolean;
  fixedList?: boolean;
  placeholderText?: string;
  isEntityIncluded?: (item: T) => boolean;
  onChange: (item: T) => void;
  onQueryChange?: (query: string) => void;
  getText: (item: T) => string;
  getCustomValue?: (query: string) => T;
};

const MIN_QUERY_LENGTH = 3;

export default function LookupView<T extends HasId>({
  value,
  query = "",
  items,
  allowCustomValue,
  className,
  isFetching,
  autoFocus,
  fixedList,
  placeholderText,
  isEntityIncluded,
  onChange,
  onQueryChange,
  getText,
  getCustomValue,
}: LookupViewProps<T>) {
  const { t } = useTranslation();

  const results =
    query === ""
      ? items
      : items.filter((x) => lowerCaseCompare(getText(x), query));

  const displayCustomInput =
    allowCustomValue && query.length > 0 && !results.length;

  return (
    <div className={cx(styles.LookupView, className)}>
      <Combobox
        value={value}
        by="id"
        onChange={onChange}
        onClose={() => onQueryChange("")}
      >
        <div className={styles.LookupViewInputWrapper}>
          <ComboboxInput
            required
            placeholder={placeholderText || t("lookup.placeholder")}
            className={styles.LookupViewInput}
            onChange={(event) => {
              if (!onQueryChange) {
                return;
              }
              onQueryChange(event.target.value);
            }}
            displayValue={getText}
            autoFocus={autoFocus}
          />
          {results?.length ? (
            <ComboboxButton className={styles.LookupViewButton}>
              <Icon isFor="lookup.open" />
            </ComboboxButton>
          ) : null}
        </div>
        {(fixedList || query.length >= MIN_QUERY_LENGTH) && (
          <ComboboxOptions className={styles.LookupViewOptions}>
            {displayCustomInput && (
              <ComboboxOption value={getCustomValue(query)}>
                <span className={cx(styles.LookupViewOption, styles.active)}>
                  {t("lookup.customValue", { value: query })}
                </span>
              </ComboboxOption>
            )}
            {!allowCustomValue && !results?.length && query && !isFetching ? (
              <span className={styles.LookupViewOption}>
                {t("lookup.noResults", { value: query })}
              </span>
            ) : (
              results
                ?.map((x) => ({
                  ...x,
                  included: isEntityIncluded ? isEntityIncluded(x) : false,
                }))
                .map((x) => (
                  <ComboboxOption key={x.id} value={x} disabled={x.included}>
                    {({ selected, focus }) => (
                      <span
                        className={cx(styles.LookupViewOption, {
                          [styles.focus]: focus,
                          [styles.included]: x.included,
                        })}
                      >
                        {getText(x)}
                        {(selected || x.included) && (
                          <Icon isFor="common.checked" />
                        )}
                      </span>
                    )}
                  </ComboboxOption>
                ))
            )}
          </ComboboxOptions>
        )}
      </Combobox>
    </div>
  );
}
