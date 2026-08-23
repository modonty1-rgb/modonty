import { EMAIL_BRAND_AR, EMAIL_COLORS } from "./email-theme";
import { emailHeader } from "./parts/email-header";
import { emailFooter } from "./parts/email-footer";

const { lightGray, border } = EMAIL_COLORS;

/**
 * The ONE email shell for the whole repo: `emailHeader()` + the template's content +
 * `emailFooter()`, inside the 600px card every mail client understands.
 *
 * `async` because the footer reads the legal registry from the database itself, so every
 * email carries it by construction. The previous design handed the footer to the caller as
 * an optional third argument — and 9 of 10 templates never passed it (MAILREV, 23 Aug).
 */
export async function baseTemplate(content: string, previewText = ""): Promise<string> {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${EMAIL_BRAND_AR}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${lightGray};font-family:Arial,Helvetica,sans-serif;direction:rtl;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${lightGray};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid ${border};">

          <!-- HEADER -->
          ${emailHeader()}

          <!-- CONTENT -->
          <tr>
            <td style="padding:36px 32px;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          ${await emailFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
