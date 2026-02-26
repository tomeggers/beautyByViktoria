// Email building blocks using tables + inline styles for broad client compatibility
// (Gmail, Outlook, Yahoo, Apple Mail)

export function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f8f9fa;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;">
    <tr>
      <td align="center" style="padding:20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.08);max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#6B9E7A;padding:25px;text-align:center;">
              <img src="https://beautybyviktoria.com/favicon/favicon/web-app-manifest-192x192.png" alt="Beauty by Viktoria" width="80" height="80" style="display:block;margin:0 auto 12px;border-radius:50%;border:2px solid rgba(255,255,255,0.4);">
              <h1 style="color:white;margin:0;font-size:22px;font-weight:600;letter-spacing:1px;">Beauty by Viktoria</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Beauty Therapy</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:30px 25px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 25px;text-align:center;border-top:1px solid #eee;">
              <p style="color:#555;font-size:13px;margin:0 0 8px;">Need to get in touch?</p>
              <p style="color:#555;font-size:13px;margin:0 0 4px;">
                <a href="mailto:viktoriashouseofbeauty@gmail.com" style="color:#6B9E7A;text-decoration:none;">viktoriashouseofbeauty@gmail.com</a>
              </p>
              <p style="color:#555;font-size:13px;margin:0 0 12px;">
                <a href="tel:021881498" style="color:#6B9E7A;text-decoration:none;">021 881 498</a>
              </p>
              <p style="color:#999;font-size:11px;margin:0;">Beauty by Viktoria &bull; Richmond, New Zealand</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="color:#2a4e3a;font-weight:600;font-size:14px;padding:4px 12px 4px 0;vertical-align:top;white-space:nowrap;">${label}</td>
    <td style="color:#555;font-size:14px;padding:4px 0;vertical-align:top;">${value}</td>
  </tr>`;
}

export function detailBox(rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7f2;border-radius:8px;padding:16px;margin:20px 0;">
    <tr><td style="padding:16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${rows}
      </table>
    </td></tr>
  </table>`;
}

export function highlightBox(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td style="background:#6B9E7A;color:white;padding:15px 20px;border-radius:8px;text-align:center;font-size:16px;font-weight:600;">
        ${text}
      </td>
    </tr>
  </table>`;
}

export function messageBox(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td style="background:#fff9e6;border-left:3px solid #f39c12;padding:15px 20px;border-radius:0 8px 8px 0;">
        <p style="color:#555;font-style:italic;margin:0;font-size:15px;line-height:1.6;">${text}</p>
      </td>
    </tr>
  </table>`;
}

export function h2(text: string): string {
  return `<h2 style="color:#2a4e3a;font-size:20px;margin:0 0 15px;">${text}</h2>`;
}

export function p(text: string): string {
  return `<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 12px;">${text}</p>`;
}
