import { messages } from "@/lib/i18n/messages";

const text = messages.contact;

interface ContactIntroProps {
  title: string;
  /** The editable intro from the page row; the fallback line shows only while it is empty. */
  html?: string | null;
}

export function ContactIntro({ title, html }: ContactIntroProps) {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      {html ? (
        <div
          className="prose prose-neutral dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-muted-foreground mb-8">{text.fallbackIntro}</p>
      )}
    </>
  );
}
