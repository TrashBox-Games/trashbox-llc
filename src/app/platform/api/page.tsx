import type { Metadata } from "next";
import { FadeIn } from "@/components/atoms/FadeIn";
import { API_DOCS_URL, portalUrl } from "@/lib/sites";

export const metadata: Metadata = {
  title: "Platform API",
  description: "Submit contact forms to the Trashbox Form API with X-Api-Key.",
};

const example = `const response = await fetch("https://api.trashbox.io/submit", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": "fapi_your_key_here",
  },
  body: JSON.stringify({
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "I'd like a quote…",
    _honeypot: "",
    metadata: { page: "/contact" },
  }),
});`;

export default function PortalApiPage() {
  return (
    <div>
      <FadeIn>
        <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">API</p>
        <h1 className="max-w-3xl font-headline text-4xl font-bold tracking-tighter text-white md:text-6xl">
          One endpoint for every site form.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-on-surface-variant">
          POST JSON to <code className="text-white">/submit</code> with your Form API key. Restrict
          allowed origins on your client so the public key only works from your domains.
        </p>
      </FadeIn>

      <pre className="mt-12 overflow-x-auto border border-outline-variant/10 bg-surface-container-low p-6 font-mono text-xs leading-relaxed text-on-surface-variant md:text-sm">
        <code>{example}</code>
      </pre>

      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href={API_DOCS_URL}
          target="_blank"
          rel="noreferrer"
          className="bg-primary px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-80"
        >
          Open API docs
        </a>
        <a
          href={portalUrl("login")}
          className="border border-outline-variant/30 px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-white"
        >
          Get an API key
        </a>
      </div>
    </div>
  );
}
