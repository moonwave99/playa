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

import { IoMdCheckmark } from "react-icons/io";
import { IoChevronDownOutline } from "react-icons/io5";
import cx from "clsx";
import styles from "./LookupView.module.css";

type LookupViewProps<T extends HasId> = {
  value?: T;
  query?: string;
  items?: T[];
  allowCustomValue?: boolean;
  className?: string;
  autoFocus?: boolean;
  onChange: (item: T) => void;
  onQueryChange?: (query: string) => void;
  getText: (item: T) => string;
  getCustomValue?: (query: string) => T;
};

export default function LookupView<T extends HasId>({
  value,
  query = "",
  items,
  allowCustomValue,
  className,
  autoFocus,
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
            placeholder={t("lookup.placeholder")}
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
              <IoChevronDownOutline />
            </ComboboxButton>
          ) : null}
        </div>
        {query.length >= 3 && (
          <ComboboxOptions className={styles.LookupViewOptions}>
            {displayCustomInput && (
              <ComboboxOption value={getCustomValue(query)}>
                <span className={cx(styles.LookupViewOption, styles.active)}>
                  {t("lookup.customValue", { value: query })}
                </span>
              </ComboboxOption>
            )}
            {!allowCustomValue && !results?.length && query ? (
              <span className={styles.LookupViewOption}>
                {t("lookup.noResults", { value: query })}
              </span>
            ) : (
              results?.map((x) => (
                <ComboboxOption key={x.id} value={x}>
                  {({ selected, focus }) => (
                    <span
                      className={cx(styles.LookupViewOption, {
                        [styles.focus]: focus,
                      })}
                    >
                      {getText(x)}
                      {selected && <IoMdCheckmark />}
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
