import type { Metadata } from "next";
import { FadeIn } from "@/components/atoms/FadeIn";
import { API_DOCS_URL, PORTAL_PATHS } from "@/lib/sites";

export const metadata: Metadata = {
  title: "Platform Documentation",
  description: "Accounts, API keys, billing, and OpenAPI reference for Trashbox Platform.",
};

const sections = [
  {
    title: "Account",
    body: "Sign up on the portal, then create a Form API account with your business name. No card required to start.",
  },
  {
    title: "API keys",
    body: "Issue or rotate a key from your account. The raw key is shown once — store it in your site env as the X-Api-Key header value.",
  },
  {
    title: "Billing",
    body: "Add Basic or Premium via Stripe Checkout. Manage or cancel anytime from the billing portal. Usage resets each UTC month.",
  },
  {
    title: "Inbox",
    body: "Submissions are always stored. When the monthly email quota is exhausted, messages still appear in the inbox even if outbound email is paused.",
  },
] as const;

export default function PortalDocumentationPage() {
  return (
    <div>
      <FadeIn>
        <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">
          Documentation
        </p>
        <h1 className="max-w-3xl font-headline text-4xl font-bold tracking-tighter text-white md:text-6xl">
          How the platform fits together.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-on-surface-variant">
          High-level guide for owners. For request and response schemas, use the live OpenAPI docs.
        </p>
      </FadeIn>

      <div className="mt-16 space-y-8">
        {sections.map((section) => (
          <section
            key={section.title}
            className="border border-outline-variant/10 bg-surface-container-low p-8"
          >
            <h2 className="font-headline text-2xl font-bold text-white">{section.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <a
          href={API_DOCS_URL}
          target="_blank"
          rel="noreferrer"
          className="bg-primary px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-80"
        >
          OpenAPI reference
        </a>
        <a
          href={PORTAL_PATHS.login}
          className="border border-outline-variant/30 px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-white"
        >
          Login
        </a>
      </div>
    </div>
  );
}
