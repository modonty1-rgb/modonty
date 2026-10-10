import { messages } from "@/lib/i18n/messages";

const text = messages.help;

/** The title and the one line under it — the whole visible header of the help centre. */
export function HelpHeader() {
  return (
    <>
      <h1 className="text-h1 mb-6">{text.title}</h1>
      <p className="text-muted-foreground mb-8">{text.intro}</p>
    </>
  );
}
