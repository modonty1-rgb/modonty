import { messages } from "@/lib/i18n/messages";

const text = messages.feedback;

/** Title and the line that explains why the form below is worth filling. */
export function FeedbackIntro() {
  return (
    <>
      <h1 className="text-h1 mb-6">{text.title}</h1>
      <p className="text-muted-foreground mb-8">{text.intro}</p>
    </>
  );
}
