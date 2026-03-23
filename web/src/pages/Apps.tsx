import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'

const cards = [
  {
    span: 'md:col-span-8',
    tag: 'Utility / 01',
    icon: 'token',
    iconBox: 'bg-primary text-on-primary',
    iconSize: 'text-4xl',
    title: 'Vectra',
    body: 'A high-fidelity motion design utility for real-time physics simulation on handheld devices.',
    large: true,
  },
  {
    span: 'md:col-span-4',
    tag: 'Experimental / 02',
    icon: 'lens_blur',
    iconBox: 'bg-surface-container-highest border border-white/10',
    iconSize: 'text-3xl',
    title: 'Aura',
    body: 'Ambient light sequencing for creative workspaces and focus sessions.',
    large: false,
  },
  {
    span: 'md:col-span-4',
    tag: 'Audio / 03',
    icon: 'graphic_eq',
    iconBox: 'bg-surface-container-highest border border-white/10',
    iconSize: 'text-3xl',
    title: 'Oscil',
    body: 'Granular synthesis engine optimized for mobile touch surfaces.',
    large: false,
  },
  {
    span: 'md:col-span-4',
    tag: 'Productivity / 04',
    icon: 'grid_view',
    iconBox: 'bg-surface-container-highest border border-white/10',
    iconSize: 'text-3xl',
    title: 'Monolith',
    body: 'A spatial organization tool for complex project hierarchies.',
    large: false,
  },
  {
    span: 'md:col-span-4',
    tag: 'Haptics / 05',
    icon: 'motion_sensor_active',
    iconBox: 'bg-surface-container-highest border border-white/10',
    iconSize: 'text-3xl',
    title: 'Pulse',
    body: 'Deep-layer haptic feedback testing and sequence design tool.',
    large: false,
  },
] as const

export function Apps() {
  return (
    <div className="mx-auto max-w-screen-2xl px-8 pb-24 pt-32">
      <header className="mb-24">
        <motion.div
          className="flex flex-col justify-between gap-8 md:flex-row md:items-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="max-w-3xl">
            <span className="mb-6 block font-headline text-xs uppercase tracking-[0.3em] text-outline">Portfolio / 2024</span>
            <h1 className="font-headline text-6xl font-bold leading-[0.9] tracking-tighter text-primary md:text-8xl">
              Selected <br />
              Mobile Works.
            </h1>
          </div>
          <div className="flex items-center gap-4 font-headline text-xs uppercase tracking-widest text-outline">
            <span>Filter:</span>
            <button type="button" className="border-b border-primary pb-1 text-primary">
              All Projects
            </button>
            <button type="button" className="transition-colors hover:text-primary">
              iOS
            </button>
            <button type="button" className="transition-colors hover:text-primary">
              Android
            </button>
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 gap-px bg-outline-variant/20 md:grid-cols-12">
        {cards.map((card, i) => (
          <Reveal
            key={card.title}
            className={`group cursor-pointer overflow-hidden border border-white/5 bg-surface-container-low transition-all duration-500 hover:border-white/20 ${card.span}`}
            delay={i * 0.05}
          >
            <div className={`flex h-full flex-col p-12 ${card.large ? '' : ''}`}>
              <div className={`mb-12 flex ${card.large ? 'justify-between' : ''} ${card.large ? 'items-start' : ''}`}>
                {card.large && (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary">
                    <span className={`material-symbols-outlined ${card.iconSize} text-on-primary`}>{card.icon}</span>
                  </div>
                )}
                {card.large && (
                  <span className="rounded-full border border-outline-variant px-3 py-1 font-headline text-[10px] uppercase tracking-widest">
                    {card.tag}
                  </span>
                )}
                {!card.large && (
                  <div className={`flex h-16 w-16 items-center justify-center ${card.iconBox}`}>
                    <span className={`material-symbols-outlined ${card.iconSize} text-primary`}>{card.icon}</span>
                  </div>
                )}
              </div>

              <div className={card.large ? 'mt-auto' : 'mt-auto'}>
                {!card.large && (
                  <span className="mb-2 block font-headline text-[10px] uppercase tracking-widest text-outline">{card.tag}</span>
                )}
                <h2 className={`mb-4 font-headline font-bold tracking-tighter text-primary ${card.large ? 'text-4xl' : 'text-3xl'}`}>
                  {card.title}
                </h2>
                <p
                  className={`font-body leading-relaxed text-on-surface-variant ${card.large ? 'max-w-md text-lg' : 'text-sm'}`}
                >
                  {card.body}
                </p>
                {card.large && (
                  <div className="mt-8 flex items-center gap-2 font-headline text-sm font-bold uppercase tracking-tighter text-primary transition-all group-hover:gap-4">
                    Explore Project <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mb-24 mt-48 text-center">
        <h3 className="mb-8 font-headline text-4xl font-bold tracking-tighter text-primary md:text-5xl">
          Have a vision for a monolith?
        </h3>
        <p className="mx-auto mb-12 max-w-xl text-lg text-outline font-body">
          We partner with select founders to translate complex ideas into kinetic mobile experiences.
        </p>
        <div className="flex flex-col justify-center gap-4 md:flex-row">
          <Link
            to="/services#contact"
            className="bg-primary px-12 py-4 font-headline text-sm font-bold uppercase tracking-widest text-on-primary transition-transform active:scale-95"
          >
            Start a Project
          </Link>
          <Link
            to="/services"
            className="border border-outline-variant px-12 py-4 font-headline text-sm font-bold uppercase tracking-widest text-primary transition-colors hover:bg-white/5"
          >
            View Services
          </Link>
        </div>
      </Reveal>
    </div>
  )
}
