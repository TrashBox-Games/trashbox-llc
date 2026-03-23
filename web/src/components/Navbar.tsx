import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'font-headline tracking-tight text-sm uppercase transition-colors',
    isActive
      ? 'font-bold text-white border-b-2 border-white pb-1'
      : 'text-white/60 hover:text-white',
  ].join(' ')

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <motion.nav
      className="fixed top-0 z-50 w-full"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={[
          'border-b backdrop-blur-xl transition-colors duration-300',
          scrolled ? 'border-white/10 bg-background/75' : 'border-transparent bg-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-5 md:px-8 md:py-6">
          <Link to="/" className="font-headline text-xl font-bold uppercase tracking-tighter text-white md:text-2xl">
            trashbox llc
          </Link>

          <div className="hidden items-center gap-10 md:flex md:gap-12">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/apps" className={navLinkClass}>
              Apps
            </NavLink>
            <NavLink to="/services" className={navLinkClass}>
              Services
            </NavLink>
            <Link
              className="font-headline text-sm uppercase tracking-tight text-white/60 transition-colors hover:text-white"
              to={{ pathname: '/', hash: 'about' }}
            >
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/services#contact"
              className="hidden bg-primary px-5 py-2 font-headline text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-80 active:scale-95 md:inline-block"
            >
              Contact
            </Link>
            <button
              type="button"
              className="font-headline text-xs font-bold uppercase text-white md:hidden"
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="material-symbols-outlined !text-2xl">{open ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 top-[73px] z-40 bg-background/95 px-6 pb-10 pt-6 md:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-col gap-6">
              <NavLink to="/" end className={navLinkClass} onClick={() => setOpen(false)}>
                Home
              </NavLink>
              <NavLink to="/apps" className={navLinkClass} onClick={() => setOpen(false)}>
                Apps
              </NavLink>
              <NavLink to="/services" className={navLinkClass} onClick={() => setOpen(false)}>
                Services
              </NavLink>
              <Link
                className="font-headline text-sm uppercase tracking-tight text-white/60"
                to={{ pathname: '/', hash: 'about' }}
                onClick={() => setOpen(false)}
              >
                About
              </Link>
              <Link
                to="/services#contact"
                className="mt-4 bg-primary px-6 py-3 text-center font-headline text-xs font-bold uppercase tracking-widest text-on-primary"
                onClick={() => setOpen(false)}
              >
                Contact
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
