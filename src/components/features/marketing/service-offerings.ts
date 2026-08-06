import { SERVICE_PATHS } from "@/lib/sites";

export type ServiceHighlight = {
  label: string;
  body: string;
};

export type ServiceProcessStep = {
  title: string;
  body: string;
};

export type ServiceOffering = {
  slug: keyof Omit<typeof SERVICE_PATHS, "hub" | "contact">;
  title: string;
  eyebrow: string;
  headline: string;
  intro: string;
  layout: "showcase" | "product" | "foundation" | "device" | "signal";
  image: { src: string; alt: string };
  secondaryImage?: { src: string; alt: string };
  highlights: ServiceHighlight[];
  process?: ServiceProcessStep[];
  fitTitle?: string;
  fitBody?: string;
  portfolioHref?: string;
  oneOffTitle: string;
  oneOffBody: string[];
  ongoingTitle: string;
  ongoingBody: string[];
};

export const SERVICE_OFFERINGS = [
  {
    slug: "websites",
    title: "Websites",
    eyebrow: "Marketing sites",
    headline: "Sites that look sharp and convert.",
    intro:
      "From a focused launch site to a full brand presence—built to be clear, fast, and easy to hand off or keep improving.",
    layout: "showcase",
    image: {
      src: "/images/service-websites.png",
      alt: "Dark marketing website displayed on a desktop monitor",
    },
    highlights: [
      {
        label: "Brand presence",
        body: "A site that matches how you want the business to show up—not a template with your logo dropped in.",
      },
      {
        label: "Launch ready",
        body: "Structured content, performance, and handoff so the launch isn’t the start of a cleanup project.",
      },
      {
        label: "Room to grow",
        body: "Built so new pages and campaigns can land without tearing the foundation apart.",
      },
    ],
    oneOffTitle: "Ship a complete site",
    oneOffBody: [
      "One-off websites for launches, campaigns, and companies that need a polished presence without an open-ended build.",
      "We design, build, and deliver a production-ready site—structured so your team can update content and keep momentum after launch.",
    ],
    ongoingTitle: "Stay current after launch",
    ongoingBody: [
      "Ongoing work covers refreshes, new pages, performance, and seasonal campaigns so the site keeps matching the business.",
      "Retain a cadence of iteration instead of waiting years for a full redesign.",
    ],
  },
  {
    slug: "webApplications",
    title: "Web Applications",
    eyebrow: "Product software",
    headline: "Web apps your customers actually use.",
    intro:
      "Dashboards, portals, and internal tools with real workflows—not just marketing pages with a login screen.",
    layout: "product",
    image: {
      src: "/images/service-web-applications.png",
      alt: "Web application dashboard open on a laptop in a dim workspace",
    },
    highlights: [
      {
        label: "Real workflows",
        body: "Screens that mirror how people already work—auth, lists, detail views, and the actions in between.",
      },
      {
        label: "Integrations",
        body: "Connect the systems you already run so the app becomes the hub, not another silo.",
      },
    ],
    process: [
      {
        title: "Scope the first release",
        body: "Lock the journeys that matter so the first version is usable, not a wish list.",
      },
      {
        title: "Build the product surface",
        body: "Ship the UI, auth, and core data flows your team or customers need day one.",
      },
      {
        title: "Harden and iterate",
        body: "Keep shipping against a roadmap—reliability, features, and feedback in a steady cadence.",
      },
    ],
    oneOffTitle: "Build the first release",
    oneOffBody: [
      "Scoped product builds take you from idea to a working web application your team or customers can use day one.",
      "We focus on the flows that matter: auth, core screens, and the integrations that make the product feel finished.",
    ],
    ongoingTitle: "Iterate with your roadmap",
    ongoingBody: [
      "Ongoing development adds features, hardens reliability, and keeps the app aligned as your users and business change.",
      "Stay in a steady shipping rhythm instead of restarting with a new vendor every release cycle.",
    ],
  },
  {
    slug: "systems",
    title: "Systems",
    eyebrow: "Behind the product",
    headline: "The systems that keep everything running.",
    intro:
      "APIs, data pipelines, integrations, and infrastructure that power websites, apps, and the tools your team relies on.",
    layout: "foundation",
    image: {
      src: "/images/service-systems.png",
      alt: "Data center corridor with networked infrastructure",
    },
    highlights: [
      {
        label: "APIs & data",
        body: "Clear contracts between services so products stay flexible as the business changes.",
      },
      {
        label: "Integrations",
        body: "Connect payment, email, CRM, and internal tools without fragile one-off scripts.",
      },
      {
        label: "Operability",
        body: "Logging, access, and structure that let you run the system—not guess at it.",
      },
    ],
    oneOffTitle: "Stand up the foundation",
    oneOffBody: [
      "One-off systems work delivers a solid backend or integration layer—auth, APIs, data stores, and the glue between services.",
      "Built to be operable and understandable so you’re not locked into opaque one-off scripts.",
    ],
    ongoingTitle: "Operate and evolve",
    ongoingBody: [
      "Ongoing development covers reliability, new integrations, scaling, and the quiet work that keeps products trustworthy.",
      "Treat systems as a living part of the business—not a black box you only open when something breaks.",
    ],
  },
  {
    slug: "mobileApps",
    title: "Mobile Apps",
    eyebrow: "iOS & Android",
    headline: "Mobile experiences that feel native.",
    intro:
      "Apps for the phone in someone’s hand—shipped as a focused first release or grown into a long-term product.",
    layout: "device",
    image: {
      src: "/images/service-mobile-apps.png",
      alt: "Smartphone showing a dark mobile app interface",
    },
    highlights: [
      {
        label: "Native feel",
        body: "Motion, layout, and touch patterns that belong on a phone—not a shrunk website.",
      },
      {
        label: "Focused first ship",
        body: "Core journeys first so the launch is usable, not padded with unused features.",
      },
      {
        label: "Shared product DNA",
        body: "Pair with web and systems so mobile stays coherent with the rest of the product.",
      },
    ],
    fitTitle: "Built for the hand, not the browser window",
    fitBody:
      "Mobile work lives next to your broader product—design, shipping, and updates that respect how people actually use a phone.",
    portfolioHref: "/apps",
    oneOffTitle: "Launch the app",
    oneOffBody: [
      "One-off mobile builds take a clear product brief through design, implementation, and store-ready delivery.",
      "We prioritize the core journeys so the first version is usable, not padded with features nobody asked for.",
    ],
    ongoingTitle: "Grow after the first ship",
    ongoingBody: [
      "Ongoing development keeps the app current: new features, OS updates, performance, and the feedback loop from real users.",
      "Pair mobile with your web and systems work so the product stays coherent across surfaces.",
    ],
  },
  {
    slug: "aiIntegration",
    title: "AI Integration",
    eyebrow: "Intelligent workflows",
    headline: "AI that fits how you already work.",
    intro:
      "Embed models and automation into the products and systems you run—LLM orchestration, search, and workflows that earn their place.",
    layout: "signal",
    image: {
      src: "/images/service-ai-integration.png",
      alt: "Abstract luminous pathways suggesting intelligent systems",
    },
    highlights: [
      {
        label: "LLM orchestration",
        body: "Models wired into real product flows—not a chatbot bolted on as an afterthought.",
      },
      {
        label: "Semantic search",
        body: "Find meaning in documents and knowledge bases your team already owns.",
      },
      {
        label: "Maintainable AI",
        body: "Architectures you can monitor, tune, and extend as usage teaches you what works.",
      },
    ],
    oneOffTitle: "Prove the use case",
    oneOffBody: [
      "One-off AI integrations deliver a focused capability: assistants, semantic search, document workflows, or model-backed features inside an existing product.",
      "We specialize in LLM orchestration, practical fine-tuning where it helps, and architectures that stay maintainable.",
    ],
    ongoingTitle: "Improve with usage",
    ongoingBody: [
      "Ongoing work tunes prompts and pipelines, monitors quality, and expands AI into adjacent workflows as the business learns what works.",
      "Keep intelligence close to real data and real operators—not a demo that never leaves the slide deck.",
    ],
  },
] satisfies ServiceOffering[];

export function getServiceOffering(
  slug: ServiceOffering["slug"],
): ServiceOffering {
  const offering = SERVICE_OFFERINGS.find((item) => item.slug === slug);
  if (!offering) {
    throw new Error(`Unknown service offering: ${slug}`);
  }
  return offering;
}
