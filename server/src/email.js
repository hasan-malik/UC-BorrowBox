import 'dotenv/config';
import nodemailer from 'nodemailer';

const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

console.log('[email] module loaded.', {
  GMAIL_USER_set: Boolean(GMAIL_USER),
  GMAIL_USER_value: GMAIL_USER || '<unset>',
  GMAIL_USER_length: GMAIL_USER ? GMAIL_USER.length : 0,
  GMAIL_APP_PASSWORD_set: Boolean(GMAIL_APP_PASSWORD),
  GMAIL_APP_PASSWORD_length: GMAIL_APP_PASSWORD ? GMAIL_APP_PASSWORD.length : 0,
  GMAIL_APP_PASSWORD_has_whitespace: GMAIL_APP_PASSWORD ? /\s/.test(GMAIL_APP_PASSWORD) : false,
  GMAIL_USER_has_quotes: GMAIL_USER ? /["']/.test(GMAIL_USER) : false,
});

function wrap(body) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:440px;margin:0 auto;padding:32px 24px;color:#1c1c1e">
    ${body}
    <p style="color:#c7c7cc;font-size:11px;margin:32px 0 0;border-top:1px solid #e5e5ea;padding-top:16px">UC BorrowBox · University College, University of Toronto</p>
  </div>`;
}

let gmailTransport = null;
function getGmailTransport() {
  if (!gmailTransport) {
    console.log('[email] creating gmail transport for user:', GMAIL_USER);
    gmailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
      logger: true,
      debug: true,
    });
    gmailTransport.verify((err, success) => {
      if (err) console.error('[email] gmail transport verify FAILED:', err);
      else console.log('[email] gmail transport verify OK:', success);
    });
  }
  return gmailTransport;
}

async function send(to, subject, html) {
  console.log('[email] send() called.', { to, subject });

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error('[email] ABORT: Gmail credentials missing.', {
      GMAIL_USER_set: Boolean(GMAIL_USER),
      GMAIL_APP_PASSWORD_set: Boolean(GMAIL_APP_PASSWORD),
    });
    throw new Error('Gmail credentials not configured');
  }

  console.log('[email] sending via Gmail SMTP...');
  const startedAt = Date.now();
  try {
    const info = await getGmailTransport().sendMail({
      from: `"UC BorrowBox" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('[email] Gmail send OK.', {
      to,
      subject,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      ms: Date.now() - startedAt,
    });
  } catch (err) {
    console.error('[email] Gmail send FAILED.', {
      to,
      subject,
      ms: Date.now() - startedAt,
      errName: err.name,
      errCode: err.code,
      errMessage: err.message,
      errResponse: err.response,
      errResponseCode: err.responseCode,
    });
    throw err;
  }
}

export async function sendOtpEmail(to, code) {
  console.log('[email] sendOtpEmail()', { to, codeLength: String(code).length });
  await send(to, 'Your UC BorrowBox verification code', wrap(`
    <h2 style="font-size:22px;font-weight:700;margin:0 0 8px">Verify your email</h2>
    <p style="color:#8e8e93;margin:0 0 24px">Enter this code in UC BorrowBox to complete sign-up.</p>
    <div style="background:#f2f2f7;border-radius:12px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700">${code}</div>
    <p style="color:#8e8e93;font-size:13px;margin:24px 0 0">Expires in 10 minutes. If you didn't request this, ignore this email.</p>
  `));
}

export async function sendWelcomeEmail(to, name) {
  console.log('[email] sendWelcomeEmail()', { to, name });
  await send(to, 'Welcome to UC BorrowBox', wrap(`
    <h2 style="font-size:22px;font-weight:700;margin:0 0 8px">Welcome, ${name}!</h2>
    <p style="color:#3a3a3c;margin:0 0 16px">Your UC BorrowBox account is verified and ready to go.</p>
    <p style="color:#3a3a3c;margin:0">You can now browse listings, borrow from neighbours, split costs on bulk items, and offer things you no longer need — all within Whitney Hall, Sir Daniel's Residence, and Morrison Residence.</p>
  `));
}

export async function sendLoginAlertEmail(to, name) {
  console.log('[email] sendLoginAlertEmail()', { to, name });
  await send(to, 'New sign-in to UC BorrowBox', wrap(`
    <h2 style="font-size:22px;font-weight:700;margin:0 0 8px">New sign-in</h2>
    <p style="color:#3a3a3c;margin:0 0 16px">Hi ${name}, we noticed a new sign-in to your UC BorrowBox account.</p>
    <p style="color:#8e8e93;font-size:13px;margin:0">If this was you, no action needed. If not, your account may be compromised — change your password immediately.</p>
  `));
}

export async function sendListingPostedEmail(to, name, { type, title }) {
  console.log('[email] sendListingPostedEmail()', { to, name, type, title });
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
  console.log('[email] sendReplyNotificationEmail()', { to, ownerName, commenterName, listingTitle });
  await send(to, `${commenterName} replied to your listing`, wrap(`
    <h2 style="font-size:22px;font-weight:700;margin:0 0 8px">New reply</h2>
    <p style="color:#3a3a3c;margin:0 0 20px">Hi ${ownerName}, <strong>${commenterName}</strong> replied to your listing <strong>"${listingTitle}"</strong>:</p>
    <div style="background:#f2f2f7;border-radius:12px;padding:16px 20px;margin:0 0 16px;font-size:15px;color:#1c1c1e;white-space:pre-wrap">${commentBody}</div>
    <p style="color:#8e8e93;font-size:13px;margin:0">Sign in to UC BorrowBox to reply.</p>
  `));
}
