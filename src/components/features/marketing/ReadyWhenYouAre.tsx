import Link from "next/link";
import { Reveal } from "@/components/atoms/Reveal";
import { SERVICE_PATHS } from "@/lib/sites";

type ReadyWhenYouAreProps = {
  href?: string;
};

export function ReadyWhenYouAre({
  href = SERVICE_PATHS.contact,
}: ReadyWhenYouAreProps) {
  return (
    <section className="bg-surface-container-lowest px-8 py-32 text-center md:py-48">
      <Reveal fade className="mx-auto max-w-3xl">
        <h2 className="mb-10 font-headline text-5xl font-bold tracking-tighter text-white md:text-7xl">
          Ready when you are.
        </h2>
        <Link
          href={href}
          className="kinetic-gradient monolith-shadow inline-block px-12 py-6 font-headline text-base font-bold tracking-widest text-on-primary-container uppercase transition-transform hover:scale-[1.05]"
        >
          Start a Project
        </Link>
      </Reveal>
    </section>
  );
}
