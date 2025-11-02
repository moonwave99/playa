import { useTranslation } from "react-i18next";
import { SearchableEntities, SearchResult } from "@/types/types";
import { useState, FormEvent } from "react";
import LookupEntityView, {
  type LookupEntityViewProps,
} from "./LookupEntityView";
import cx from "clsx";
import formStyles from "../forms.module.css";

type LookupEntityFormProps = Pick<
  LookupEntityViewProps,
  "allowCustomValue" | "className" | "placeholderText"
> & {
  type: SearchableEntities;
  existingIds?: number[];
  onSubmit: (selectedItem: SearchResult) => void;
};

export default function LookupEntityForm({
  type,
  existingIds = [],
  onSubmit,
  ...rest
}: LookupEntityFormProps) {
  const { t } = useTranslation();
  const [selectedResult, setSelectedResult] = useState<SearchResult>(null);

  function _onSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(selectedResult);
  }

  function onSelect(item: SearchResult) {
    setSelectedResult(item);
  }

  return (
    <form
      onSubmit={_onSubmit}
      className={cx(formStyles.form, formStyles.horizontal)}
    >
      <LookupEntityView
        type={type}
        onSelect={onSelect}
        isEntityIncluded={({ id }) => existingIds.includes(id)}
        {...rest}
      />
      <button className={formStyles.button} disabled={!selectedResult}>
        {t("lookup.actions.add")}
      </button>
    </form>
  );
}
