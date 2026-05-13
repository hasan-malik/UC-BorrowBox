import nodemailer from 'nodemailer';
import 'dotenv/config';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

const transporter = SMTP_HOST && SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 465),
      secure: Number(SMTP_PORT || 465) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    })
  : null;

function wrap(body) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:440px;margin:0 auto;padding:32px 24px;color:#1c1c1e">
    ${body}
    <p style="color:#c7c7cc;font-size:11px;margin:32px 0 0;border-top:1px solid #e5e5ea;padding-top:16px">UC BorrowBox · University College, University of Toronto</p>
  </div>`;
}

async function send(to, subject, html) {
  if (!transporter) {
    console.log(`\n── EMAIL (dev) ── To: ${to} | Subject: ${subject}\n`);
    return;
  }
  await transporter.sendMail({ from: `UC BorrowBox <${SMTP_USER}>`, to, subject, html });
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
