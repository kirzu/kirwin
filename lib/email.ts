import nodemailer from "nodemailer";

export type ContactNotificationPayload = {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  locale: string;
};

/**
 * Send a contact-form notification to the site owner(s).
 *
 * Supports two providers, chosen by environment variables:
 * 1. SendGrid — set SENDGRID_API_KEY and EMAIL_FROM.
 * 2. SMTP — set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.
 *
 * NOTIFICATION_EMAIL is required for both and can contain multiple addresses
 * separated by commas.
 */
export async function sendContactNotification(
  payload: ContactNotificationPayload,
): Promise<void> {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const notificationEmail = process.env.NOTIFICATION_EMAIL;

  if (!notificationEmail) {
    // eslint-disable-next-line no-console
    console.warn("[email] NOTIFICATION_EMAIL is not set; skipping notification");
    return;
  }

  const recipients = notificationEmail
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    // eslint-disable-next-line no-console
    console.warn("[email] no valid notification recipients; skipping notification");
    return;
  }

  const subject = `New contact form message from ${payload.name}`;
  const text = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "Not provided"}`,
    `Locale: ${payload.locale}`,
    "",
    "Message:",
    payload.message,
  ].join("\n");

  const html = `
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(payload.phone || "Not provided")}</p>
    <p><strong>Locale:</strong> ${escapeHtml(payload.locale)}</p>
    <hr />
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-wrap;">${escapeHtml(payload.message)}</p>
  `;

  if (sendgridApiKey && emailFrom) {
    await sendWithSendGrid({
      apiKey: sendgridApiKey,
      from: emailFrom,
      to: recipients,
      replyTo: payload.email,
      subject,
      text,
      html,
    });
    return;
  }

  await sendWithSmtp({
    recipients,
    replyTo: payload.email,
    fromName: `${payload.name} via kirwinbodyworks.com`,
    subject,
    text,
    html,
  });
}

async function sendWithSendGrid({
  apiKey,
  from,
  to,
  replyTo,
  subject,
  text,
  html,
}: {
  apiKey: string;
  from: string;
  to: string[];
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}) {
  // Dynamic import keeps the SendGrid SDK out of the client bundle and
  // avoids loading it when SMTP is configured instead.
  const sgMail = await import("@sendgrid/mail");
  sgMail.default.setApiKey(apiKey);

  await sgMail.default.send({
    from,
    to,
    replyTo,
    subject,
    text,
    html,
  });
}

async function sendWithSmtp({
  recipients,
  replyTo,
  fromName,
  subject,
  text,
  html,
}: {
  recipients: string[];
  replyTo: string;
  fromName: string;
  subject: string;
  text: string;
  html: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    // eslint-disable-next-line no-console
    console.warn("[email] SMTP environment is not configured; skipping notification");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number.parseInt(port, 10),
    secure: Number.parseInt(port, 10) === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"${fromName}" <${user}>`,
    replyTo,
    to: recipients,
    subject,
    text,
    html,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
