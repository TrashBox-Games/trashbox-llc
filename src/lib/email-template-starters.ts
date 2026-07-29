/**
 * Client-side starter catalog for the template gallery.
 * Starters seed the editor only — saving creates a real account template.
 */

export type EmailTemplateStarterCategory =
  | "basic"
  | "followup"
  | "welcome"
  | "quotes"
  | "notification";

export type EmailTemplateStarterThumbnail =
  | "blank"
  | "one_column"
  | "two_column"
  | "two_column_image"
  | "text";

export interface EmailTemplateStarter {
  id: string;
  name: string;
  category: EmailTemplateStarterCategory;
  subject?: string;
  bodyText: string;
  bodyHtml: string;
  thumbnail: EmailTemplateStarterThumbnail;
}

export interface EmailTemplateStarterCategoryNav {
  id: "all" | EmailTemplateStarterCategory;
  label: string;
}

export const EMAIL_TEMPLATE_STARTER_CATEGORIES: readonly EmailTemplateStarterCategoryNav[] =
  [
    { id: "all", label: "All" },
    { id: "basic", label: "Basic" },
    { id: "followup", label: "Follow-up" },
    { id: "welcome", label: "Welcome" },
    { id: "quotes", label: "Quotes" },
    { id: "notification", label: "Notification" },
  ] as const;

const PLACEHOLDER_LINE =
  '<div style="height:10px;background:#d4d4d4;border-radius:2px;margin:6px 0;"></div>';
const PLACEHOLDER_SHORT =
  '<div style="height:10px;width:60%;background:#d4d4d4;border-radius:2px;margin:6px 0;"></div>';
const IMAGE_BLOCK =
  '<div style="height:72px;background:#c4c4c4;border-radius:2px;margin-bottom:10px;"></div>';

function layoutParagraphs(...html: string[]): string {
  return html.join("");
}

