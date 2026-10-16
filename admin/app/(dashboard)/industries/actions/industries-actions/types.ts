export interface IndustryFilters {
  /** صفحة القائمة تمرّره لتعرض المؤرشف (وتُرجعه منها)؛ الاختيارات تتركه فيختفي. */
  includeArchived?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  minClientCount?: number;
  maxClientCount?: number;
  hasClients?: boolean;
  search?: string;
}
