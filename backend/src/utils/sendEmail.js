const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, APP_NAME } = process.env;

  // Dev fallback: if SMTP not configured, print email to console
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('\n[DEV EMAIL] =======================');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:\n', html);
    console.log('===================================\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"${APP_NAME || 'App'}" <${SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };
