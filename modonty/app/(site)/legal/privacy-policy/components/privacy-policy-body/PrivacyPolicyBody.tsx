import { Suspense } from "react";

import { FormattedDate } from "@/components/date/FormattedDate";
import { messages } from "@/lib/i18n/messages";

const text = messages.privacyPolicy;

interface PrivacyPolicyBodyProps {
  title: string;
  /** Admin-authored HTML from `/modonty/pages/privacy-policy`, or the built-in fallback. */
  html: string;
  /** Absent while the row has never been saved — the line is dropped rather than faked. */
  updatedAt?: Date;
}

/** The readable half of the page: heading, last-updated line, and the policy itself. */
export function PrivacyPolicyBody({ title, html, updatedAt }: PrivacyPolicyBodyProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      {updatedAt && (
        <p className="text-sm text-muted-foreground mb-6">
          {text.lastUpdatedLabel}{" "}
          <Suspense fallback={<span>...</span>}>
            <FormattedDate date={updatedAt} />
          </Suspense>
        </p>
      )}
      <div
        className="space-y-6 text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
