import { useTranslation } from "react-i18next";
import { HasId, SearchResult } from "@/types/types";
import { useState, FormEvent } from "react";
import LookupEntityView, {
  type LookupEntityViewProps,
} from "./LookupEntityView";
import cx from "clsx";
import formStyles from "@/renderer/forms.module.css";

type LookupEntityFormProps = Pick<
  LookupEntityViewProps,
  "allowCustomValue" | "className" | "placeholderText" | "type" | "renderInfo"
> & {
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
    (event.target as HTMLFormElement).reset();
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
        isEntityIncluded={({ id }: HasId) => existingIds.includes(id)}
        {...rest}
      />
      <button
        className={cx(formStyles.button, formStyles.primary)}
        disabled={!selectedResult}
      >
        {t("lookup.actions.add")}
      </button>
    </form>
  );
}
