import 'dotenv/config';

// Email delivery via Brevo's HTTPS API.
//
// Why HTTPS and not SMTP: Railway blocks outbound SMTP ports (25/465/587)
// at the network layer, so any nodemailer/Gmail-SMTP path silently times
// out with ETIMEDOUT after ~120s. Brevo's REST endpoint uses port 443,
// bypassing the block entirely.

const { BREVO_API_KEY, EMAIL_FROM } = process.env;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_ACCOUNT_URL = 'https://api.brevo.com/v3/account';

// Sender email. Brevo requires this to match a verified sender on your
// account (verify one at https://app.brevo.com/senders). If EMAIL_FROM is
// unset or unverified, Brevo will either reject the call or replace the
// sender with its own *.brevosend.com subdomain — watch the response body
// in the logs to see what happened.
const SENDER_EMAIL = EMAIL_FROM || 'noreply@ucbb.local';
const SENDER_NAME = 'UC BorrowBox';

// We can only reliably deliver to UofT addresses (Microsoft 365) because
// our Brevo sender is a freemail address that fails DMARC at strict
// receivers like gmail.com. Recipient-domain gate below short-circuits
// send() for non-UofT addresses so we don't burn Brevo quota on mail
// that would be silently dropped.
const UTORONTO_EMAIL_RE = /^[^\s@]+@(mail\.utoronto\.ca|utoronto\.ca)$/i;
export function isUtorontoEmail(email) {
  return UTORONTO_EMAIL_RE.test(String(email || '').trim());
}

console.log('[email] module loaded.', {
  BREVO_API_KEY_set: Boolean(BREVO_API_KEY),
  BREVO_API_KEY_length: BREVO_API_KEY ? BREVO_API_KEY.length : 0,
  BREVO_API_KEY_starts_with_xkeysib_: BREVO_API_KEY ? BREVO_API_KEY.startsWith('xkeysib-') : false,
  BREVO_API_KEY_has_whitespace: BREVO_API_KEY ? /\s/.test(BREVO_API_KEY) : false,
  BREVO_API_KEY_has_quotes: BREVO_API_KEY ? /["']/.test(BREVO_API_KEY) : false,
  EMAIL_FROM_set: Boolean(EMAIL_FROM),
  resolved_sender: { name: SENDER_NAME, email: SENDER_EMAIL },
});

// Startup self-check: hit Brevo's /account endpoint to confirm the key is
// valid and the network path works. 200 → all good. 401 → bad key.
// Non-blocking; errors only logged.
async function verifyBrevoKey() {
  if (!BREVO_API_KEY) {
    console.error('[email] BREVO_API_KEY NOT SET. send() will throw until BREVO_API_KEY is configured.');
    return;
  }
  try {
    const res = await fetch(BREVO_ACCOUNT_URL, {
      headers: { 'api-key': BREVO_API_KEY, accept: 'application/json' },
    });
    const body = await res.text();
    if (res.ok) {
      console.log('[email] Brevo API key verify OK at startup.', { status: res.status, body });
    } else {
      console.error('[email] Brevo API key verify FAILED at startup.', {
        status: res.status,
        statusText: res.statusText,
        body,
      });
    }
  } catch (err) {
    console.error('[email] Brevo startup self-check threw.', {
      errName: err.name,
      errMessage: err.message,
    });
  }
}
verifyBrevoKey();

function wrap(body) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:440px;margin:0 auto;padding:32px 24px;color:#1c1c1e">
    ${body}
    <p style="color:#c7c7cc;font-size:11px;margin:32px 0 0;border-top:1px solid #e5e5ea;padding-top:16px">UC BorrowBox · University College, University of Toronto</p>
  </div>`;
}

async function send(to, subject, html) {
  console.log('[email] send() called.', { to, subject, htmlLength: html.length });

  if (!BREVO_API_KEY) {
    console.error('[email] ABORT: BREVO_API_KEY not set.');
    throw new Error('BREVO_API_KEY not configured');
  }

  if (!isUtorontoEmail(to)) {
    console.log('[email] SKIP: recipient is not a UofT address — sending disabled.', { to, subject });
    return;
  }

  const payload = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  console.log('[email] sending via Brevo HTTPS API.', {
    url: BREVO_API_URL,
    sender: payload.sender,
    to: payload.to,
    subject: payload.subject,
    htmlLength: html.length,
  });

  const startedAt = Date.now();

  let res;
  try {
    res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[email] Brevo fetch threw (network error).', {
      to,
      subject,
      ms: Date.now() - startedAt,
      errName: err.name,
      errMessage: err.message,
      errCause: err.cause && (err.cause.message || String(err.cause)),
    });
    throw err;
  }

  console.log('[email] Brevo HTTP response received.', {
    to,
    subject,
    status: res.status,
    statusText: res.statusText,
    ok: res.ok,
    ms: Date.now() - startedAt,
  });

  const rawBody = await res.text();
  let parsedBody = null;
  try { parsedBody = JSON.parse(rawBody); } catch { /* not JSON — keep raw */ }

  if (!res.ok) {
    console.error('[email] Brevo send FAILED.', {
      to,
      subject,
      status: res.status,
      statusText: res.statusText,
      body: parsedBody || rawBody,
      ms: Date.now() - startedAt,
    });
    throw new Error(`Brevo send failed (${res.status}): ${rawBody}`);
  }

  console.log('[email] Brevo send OK.', {
    to,
    subject,
    status: res.status,
    brevoMessageId: parsedBody && parsedBody.messageId,
    body: parsedBody || rawBody,
    ms: Date.now() - startedAt,
  });
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
