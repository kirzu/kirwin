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
 * This function is intentionally defensive: if the SMTP environment is not
 * configured, it silently returns so local development without mail creds
 * does not crash the contact form. Any transport-level error is re-thrown
 * so the caller can log it.
 */
export async function sendContactNotification(
  payload: ContactNotificationPayload,
): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.NOTIFICATION_EMAIL;

  if (!host || !port || !user || !pass || !to) {
    // eslint-disable-next-line no-console
    console.warn("[email] SMTP environment is not configured; skipping notification");
    return;
  }

  const recipients = to
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    // eslint-disable-next-line no-console
    console.warn("[email] no valid notification recipients; skipping notification");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number.parseInt(port, 10),
    secure: Number.parseInt(port, 10) === 465,
    auth: { user, pass },
  });

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

  await transporter.sendMail({
    from: `"${payload.name} via kirwinbodyworks.com" <${user}>`,
    replyTo: payload.email,
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
