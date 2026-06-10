let resend = null;

function getResend() {
  if (!resend) {
    const { Resend } = require('resend');
    const key = process.env.RESEND_API_KEY;
    if (!key || key === 're_placeholder') {
      console.warn('Resend API key not configured. Emails will not be sent.');
      return null;
    }
    resend = new Resend(key);
  }
  return resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const TO_EMAIL = process.env.EMAIL_TO || 'contact@sitevideo.com';

function layout(content) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SiteVideo</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
          <tr>
            <td align="center" style="padding-bottom:24px">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:8px 20px">
                    <span style="color:#fff;font-size:20px;font-weight:800">SV</span>
                    <span style="color:#fff;font-size:20px;font-weight:300;margin-left:4px">SiteVideo</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 4px 12px rgba(0,0,0,0.05)">
              ${content}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;color:#9ca3af;font-size:12px;line-height:1.6">
              <p style="margin:0">SiteVideo — Plateforme multimédia nouvelle génération</p>
              <p style="margin:4px 0 0">Cet email a été envoyé automatiquement depuis notre plateforme.</p>
              <p style="margin:4px 0 0">&copy; ${new Date().getFullYear()} SiteVideo. Tous droits réservés.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function infoRow(label, value) {
  return `
    <tr>
      <td style="padding:8px 16px;border-bottom:1px solid #f3f4f6">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="120" style="font-size:13px;color:#6b7280;font-weight:600;vertical-align:top;padding:4px 0">${label}</td>
            <td style="font-size:14px;color:#111827;padding:4px 0">${value}</td>
          </tr>
        </table>
      </td>
    </tr>`
}

async function sendEmail({ subject, html, to }) {
  const client = getResend();
  if (!client) return null;
  try {
    const { data, error } = await client.emails.send({
      from: `SiteVideo <${FROM_EMAIL}>`,
      to: to || TO_EMAIL,
      subject,
      html
    });
    if (error) {
      console.error('Resend error:', error);
      return null;
    }
    console.log(`Email sent to ${to || TO_EMAIL}: ${subject}`);
    return data;
  } catch (err) {
    console.error('Email send failed:', err.message);
    return null;
  }
}

function contactEmail({ name, email, subject, message }) {
  return sendEmail({
    subject: `Nouveau message de contact — ${name}`,
    html: layout(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:24px">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#6366f1;border-radius:8px;padding:4px 12px">
                  <span style="color:#fff;font-size:12px;font-weight:600">CONTACT</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:24px">
            <h1 style="margin:0;font-size:22px;color:#111827;font-weight:700">Nouveau message de contact</h1>
            <p style="margin:8px 0 0;font-size:14px;color:#6b7280">Un utilisateur vous a envoyé un message via le formulaire de contact.</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f9fafb;border-radius:12px;padding:0;border:1px solid #e5e7eb">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${infoRow('Nom', name)}
              ${infoRow('Email', `<a href="mailto:${email}" style="color:#6366f1;text-decoration:none">${email}</a>`)}
              ${infoRow('Sujet', `<span style="background-color:#e0e7ff;color:#4338ca;font-size:12px;font-weight:500;padding:2px 10px;border-radius:4px">${subject}</span>`)}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top:24px">
            <h2 style="margin:0 0 12px;font-size:15px;color:#374151;font-weight:600">Message</h2>
            <div style="background-color:#f9fafb;border-radius:12px;padding:20px;border:1px solid #e5e7eb;font-size:14px;color:#374151;line-height:1.7;margin:0">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding-top:24px;border-top:1px solid #e5e7eb;margin-top:24px">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#6366f1;border-radius:8px;padding:10px 20px">
                  <a href="mailto:${email}" style="color:#fff;font-size:13px;font-weight:600;text-decoration:none">R&eacute;pondre &agrave; ${name}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `)
  });
}

function testimonialEmail({ name, role, content, rating }) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  return sendEmail({
    subject: `Nouveau témoignage — ${name} (${rating}/5)`,
    html: layout(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:24px">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#f59e0b;border-radius:8px;padding:4px 12px">
                  <span style="color:#fff;font-size:12px;font-weight:600">T&Eacute;MOIGNAGE</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:24px">
            <h1 style="margin:0;font-size:22px;color:#111827;font-weight:700">Nouveau t&eacute;moignage publi&eacute;</h1>
            <p style="margin:8px 0 0;font-size:14px;color:#6b7280">Un utilisateur a partag&eacute; son exp&eacute;rience sur SiteVideo.</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f9fafb;border-radius:12px;padding:0;border:1px solid #e5e7eb">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${infoRow('Nom', name)}
              ${infoRow('Rôle', role || '<span style="color:#9ca3af">Non sp&eacute;cifi&eacute;</span>')}
              ${infoRow('Note', `<span style="color:#f59e0b;font-size:16px;letter-spacing:2px">${stars}</span>`)}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top:24px">
            <h2 style="margin:0 0 12px;font-size:15px;color:#374151;font-weight:600">T&eacute;moignage</h2>
            <div style="background-color:#f9fafb;border-radius:12px;padding:24px;border:1px solid #e5e7eb;font-size:14px;color:#374151;line-height:1.8;font-style:italic;margin:0">
              &ldquo;${content}&rdquo;
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding-top:24px;border-top:1px solid #e5e7eb;margin-top:24px">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#6366f1;border-radius:8px;padding:10px 20px">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/temoignages" style="color:#fff;font-size:13px;font-weight:600;text-decoration:none">Voir sur le site</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `)
  });
}

module.exports = { sendEmail, contactEmail, testimonialEmail };
