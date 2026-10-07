import type { Dispatch, SetStateAction } from "react";

export function buildSelection<T extends { id: string }>(
  filtered: T[],
  selected: Set<string>,
  setSelected: Dispatch<SetStateAction<Set<string>>>
) {
  const allFilteredSelected = filtered.length > 0 && filtered.every((x) => selected.has(x.id));
  const someSelected = filtered.some((x) => selected.has(x.id));
  const indeterminate = someSelected && !allFilteredSelected;

  function toggleAllFiltered(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((x) => (checked ? next.add(x.id) : next.delete(x.id)));
      return next;
    });
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return { allFilteredSelected, someSelected, indeterminate, toggleAllFiltered, toggleOne };
}
