const RESEND_API = "https://api.resend.com/emails";
const FROM = "NextMove AI <onboarding@resend.dev>";

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not configured, skipping email");
    return false;
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[email] Failed to send:", text);
      return false;
    }

    return true;
  } catch (e) {
    console.error("[email] Error:", e);
    return false;
  }
}
