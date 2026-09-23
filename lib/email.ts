// Sends a plain notification email via Resend's HTTP API.
// Requires RESEND_API_KEY and ADMIN_EMAIL in .env. If either is missing,
// this silently skips sending (booking flow never breaks because of email).
//
// Get a free API key at https://resend.com — the free tier includes a
// shared "onboarding@resend.dev" sender you can use immediately, or verify
// your own domain later.

type NotifyArgs = {
  subject: string;
  lines: string[];
};

export async function notifyAdmin({ subject, lines }: NotifyArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  const from = process.env.RESEND_FROM || "SafarPro <onboarding@resend.dev>";

  if (!apiKey || !adminEmail) {
    console.log("[email] Skipped — RESEND_API_KEY or ADMIN_EMAIL not set in .env");
    return;
  }

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#0a1f4a">${subject}</h2>
      ${lines.map((l) => `<p style="margin:4px 0;color:#333">${l}</p>`).join("")}
      <p style="margin-top:16px">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin"
           style="background:#c9a24b;color:#061230;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600">
          Open admin panel
        </a>
      </p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [adminEmail],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend API error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[email] Failed to send:", err);
  }
}
