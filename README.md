# Trashbox LLC

The Trashbox LLC marketing site, built on the business template stack.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [GSAP](https://gsap.com/)
- **Component Dev:** [Storybook](https://storybook.js.org/)
- **Unit Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react)
- **E2E Testing:** [Playwright](https://playwright.dev/)
- **Deployment:** [GitHub Pages](https://pages.github.com/) (static export)
- **Package Manager:** [pnpm](https://pnpm.io/)

## Getting Started

```bash
fnm use
pnpm install
cp .env.example .env.local
pnpm dev
```

## Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_API_URL` — Form API base URL
- `NEXT_PUBLIC_FORM_API_KEY` — public site key for the contact form
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID` / `NEXT_PUBLIC_COGNITO_CLIENT_ID` — Platform portal auth

For GitHub Pages, set the same names as repository **Secrets** (used by `.github/workflows/deploy-pages.yml`). In repo settings, set Pages source to **GitHub Actions**.

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development server |
| `pnpm build` | Production static export (`out/`) |
| `pnpm preview` | Serve the static export locally |
| `pnpm test` | Run unit tests |
| `pnpm storybook` | Start Storybook |
| `pnpm test:e2e` | Run Playwright E2E tests |

## Routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/apps` | Apps portfolio |
| `/apps/:app/:page` | App markdown pages (e.g. `/apps/bmplayer/privacy`) |
| `/services` | Services + contact form |
| `/platform` | Platform hub (Overview / Features / Pricing / API / Documentation) |
| `/platform/features` | Platform features |
| `/platform/pricing` | Platform pricing |
| `/platform/api` | Form API usage |
| `/platform/documentation` | Platform docs + OpenAPI link |
| `/portal/orgs` | Org picker — select or create an organization |
| `/portal/{orgSlug}/` | Org workspace (project list) |
| `/portal/{orgSlug}/{projectSlug}/` | Project home |
| `/portal/{orgSlug}/{projectSlug}/inbox/` | Lead inbox |
| `/portal/{orgSlug}/{projectSlug}/settings/*` | Project/org settings |
| `/portal/{orgSlug}/{projectSlug}/membership/` | Org subscription / billing |
| `/portal/login` | Cognito sign-in |
| `/portal/signup` | Cognito sign-up |
| `/portal/confirm` | Email verification (after signup) |
| `/portal/forgot-password` | Password reset |
| `/portal`, `/portal/inbox`, … | Legacy flat paths — redirect into slug URLs |

Platform marketing lives under `/platform/*` with the main site header. The signed-in product lives under `/portal/*` with its own header.

**Org → Projects:** After sign-in you land on `/portal/orgs` to choose or create an organization. Creating an org does not create a project — add one from the workspace home. Product URLs follow GitHub-style `/portal/{orgSlug}/{projectSlug}/…` (static export uses client routing + 404 bootstrap for deep links). The portal sends `X-Project-Id` on API calls.
