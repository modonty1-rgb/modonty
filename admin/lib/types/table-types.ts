export type SortableValue = string | number | Date | null | undefined;

export interface TableRowData {
  [key: string]: string | number | Date | null | undefined | { [key: string]: number };
}
