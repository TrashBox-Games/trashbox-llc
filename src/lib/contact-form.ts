export type ContactFormData = {
  name: string;
  email: string;
  message: string;
  _honeypot?: string;
  metadata?: Record<string, string>;
};

export type ContactFormResult =
  | { success: true; message: string }
  | { success: false; message: string };

function getContactConfig() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.NEXT_PUBLIC_FORM_API_KEY;
  return { apiUrl, apiKey };
}

export async function submitContactForm(
  data: ContactFormData,
): Promise<ContactFormResult> {
  const { apiUrl, apiKey } = getContactConfig();

  if (!apiUrl || !apiKey) {
    return {
      success: false,
      message:
        "Contact form is not configured (missing NEXT_PUBLIC_API_URL or NEXT_PUBLIC_FORM_API_KEY)",
    };
  }

  const res = await fetch(`${apiUrl}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      message: data.message,
      _honeypot: data._honeypot ?? "",
      metadata: data.metadata,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as { message?: string };

  if (!res.ok) {
    return {
      success: false,
      message: body.message || `Submit failed (${res.status})`,
    };
  }

  return {
    success: true,
    message: body.message || "Transmission received.",
  };
}
