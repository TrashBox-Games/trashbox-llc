import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { appMarkdownPages, appPageMeta } from '../../apps/registry'
import { MarkdownDocument } from '../../components/MarkdownDocument'

function titleCaseSegment(slug: string) {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function AppMarkdownPage() {
  const { appSlug, pageSlug } = useParams<{ appSlug: string; pageSlug: string }>()
  const app = appSlug?.toLowerCase() ?? ''
  const page = pageSlug?.toLowerCase() ?? ''
  const markdown = app && page ? appMarkdownPages[app]?.[page] : undefined
  const meta = app && page ? appPageMeta[app]?.[page] : undefined

  if (!markdown) {
    return (
      <>
        <Helmet>
          <title>Not found — Trashbox LLC</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="mx-auto max-w-2xl px-8 pb-24 pt-32 text-center">
          <p className="mb-2 font-headline text-xs uppercase tracking-[0.3em] text-outline">Apps</p>
          <h1 className="mb-6 font-headline text-4xl font-bold tracking-tighter text-primary">Page not found</h1>
          <p className="mb-10 text-on-surface-variant">
            There is no <span className="text-on-background">{pageSlug}</span> page for{' '}
            <span className="text-on-background">{appSlug}</span>.
          </p>
          <Link
            to="/apps"
            className="inline-flex items-center gap-2 border border-outline-variant px-8 py-3 font-headline text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-white/5"
          >
            Back to apps
          </Link>
        </div>
      </>
    )
  }

  const helmetTitle = meta?.title ?? `${titleCaseSegment(app)} — ${titleCaseSegment(page)}`
  const helmetDescription = meta?.description

  return (
    <>
      <Helmet>
        <title>{helmetTitle}</title>
        {helmetDescription ? <meta name="description" content={helmetDescription} /> : null}
        <meta property="og:title" content={helmetTitle} />
        {helmetDescription ? <meta property="og:description" content={helmetDescription} /> : null}
      </Helmet>

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 md:px-8 md:pt-32">
        <nav className="mb-10 font-headline text-xs uppercase tracking-widest text-outline">
          <Link to="/apps" className="transition-colors hover:text-primary">
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
    </>
  )
}
