import { SearchableEntities, SearchResult } from "@/types/types";
import { useState, FormEvent } from "react";
import LookupEntityView from "./LookupEntityView";
import cx from "clsx";
import formStyles from "../forms.module.css";

type LookupEntityFormProps = {
  type: SearchableEntities;
  className?: string;
  existingIds?: number[];
  onSubmit: (selectedRelease: SearchResult) => void;
};

export default function LookupEntityForm({
  type,
  existingIds = [],
  className,
  onSubmit,
}: LookupEntityFormProps) {
  const [selectedResult, setSelectedResult] = useState(null);

  function _onSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(selectedResult);
  }

  return (
    <form
      onSubmit={_onSubmit}
      className={cx(formStyles.form, formStyles.horizontal)}
    >
      <LookupEntityView
        className={className}
        type={type}
        onSelect={setSelectedResult}
        filterFn={({ id }) => !existingIds.includes(id)}
      />
      <button className={formStyles.button}>Add</button>
    </form>
  );
}
