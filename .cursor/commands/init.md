# init

Build this project based off of the files in the /stitch folder. If there is no /stitch folder ask the user for the stitch mcp prompt. Build components using shadcn, tailwind, storybook, and the atomic component structure. Use GSAP for some animations unless specified otherwise. Use test driven development. If there is a page footer, add "Web development by Trashbox" to the right of the copyright information and make Trashbox a hyperlink to https://trashbox.io/. If the website will have a contact form, we will use Trashbox's email notifiaction system, here is an example of usage with it.

```typescript
// lib/contact-form.ts

const TRASHBOX_EMAIL_API_URL = "https://api.trashbox.io/submit";
const TRASHBOX_API_KEY = "fapi_their_key_here";

export type ContactFormData = {
  name: string;
  email: string;
  message: string;
  _honeypot?: string;\
  metadata?: Record<string, string>;
};

export type ContactFormResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function submitContactForm(
  data: ContactFormData
): Promise<ContactFormResult> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": API_KEY,
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      message: data.message,
      _honeypot: data._honeypot ?? "",
    }),
  });

  return res.json();
}
```