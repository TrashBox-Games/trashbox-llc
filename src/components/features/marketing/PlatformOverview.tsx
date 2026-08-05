import Link from "next/link";
import { FadeIn } from "@/components/atoms/FadeIn";
import { PORTAL_PATHS } from "@/lib/sites";

export function PlatformOverview() {
  return (
    <div>
      <FadeIn>
        <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">
          Trashbox CRM
        </p>
        <h1 className="max-w-4xl font-headline text-5xl font-bold leading-tight tracking-tighter text-white md:text-7xl">
          Trashbox CRM for retention{" "}
          <span className="text-outline">and lead generation.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-on-surface-variant">
          Trashbox CRM is built for customer retention and lead generation—so you can follow up
          faster, stay organized, and keep more conversations moving.
        </p>
        <p className="mt-4 max-w-2xl text-base text-on-surface-variant">
          Email templates help increase customer response rates by 40%. Pair that with built-in
          messaging and replies, lead management, and secure team access.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={PORTAL_PATHS.signup}
            className="bg-primary px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-80"
          >
            Get started
          </Link>
          <Link
            href={PORTAL_PATHS.login}
            className="border border-outline-variant/30 px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-white"
          >
            Login
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
