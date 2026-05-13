import nodemailer from 'nodemailer';
import 'dotenv/config';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

let transporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendOtpEmail(to, code) {
  const subject = 'Your UC BorrowBox verification code';
  const text = `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`;

  if (!transporter) {
    console.log('\n────────── DEV OTP ──────────');
    console.log(`  To:   ${to}`);
    console.log(`  Code: ${code}`);
    console.log('─────────────────────────────\n');
    return;
  }

  await transporter.sendMail({
    from: SMTP_FROM || 'UC BorrowBox <noreply@ucbb.local>',
    to,
    subject,
    text,
  });
}
