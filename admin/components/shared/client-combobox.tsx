"use client";

import { SearchCombobox } from "./search-combobox";

export interface ClientOption {
  id: string;
  name: string;
  /** Optional number shown at the end of the row (e.g. how many files the client has). */
  count?: number;
}

interface ClientComboboxProps {
  clients: ClientOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  /** Offer «All clients» (value null) at the top. Off for pickers that need one client. */
  allowAll?: boolean;
  placeholder?: string;
  disabled?: boolean;
  busy?: boolean;
  className?: string;
  id?: string;
}

/** The client picker — SearchCombobox with client wording, so every screen says the same. */
export function ClientCombobox({ clients, allowAll = false, placeholder = "Choose a client…", ...rest }: ClientComboboxProps) {
  return (
    <SearchCombobox
      options={clients}
      allLabel={allowAll ? "All clients" : undefined}
      placeholder={placeholder}
      searchPlaceholder="Search clients…"
      ariaLabel="Client"
      {...rest}
    />
  );
}
