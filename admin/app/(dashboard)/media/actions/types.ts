import { MediaType } from "@prisma/client";

export interface MediaFilters {
  clientId?: string;
  mimeType?: string;
  type?: MediaType;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  used?: boolean;
}
