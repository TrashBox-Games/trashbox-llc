import type { Metadata } from "next";
import Link from "next/link";
import { MarkdownDocument } from "@/components/features/marketing/MarkdownDocument";
import {
  getAppMarkdown,
  getAppPageMeta,
  listAppMarkdownPages,
  titleCaseSegment,
} from "@/lib/apps/registry";

type PageProps = {
  params: Promise<{ appSlug: string; pageSlug: string }>;
};

export function generateStaticParams() {
  return listAppMarkdownPages();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { appSlug, pageSlug } = await params;
  const meta = getAppPageMeta(appSlug, pageSlug);
  const title =
    meta?.title ?? `${titleCaseSegment(appSlug)} — ${titleCaseSegment(pageSlug)}`;

  return {
    title,
    description: meta?.description,
    openGraph: {
      title,
      description: meta?.description,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { appSlug, pageSlug } = await params;
  const markdown = getAppMarkdown(appSlug, pageSlug);

  if (!markdown) {
    return (
      <div className="mx-auto max-w-2xl px-8 pt-32 pb-24 text-center">
        <p className="mb-2 font-headline text-xs tracking-[0.3em] text-outline uppercase">Apps</p>
        <h1 className="mb-6 font-headline text-4xl font-bold tracking-tighter text-primary">
          Page not found
        </h1>
        <p className="mb-10 text-on-surface-variant">
          There is no <span className="text-on-background">{pageSlug}</span> page for{" "}
          <span className="text-on-background">{appSlug}</span>.
        </p>
        <Link
          href="/apps"
          className="inline-flex items-center gap-2 border border-outline-variant px-8 py-3 font-headline text-xs font-bold tracking-widest text-primary uppercase transition-colors hover:bg-white/5"
        >
          Back to apps
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pt-28 pb-24 md:px-8 md:pt-32">
      <nav className="mb-10 font-headline text-xs tracking-widest text-outline uppercase">
        <Link href="/apps" className="transition-colors hover:text-primary">
          Apps
        </Link>
        <span className="mx-2 text-outline-variant">/</span>
        <span className="text-on-surface-variant">{appSlug}</span>
        <span className="mx-2 text-outline-variant">/</span>
        <span className="text-primary">{pageSlug}</span>
      </nav>

      <div className="rounded-xl border border-white/5 bg-surface-container-low/40 p-8 md:p-12">
        <MarkdownDocument markdown={markdown} />
      </div>
    </div>
  );
}
