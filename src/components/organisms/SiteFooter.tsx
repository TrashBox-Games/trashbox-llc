import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 bg-[#131313] px-8 py-12">
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-6 md:flex-row">
        <Link href="/" className="inline-flex items-center" aria-label="Trashbox LLC home">
          <Image
            src="/images/trashbox-logo-white.png"
            alt="Trashbox LLC logo"
            width={128}
            height={32}
            className="h-8"
            style={{ width: "auto" }}
          />
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
          © {year} trashbox llc. Built for the kinetic monolith. Web development by{" "}
          <a
            href="https://trashbox.io/"
            className="text-white/70 underline-offset-2 transition-colors hover:text-white hover:underline"
          >
            Trashbox
          </a>
        </p>
      </div>
    </footer>
  );
}
