import type { Metadata } from "next";
import { FadeIn } from "@/components/atoms/FadeIn";
import { API_DOCS_URL, PORTAL_PATHS } from "@/lib/sites";

export const metadata: Metadata = {
  title: "Trashbox CRM Documentation",
  description:
    "Accounts, teams, lead capture, templates, and billing for Trashbox CRM.",
};

const sections = [
  {
    title: "Account",
    body: "Sign up on the portal and create your business workspace. No card required to start capturing leads.",
  },
  {
    title: "Leads and messaging",
    body: "New form submissions land in your Trashbox CRM inbox. Reply from the built-in messaging tools and keep every conversation in one place.",
  },
  {
    title: "Email templates",
    body: "Use templates to follow up faster and more consistently—helping increase customer response rates by 40%.",
  },
  {
    title: "Team access",
    body: "Invite teammates securely so the right people can manage leads without sharing logins.",
  },
  {
    title: "API keys",
    body: "Issue or rotate a key from your account. The raw key is shown once—store it in your site env as the X-Api-Key header value.",
  },
  {
    title: "Billing",
    body: "Start on Free, then add Solo or Team via Stripe Checkout. Manage or cancel anytime from the billing portal. Lead volume resets each UTC month.",
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
          How Trashbox CRM fits together.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-on-surface-variant">
          A quick guide for owners focused on lead generation and retention. For request and
          response schemas, use the live OpenAPI docs.
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
