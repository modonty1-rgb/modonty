export interface FilterOption {
  name: string;
  slug: string;
  count: number;
  logo?: string;
  industry?: string;
}

export interface ClientServiceAction {
  id: string;
  visual: "booking" | "shop";
}