export const EMAIL_TEMPLATE_STARTERS: readonly EmailTemplateStarter[] = [
  {
    id: "basic-blank",
    name: "Blank",
    category: "basic",
    subject: "",
    bodyText: "",
    bodyHtml: "<p><br /></p>",
    thumbnail: "blank",
  },
  {
    id: "basic-one-column",
    name: "One column",
    category: "basic",
    subject: "",
    bodyText:
      "Heading\n\nWrite your message here.\n\nAdd another paragraph below.",
    bodyHtml: layoutParagraphs(
      "<h2 style=\"margin:0 0 12px;font-size:18px;color:#111;\">Heading</h2>",
      "<p style=\"margin:0 0 12px;line-height:1.5;color:#333;\">Write your message here.</p>",
      "<p style=\"margin:0;line-height:1.5;color:#333;\">Add another paragraph below.</p>",
    ),
    thumbnail: "one_column",
  },
  {
    id: "basic-two-column",
    name: "Two column",
    category: "basic",
    subject: "",
    bodyText: "Left column\nDetails go here.\n\nRight column\nDetails go here.",
    bodyHtml: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
  <tr>
    <td width="50%" valign="top" style="padding-right:12px;">
      <p style="margin:0 0 8px;font-weight:600;color:#111;">Left column</p>
      <p style="margin:0;line-height:1.5;color:#333;">Details go here.</p>
    </td>
    <td width="50%" valign="top" style="padding-left:12px;">
      <p style="margin:0 0 8px;font-weight:600;color:#111;">Right column</p>
      <p style="margin:0;line-height:1.5;color:#333;">Details go here.</p>
    </td>
  </tr>
</table>`,
    thumbnail: "two_column",
  },
  {
    id: "basic-two-column-image",
    name: "Two column with image",
    category: "basic",
    subject: "",
    bodyText:
      "[Add an image above]\n\nLeft column\nDetails go here.\n\nRight column\nDetails go here.",
    bodyHtml: `${IMAGE_BLOCK}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
  <tr>
    <td width="50%" valign="top" style="padding-right:12px;">
      <p style="margin:0 0 8px;font-weight:600;color:#111;">Left column</p>
      <p style="margin:0;line-height:1.5;color:#333;">Details go here.</p>
    </td>
    <td width="50%" valign="top" style="padding-left:12px;">
      <p style="margin:0 0 8px;font-weight:600;color:#111;">Right column</p>
      <p style="margin:0;line-height:1.5;color:#333;">Details go here.</p>
    </td>
  </tr>
</table>`,
    thumbnail: "two_column_image",
  },
  {
    id: "followup-check-in",
    name: "Follow-up check-in",
    category: "followup",
    subject: "Following up on your inquiry",
    bodyText: `Hi {{lead.first_name}},

Just checking in on your recent inquiry with {{business.name}}. Happy to answer any questions or help you take the next step.

{{sender.name}}`,
    bodyHtml: `<p>Hi {{lead.first_name}},</p>
<p>Just checking in on your recent inquiry with {{business.name}}. Happy to answer any questions or help you take the next step.</p>
<p>{{sender.name}}</p>`,
    thumbnail: "text",
  },
  {
    id: "followup-no-answer",
    name: "Tried reaching you",
    category: "followup",
    subject: "Trying to reach you",
    bodyText: `Hi {{lead.first_name}},

We tried reaching you today ({{date.today}}). Reply here whenever you have a moment and we'll find a time that works.

{{sender.name}}
{{business.name}}`,
    bodyHtml: `<p>Hi {{lead.first_name}},</p>
<p>We tried reaching you today ({{date.today}}). Reply here whenever you have a moment and we'll find a time that works.</p>
<p>{{sender.name}}<br />{{business.name}}</p>`,
    thumbnail: "text",
  },
  {
    id: "welcome-thanks",
    name: "Thanks for reaching out",
    category: "welcome",
    subject: "Thanks for contacting {{business.name}}",
    bodyText: `Hi {{lead.first_name}},

Thanks for reaching out to {{business.name}}. We've received your message and will get back to you shortly.

If you need anything in the meantime, just reply to this email.

{{sender.name}}`,
    bodyHtml: `<p>Hi {{lead.first_name}},</p>
<p>Thanks for reaching out to {{business.name}}. We've received your message and will get back to you shortly.</p>
<p>If you need anything in the meantime, just reply to this email.</p>
<p>{{sender.name}}</p>`,
    thumbnail: "text",
  },
  {
    id: "welcome-intro",
    name: "Welcome introduction",
    category: "welcome",
    subject: "Welcome from {{business.name}}",
    bodyText: `Hi {{lead.first_name}},

Welcome! We're glad you found {{business.name}}. Tell us a bit more about what you need and we'll point you in the right direction.

Looking forward to helping,
{{sender.name}}`,
    bodyHtml: `<p>Hi {{lead.first_name}},</p>
<p>Welcome! We're glad you found {{business.name}}. Tell us a bit more about what you need and we'll point you in the right direction.</p>
<p>Looking forward to helping,<br />{{sender.name}}</p>`,
    thumbnail: "text",
  },
  {
    id: "quotes-pricing",
    name: "Quote / pricing",
    category: "quotes",
    subject: "Your quote from {{business.name}}",
    bodyText: `Hi {{lead.first_name}},

Thanks for requesting a quote from {{business.name}}. Here's what we can offer based on the details you shared:

• Service: [describe]
• Estimate: [amount]
• Notes: [any conditions]

Let me know if you'd like to book or if you have questions.

{{sender.name}}`,
    bodyHtml: `<p>Hi {{lead.first_name}},</p>
<p>Thanks for requesting a quote from {{business.name}}. Here's what we can offer based on the details you shared:</p>
<ul>
<li>Service: [describe]</li>
<li>Estimate: [amount]</li>
<li>Notes: [any conditions]</li>
</ul>
<p>Let me know if you'd like to book or if you have questions.</p>
<p>{{sender.name}}</p>`,
    thumbnail: "text",
  },
  {
    id: "quotes-ready",
    name: "Quote ready to review",
    category: "quotes",
    subject: "Your quote is ready",
    bodyText: `Hi {{lead.first_name}},

Your quote from {{business.name}} is ready to review. Reply to this email if anything looks off or if you're ready to move forward.

{{sender.name}}`,
    bodyHtml: `<p>Hi {{lead.first_name}},</p>
<p>Your quote from {{business.name}} is ready to review. Reply to this email if anything looks off or if you're ready to move forward.</p>
<p>{{sender.name}}</p>`,
    thumbnail: "text",
  },
  {
    id: "notification-next-step",
    name: "Next-step reminder",
    category: "notification",
    subject: "Next steps with {{business.name}}",
    bodyText: `Hi {{lead.first_name}},

Quick reminder about next steps with {{business.name}}:

1. [Step one]
2. [Step two]
3. [Step three]

Reply anytime if you need help.

{{sender.name}}`,
    bodyHtml: `<p>Hi {{lead.first_name}},</p>
<p>Quick reminder about next steps with {{business.name}}:</p>
<ol>
<li>[Step one]</li>
<li>[Step two]</li>
<li>[Step three]</li>
</ol>
<p>Reply anytime if you need help.</p>
<p>{{sender.name}}</p>`,
    thumbnail: "text",
  },
  {
    id: "notification-appointment",
    name: "Appointment confirmation",
    category: "notification",
    subject: "Confirming your appointment",
    bodyText: `Hi {{lead.first_name}},

This confirms your appointment with {{business.name}} on [date/time].

If you need to reschedule, reply to this email or contact us at {{sender.email}}.

See you soon,
{{sender.name}}`,
    bodyHtml: `<p>Hi {{lead.first_name}},</p>
<p>This confirms your appointment with {{business.name}} on [date/time].</p>
<p>If you need to reschedule, reply to this email or contact us at {{sender.email}}.</p>
<p>See you soon,<br />{{sender.name}}</p>`,
    thumbnail: "text",
  },
];

/** Wireframe preview markup used only in gallery thumbnails (not sent in email). */
export function starterThumbnailPreview(
  thumbnail: EmailTemplateStarterThumbnail,
): string {
  switch (thumbnail) {
    case "blank":
      return "";
    case "one_column":
      return layoutParagraphs(PLACEHOLDER_LINE, PLACEHOLDER_LINE, PLACEHOLDER_SHORT);
    case "two_column":
      return `<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="50%" style="padding-right:4px;">${PLACEHOLDER_LINE}${PLACEHOLDER_SHORT}</td>
<td width="50%" style="padding-left:4px;">${PLACEHOLDER_LINE}${PLACEHOLDER_SHORT}</td>
</tr></table>`;
    case "two_column_image":
      return `${IMAGE_BLOCK}<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td width="50%" style="padding-right:4px;">${PLACEHOLDER_LINE}${PLACEHOLDER_SHORT}</td>
<td width="50%" style="padding-left:4px;">${PLACEHOLDER_LINE}${PLACEHOLDER_SHORT}</td>
</tr></table>`;
    case "text":
      return layoutParagraphs(PLACEHOLDER_SHORT, PLACEHOLDER_LINE, PLACEHOLDER_LINE, PLACEHOLDER_SHORT);
  }
}

export function getStarterById(
  id: string,
): EmailTemplateStarter | undefined {
  return EMAIL_TEMPLATE_STARTERS.find((starter) => starter.id === id);
}

export function startersByCategory(
  category: "all" | EmailTemplateStarterCategory,
): EmailTemplateStarter[] {
  if (category === "all") return [...EMAIL_TEMPLATE_STARTERS];
  return EMAIL_TEMPLATE_STARTERS.filter((starter) => starter.category === category);
}

export function draftFromStarter(starter: EmailTemplateStarter): {
  name: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
} {
  return {
    name: starter.name,
    subject: starter.subject ?? "",
    bodyText: starter.bodyText,
    bodyHtml: starter.bodyHtml,
  };
}
