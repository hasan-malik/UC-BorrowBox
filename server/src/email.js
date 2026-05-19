import 'dotenv/config';
import nodemailer from 'nodemailer';

const { GMAIL_USER, GMAIL_APP_PASSWORD, BREVO_API_KEY, EMAIL_FROM } = process.env;

function wrap(body) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:440px;margin:0 auto;padding:32px 24px;color:#1c1c1e">
    ${body}
    <p style="color:#c7c7cc;font-size:11px;margin:32px 0 0;border-top:1px solid #e5e5ea;padding-top:16px">UC BorrowBox · University College, University of Toronto</p>
  </div>`;
}

// Lazy singleton — only build the transport once GMAIL creds are present.
let gmailTransport = null;
function getGmailTransport() {
  if (!gmailTransport) {
    gmailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });
  }
  return gmailTransport;
}

// Email provider boundary. Priority: Gmail SMTP → Brevo (legacy) → dev log.
async function send(to, subject, html) {
  if (GMAIL_USER && GMAIL_APP_PASSWORD) {
    await getGmailTransport().sendMail({
      from: `"UC BorrowBox" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return;
  }

  if (BREVO_API_KEY) {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'UC BorrowBox', email: EMAIL_FROM || 'noreply@ucbb.local' },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Brevo send failed (${res.status}): ${detail}`);
    }
    return;
  }

  console.log(`\n── EMAIL (dev) ── To: ${to} | Subject: ${subject}\n`);
}

export async function sendOtpEmail(to, code) {
  await send(to, 'Your UC BorrowBox verification code', wrap(`
    <h2 style="font-size:22px;font-weight:700;margin:0 0 8px">Verify your email</h2>
    <p style="color:#8e8e93;margin:0 0 24px">Enter this code in UC BorrowBox to complete sign-up.</p>
    <div style="background:#f2f2f7;border-radius:12px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700">${code}</div>
    <p style="color:#8e8e93;font-size:13px;margin:24px 0 0">Expires in 10 minutes. If you didn't request this, ignore this email.</p>
  `));
}

export async function sendWelcomeEmail(to, name) {
  await send(to, 'Welcome to UC BorrowBox', wrap(`
    <h2 style="font-size:22px;font-weight:700;margin:0 0 8px">Welcome, ${name}!</h2>
    <p style="color:#3a3a3c;margin:0 0 16px">Your UC BorrowBox account is verified and ready to go.</p>
    <p style="color:#3a3a3c;margin:0">You can now browse listings, borrow from neighbours, split costs on bulk items, and offer things you no longer need — all within Whitney Hall, Sir Daniel's Residence, and Morrison Residence.</p>
  `));
}

export async function sendLoginAlertEmail(to, name) {
  await send(to, 'New sign-in to UC BorrowBox', wrap(`
    <h2 style="font-size:22px;font-weight:700;margin:0 0 8px">New sign-in</h2>
    <p style="color:#3a3a3c;margin:0 0 16px">Hi ${name}, we noticed a new sign-in to your UC BorrowBox account.</p>
    <p style="color:#8e8e93;font-size:13px;margin:0">If this was you, no action needed. If not, your account may be compromised — change your password immediately.</p>
  `));
}

export async function sendListingPostedEmail(to, name, { type, title }) {
  const typeLabel = { borrow: 'Borrow', cobuy: 'Co-buy', offer: 'Offer' }[type] || type;
  await send(to, `Your listing is live — "${title}"`, wrap(`
    <h2 style="font-size:22px;font-weight:700;margin:0 0 8px">Listing posted</h2>
    <p style="color:#3a3a3c;margin:0 0 20px">Hi ${name}, your <strong>${typeLabel}</strong> listing is now live on UC BorrowBox.</p>
    <div style="background:#f2f2f7;border-radius:12px;padding:16px 20px;margin:0 0 16px">
      <p style="font-weight:600;margin:0 0 4px;font-size:15px">${title}</p>
      <p style="color:#8e8e93;font-size:13px;margin:0">${typeLabel}</p>
    </div>
    <p style="color:#8e8e93;font-size:13px;margin:0">Neighbours can now reply to your listing. You'll get an email when they do.</p>
  `));
}

export async function sendReplyNotificationEmail(to, ownerName, { commenterName, listingTitle, commentBody }) {
  await send(to, `${commenterName} replied to your listing`, wrap(`
    <h2 style="font-size:22px;font-weight:700;margin:0 0 8px">New reply</h2>
    <p style="color:#3a3a3c;margin:0 0 20px">Hi ${ownerName}, <strong>${commenterName}</strong> replied to your listing <strong>"${listingTitle}"</strong>:</p>
    <div style="background:#f2f2f7;border-radius:12px;padding:16px 20px;margin:0 0 16px;font-size:15px;color:#1c1c1e;white-space:pre-wrap">${commentBody}</div>
    <p style="color:#8e8e93;font-size:13px;margin:0">Sign in to UC BorrowBox to reply.</p>
  `));
}
