const NAVY = "#0E065A";
const BLUE = "#3030FF";
const TEAL = "#00D8D8";
const GRAY = "#5b5b5b";
const LIGHT_GRAY = "#f5f5f5";
const BORDER = "#dbdbdb";

export function baseTemplate(content: string, previewText = ""): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>مودونتي — الأدمن</title>
</head>
<body style="margin:0;padding:0;background-color:${LIGHT_GRAY};font-family:Arial,Helvetica,sans-serif;direction:rtl;">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${LIGHT_GRAY};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
          <tr>
            <td style="background-color:#ffffff;padding:28px 32px;text-align:center;border-bottom:3px solid ${NAVY};">
              <img src="https://res.cloudinary.com/dfegnpgwx/image/upload/v1769683590/modontyLogo_ftf4yf.png" alt="مودونتي" width="160" height="auto" style="display:inline-block;max-height:56px;object-fit:contain;" />
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:${LIGHT_GRAY};padding:20px 32px;border-top:1px solid ${BORDER};text-align:center;">
              <p style="margin:0;font-size:12px;color:${GRAY};">هذا إيميل آلي من نظام مودونتي — لا ترد عليه.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="background-color:${BLUE};border-radius:6px;">
        <a href="${url}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">${text}</a>
      </td>
    </tr>
  </table>`;
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${BORDER};margin:24px 0;" />`;
}

export function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:20px;font-weight:bold;color:${NAVY};">${text}</h1>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#333;">${text}</p>`;
}

export function badge(text: string, color: string = TEAL): string {
  return `<span style="display:inline-block;background-color:${color};color:#fff;font-size:11px;font-weight:bold;padding:3px 10px;border-radius:12px;">${text}</span>`;
}

export function warningBox(text: string): string {
  return `<div style="background-color:#fff8e1;border-right:4px solid #f59e0b;padding:12px 16px;border-radius:4px;margin:16px 0;">
    <p style="margin:0;font-size:13px;color:#92400e;direction:rtl;">${text}</p>
  </div>`;
}
