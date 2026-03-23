import { type FormEvent, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { Reveal } from '../components/Reveal'

export function Services() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash !== '#contact') return
    requestAnimationFrame(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [location])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
  }

  return (
    <>
      <Helmet>
        <title>Services</title>
        <meta
          name="description"
          content="Discover Trashbox LLC services in app design, full-stack development, and AI integration."
        />
        <meta property="og:title" content="Trashbox LLC - Services" />
        <meta
          property="og:description"
          content="Start a project with Trashbox LLC across product strategy, engineering, and intelligent systems."
        />
      </Helmet>

      <div className="mx-auto max-w-screen-2xl px-8 pb-24 pt-32">
      <header className="mb-32">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">Capabilities</p>
          <h1 className="max-w-4xl font-headline text-6xl font-bold leading-tight tracking-tighter text-white md:text-8xl">
            Engineering <br />
            <span className="text-outline">Digital Sovereignty.</span>
          </h1>
        </motion.div>
      </header>

      <section className="mb-48 grid grid-cols-1 gap-8 md:grid-cols-12">
        <Reveal
          className="group flex min-h-[500px] flex-col justify-between bg-surface-container-low p-10 transition-all duration-500 hover:bg-surface-container-high md:col-span-7"
          delay={0.02}
        >
          <div>
            <span className="material-symbols-outlined mb-8 text-4xl text-primary">layers</span>
            <h2 className="mb-6 font-headline text-4xl font-bold uppercase tracking-tight text-white">App Design</h2>
            <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">
              We translate complex logic into visceral experiences. Our design philosophy prioritizes intentional asymmetry
              and cinematic interaction models.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            {['UI Architecture', 'Experience Systems', 'Prototyping'].map((t) => (
              <span
                key={t}
                className="rounded-full border border-outline-variant/20 px-4 py-1 text-[10px] uppercase tracking-widest text-outline"
              >
                {t}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal className="flex min-h-[500px] flex-col justify-between bg-surface-container-highest p-10 md:col-span-5" delay={0.06}>
          <div className="relative mb-8 h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-10" />
            <div className="flex h-full items-center justify-center">
              <span className="material-symbols-outlined text-7xl text-white/20">terminal</span>
            </div>
          </div>
          <div>
            <h2 className="mb-4 font-headline text-3xl font-bold uppercase tracking-tight text-white">Full-Stack Development</h2>
            <p className="text-base leading-relaxed text-on-surface-variant">
              High-performance monoliths and distributed systems built with kinetic precision. Scalable, secure, and
              future-proofed.
            </p>
          </div>
          <div className="mt-8">
            <button
              type="button"
              className="group flex items-center gap-2 font-label text-xs uppercase tracking-widest text-primary"
            >
              Explore Stack
              <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
          </div>
        </Reveal>

        <Reveal
          className="flex flex-col items-start gap-12 bg-surface-container-low p-10 md:col-span-12 md:flex-row md:items-center md:p-16"
          delay={0.1}
        >
          <div className="md:w-1/2">
            <span className="material-symbols-outlined mb-8 text-5xl text-primary">psychology</span>
            <h2 className="mb-6 font-headline text-5xl font-bold uppercase tracking-tight text-white">AI Integration</h2>
            <p className="text-xl leading-relaxed text-on-surface-variant">
              Embedding intelligence into the core of your workflow. We specialize in LLM orchestration, custom model
              fine-tuning, and semantic search architectures.
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-4 md:w-1/2">
            {[
              { icon: 'auto_awesome', label: 'LLM Deployments' },
              { icon: 'database', label: 'Vector Storage' },
              { icon: 'neurology', label: 'Neural Flows' },
              { icon: 'monitoring', label: 'Insight Engines' },
            ].map((cell) => (
              <div key={cell.label} className="flex flex-col gap-4 bg-surface-container-high p-6">
                <span className="material-symbols-outlined text-primary">{cell.icon}</span>
                <h3 className="font-headline text-sm font-bold uppercase text-white">{cell.label}</h3>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-4xl border-t border-outline-variant/10 pt-24" id="contact">
        <Reveal className="mb-20 text-center">
          <h2 className="mb-4 font-headline text-5xl font-bold uppercase tracking-tighter text-white">Start a Project</h2>
          <p className="font-label text-sm uppercase tracking-widest text-outline">Initiate the transmission</p>
        </Reveal>

        <motion.form
          className="space-y-12"
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-label text-[10px] uppercase tracking-widest text-outline">Client Identity</label>
              <input
                name="name"
                placeholder="Your Name"
                type="text"
                className="w-full border-0 border-b border-outline-variant bg-transparent py-4 text-white placeholder:text-outline-variant/50 focus:border-primary focus:ring-0"
              />
            </div>
            <div>
              <label className="mb-2 block font-label text-[10px] uppercase tracking-widest text-outline">
                Transmission Endpoint
              </label>
              <input
                name="email"
                placeholder="Email Address"
                type="email"
                className="w-full border-0 border-b border-outline-variant bg-transparent py-4 text-white placeholder:text-outline-variant/50 focus:border-primary focus:ring-0"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block font-label text-[10px] uppercase tracking-widest text-outline">Project Objective</label>
            <select
              name="service"
              className="w-full appearance-none border-0 border-b border-outline-variant bg-transparent py-4 text-white focus:border-primary focus:ring-0"
              defaultValue=""
            >
              <option value="" disabled className="bg-surface-container">
                Select Service Area
              </option>
              <option className="bg-surface-container">App Design</option>
              <option className="bg-surface-container">Full-Stack Development</option>
              <option className="bg-surface-container">AI Integration</option>
              <option className="bg-surface-container">General Inquiry</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block font-label text-[10px] uppercase tracking-widest text-outline">Manifesto / Brief</label>
            <textarea
              name="message"
              placeholder="Tell us about the monolith you want to build..."
              rows={4}
              className="w-full resize-none border-0 border-b border-outline-variant bg-transparent py-4 text-white placeholder:text-outline-variant/50 focus:border-primary focus:ring-0"
            />
          </div>
          <div className="pt-8">
            <button
              type="submit"
              className="w-full bg-primary py-6 font-headline font-bold uppercase tracking-[0.3em] text-on-primary transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Send Transmission
            </button>
          </div>
        </motion.form>
      </section>
      </div>
    </>
  )
}
