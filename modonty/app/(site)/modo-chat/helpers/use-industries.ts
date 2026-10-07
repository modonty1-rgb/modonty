import { useEffect, type Dispatch, type SetStateAction } from "react";

import type { Industry } from "./chat-types";

/** The industries to offer on an empty chat — none while an article sets the scope. */
export function useIndustries({
  articleSlug,
  setIndustries,
  setIndustriesLoading,
}: {
  articleSlug: string | null;
  setIndustries: Dispatch<SetStateAction<Industry[]>>;
  setIndustriesLoading: Dispatch<SetStateAction<boolean>>;
}) {
  useEffect(() => {
    if (!articleSlug) {
      setIndustriesLoading(true);
      fetch("/modo-chat/api/industries")
        .then((res) => res.json())
        .then((data) => data.industries && setIndustries(data.industries))
        .catch(() => setIndustries([]))
        .finally(() => setIndustriesLoading(false));
    } else {
      setIndustries([]);
    }
  }, [articleSlug]);
}
