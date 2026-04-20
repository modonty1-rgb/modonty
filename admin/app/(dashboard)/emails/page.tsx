import { EMAIL_TEMPLATES } from "./email-templates-config";
import { getTemplatePreview } from "./actions/preview-email";
import { EmailPreviewClient } from "./components/email-preview-client";

export default async function EmailTemplatesPage() {
  const firstId = EMAIL_TEMPLATES[0].id;
  const { subject, html } = await getTemplatePreview(firstId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold leading-tight">Email Templates</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {EMAIL_TEMPLATES.length} templates · preview with mock data · send test to inbox
        </p>
      </div>
      <EmailPreviewClient
        templates={EMAIL_TEMPLATES}
        initialId={firstId}
        initialSubject={subject}
        initialHtml={html}
      />
    </div>
  );
}
