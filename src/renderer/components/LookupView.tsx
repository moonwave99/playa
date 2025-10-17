import { useState } from "react";
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
import { useTranslation } from "react-i18next";

type LookupViewProps<T extends HasId> = {
  value: T;
  items?: T[];
  allowCustomValue?: boolean;
  className?: string;
  onChange: (item: T) => void;
  getText: (item: T) => string;
  getCustomValue?: (query: string) => T;
};

export default function LookupView<T extends HasId>({
  value,
  items,
  allowCustomValue,
  className,
  onChange,
  getText,
  getCustomValue,
}: LookupViewProps<T>) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

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
        onClose={() => setQuery("")}
      >
        <div className={styles.LookupViewInputWrapper}>
          <ComboboxInput
            required
            placeholder={t("lookup.placeholder")}
            className={styles.LookupViewInput}
            onChange={(event) => setQuery(event.target.value)}
            displayValue={getText}
            autoFocus
          />
          <ComboboxButton className={styles.LookupViewButton}>
            <IoChevronDownOutline />
          </ComboboxButton>
        </div>
        <ComboboxOptions className={styles.LookupViewOptions}>
          {displayCustomInput && (
            <ComboboxOption value={getCustomValue(query)}>
              <span className={cx(styles.LookupViewOption, styles.active)}>
                {t("lookup.customValue", { value: query })}
              </span>
            </ComboboxOption>
          )}
          {results?.map((x) => (
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
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
