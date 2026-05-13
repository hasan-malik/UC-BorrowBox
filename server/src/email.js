import nodemailer from 'nodemailer';
import 'dotenv/config';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

const transporter = SMTP_HOST && SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

export async function sendOtpEmail(to, code) {
  if (!transporter) {
    console.log('\n────────── DEV OTP ──────────');
    console.log(`  To:   ${to}`);
    console.log(`  Code: ${code}`);
    console.log('─────────────────────────────\n');
    return;
  }

  await transporter.sendMail({
    from: `UC BorrowBox <${SMTP_USER}>`,
    to,
    subject: 'Your UC BorrowBox verification code',
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:400px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:22px;font-weight:700;color:#1c1c1e;margin:0 0 8px">Verify your email</h2>
        <p style="color:#8e8e93;margin:0 0 24px">Enter this code in UC BorrowBox to complete sign-up.</p>
        <div style="background:#f2f2f7;border-radius:12px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700;color:#1c1c1e">${code}</div>
        <p style="color:#8e8e93;font-size:13px;margin:24px 0 0">Expires in 10 minutes. If you didn't request this, ignore it.</p>
      </div>
    `,
  });
}
