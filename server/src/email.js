import { Resend } from 'resend';
import 'dotenv/config';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendOtpEmail(to, code) {
  if (!resend) {
    console.log('\n────────── DEV OTP ──────────');
    console.log(`  To:   ${to}`);
    console.log(`  Code: ${code}`);
    console.log('─────────────────────────────\n');
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM || 'UC BorrowBox <onboarding@resend.dev>',
    to: [to],
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
