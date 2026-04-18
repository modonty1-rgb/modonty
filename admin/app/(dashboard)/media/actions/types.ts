import { MediaType, MediaScope } from "@prisma/client";

export interface MediaFilters {
  clientId?: string;
  includeGeneral?: boolean;
  includePlatform?: boolean;
  scope?: MediaScope;
  mimeType?: string;
  type?: MediaType;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  used?: boolean;
  sort?: string;
  page?: number;
  perPage?: number;
}
