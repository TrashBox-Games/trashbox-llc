import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import ghostLogo from '../assets/404-ghost-logo.png'

export function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Trashbox LLC</title>
        <meta name="description" content="This page could not be found." />
        <meta name="robots" content="noindex" />
        <meta property="og:title" content="404 — Trashbox LLC" />
      </Helmet>

      <div className="flex min-h-[calc(100dvh-12rem)] flex-col pt-28 md:pt-32">
        <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#1c1b1b_0%,#131313_100%)] px-6 pb-16 md:px-24">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5">
            <img
              src={ghostLogo}
              alt=""
              className="max-w-4xl w-[80vw] grayscale brightness-50"
              decoding="async"
            />
          </div>

          <div className="relative z-10 flex w-full max-w-7xl flex-col items-end justify-between gap-12 md:flex-row">
            <div className="flex max-w-2xl flex-col items-start">
              <span className="mb-8 block font-label text-xs uppercase tracking-[0.4em] text-outline">Error Code 0x404</span>
              <h1 className="select-none font-headline text-[12rem] font-bold leading-none tracking-tighter text-primary [text-shadow:0_0_30px_rgba(255,255,255,0.1)] md:text-[22rem]">
                404
              </h1>
              <div className="ml-2 -mt-8 pt-3 md:-mt-16 md:pt-5">
                <h2 className="max-w-md font-headline text-4xl font-light tracking-tight text-on-surface md:text-6xl">
                  This link belongs in the <span className="font-normal italic">trash.</span>
                </h2>
                <p className="mt-6 max-w-sm font-body text-lg leading-relaxed text-secondary opacity-70">
                  The resource you are looking for has been decommissioned or moved to a permanent archive.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col items-start gap-12 md:w-auto md:items-end">
              <div className="flex w-full flex-col gap-4 md:w-64">
                <Link
                  to="/"
                  className="group flex items-center justify-between rounded-sm bg-primary px-6 py-5 font-label text-sm font-bold uppercase tracking-widest text-on-primary transition-all duration-300 hover:scale-[0.98] active:scale-95"
                >
                  <span>Back to Safety</span>
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                </Link>
                <Link
                  to="/apps"
                  className="group flex items-center justify-between rounded-sm border border-outline-variant/20 px-6 py-5 font-label text-sm uppercase tracking-widest text-primary transition-all duration-300 hover:bg-surface-container-low"
                >
                  <span>View Apps</span>
                  <span className="material-symbols-outlined opacity-40">inventory_2</span>
                </Link>
              </div>

              <nav className="flex flex-col items-start gap-3 md:items-end">
                <p className="mb-2 font-label text-[10px] uppercase tracking-[0.3em] text-outline-variant">Helpful Destinations</p>
                <ul className="flex flex-col items-start gap-2 md:items-end">
                  <li>
                    <Link
                      to={{ pathname: '/', hash: 'about' }}
                      className="block py-1 text-sm font-medium transition-colors hover:text-primary"
                    >
                      Studio Portfolio
                    </Link>
                  </li>
                  <li>
                    <Link to="/apps" className="block py-1 text-sm font-medium transition-colors hover:text-primary">
                      Active Apps
                    </Link>
                  </li>
                  <li>
                    <Link to="/services#contact" className="block py-1 text-sm font-medium transition-colors hover:text-primary">
                      Contact Engineering
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 hidden md:block">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-outline-variant/30" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-outline-variant">
                System.NullReferenceException: Object not found
              </span>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
