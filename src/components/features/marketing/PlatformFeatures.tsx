import { FadeIn } from "@/components/atoms/FadeIn";
import { MaterialIcon } from "@/components/atoms/MaterialIcon";
import { PORTAL_PATHS } from "@/lib/sites";

const features = [
  {
    title: "Lead management",
    body: "Capture, organize, and follow every lead in one inbox—so nothing slips through the cracks.",
  },
  {
    title: "Email templates",
    body: "Send clear, ready-to-use emails that help increase customer response rates by 40%.",
  },
  {
    title: "Messaging and replies",
    body: "Built-in messaging and reply tools keep conversations with leads and customers in one place.",
  },
  {
    title: "Secure team management",
    body: "Invite your team with the right access so everyone can help without sharing passwords.",
  },
  {
    title: "Customer retention tools",
    body: "Stay in touch after the first contact with timely follow-ups that keep relationships warm.",
  },
  {
    title: "Lead generation from your site",
    body: "Connect your website forms so new inquiries land in Trashbox CRM the moment they come in.",
  },
] as const;

export function PlatformFeatures() {
  return (
    <div>
      <FadeIn>
        <p className="mb-6 font-label text-xs uppercase tracking-[0.4em] text-outline">
          Features
        </p>
        <h1 className="max-w-3xl font-headline text-4xl font-bold tracking-tighter text-white md:text-6xl">
          Built for leads and retention.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-on-surface-variant">
          Everything you need in Trashbox CRM to generate leads, respond quickly, and keep
          customers coming back—without juggling half a dozen tools.
        </p>
      </FadeIn>

      <ul className="mt-16 grid gap-8 md:grid-cols-2">
        {features.map((feature) => (
          <li
            key={feature.title}
            className="border border-outline-variant/10 bg-surface-container-low p-8"
          >
            <div className="flex gap-4">
              <MaterialIcon name="check" className="mt-1 text-white" />
              <div>
                <h2 className="font-headline text-xl font-bold text-white">{feature.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  {feature.body}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-14">
        <a
          href={PORTAL_PATHS.login}
          className="inline-block bg-primary px-8 py-4 font-headline text-xs font-bold uppercase tracking-widest text-on-primary transition-opacity hover:opacity-80"
        >
          Login to get started
        </a>
      </div>
    </div>
  );
}
