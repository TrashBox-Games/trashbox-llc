import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#131313] px-8 py-12">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-6 md:flex-row">
        <Link to="/" className="font-headline text-lg font-bold tracking-tighter text-white">
          trashbox llc
        </Link>
        <div className="flex flex-wrap justify-center gap-8">
          <a className="font-body text-xs text-white/50 transition-colors hover:text-white" href="#">
            Twitter
          </a>
          <a className="font-body text-xs text-white/50 transition-colors hover:text-white" href="#">
            GitHub
          </a>
          <a className="font-body text-xs text-white/50 transition-colors hover:text-white" href="#">
            LinkedIn
          </a>
          <a className="font-body text-xs text-white/50 transition-colors hover:text-white" href="#">
            Instagram
          </a>
        </div>
        <p className="font-body text-center text-xs text-white/50 md:text-right">
          © {new Date().getFullYear()} trashbox llc. Built for the kinetic monolith.
        </p>
      </div>
    </footer>
  )
}
