import Link from "next/link";
import { Reveal } from "@/components/atoms/Reveal";

export function HomeCta() {
  return (
    <section className="bg-surface-container-lowest px-8 py-48 text-center">
      <Reveal fade className="mx-auto max-w-4xl">
        <h2 className="mb-12 font-headline text-6xl font-bold tracking-tighter text-white md:text-8xl">
          Let&apos;s build
          <br />
          the future.
        </h2>
        <div className="flex flex-col items-center gap-8">
          <Link
            href="/services#contact"
            className="kinetic-gradient monolith-shadow px-12 py-6 font-headline text-base font-bold tracking-widest text-on-primary-container uppercase transition-transform hover:scale-[1.05]"
          >
            Start Your Project
          </Link>
          <a
            className="font-label text-xs tracking-[0.4em] text-white/40 uppercase transition-colors hover:text-white"
            href="mailto:contact@trashbox.io"
          >
            contact@trashbox.io
          </a>
        </div>
      </Reveal>
    </section>
  );
}
