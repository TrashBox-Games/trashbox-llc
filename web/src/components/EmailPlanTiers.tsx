import { motion } from 'framer-motion'

export const EMAIL_PLANS = [
  {
    id: 'basic' as const,
    name: 'Basic',
    price: 10,
    emailsPerMonth: 1_000,
    blurb: 'Owner notifications for every form submission.',
    features: [
      'Unlimited in-site notifications',
      'Email alerts to your business email address',
      'API key for your website forms',
      'Built-in spam protection for contact forms',
    ],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: 15,
    emailsPerMonth: 10_000,
    blurb: 'Everything in Basic, plus confirmation emails to submitters.',
    featured: true,
    features: [
      'Unlimited in-site notifications',
      'Everything in Basic',
      'Confirmation email to the form submitter',
      'Priority notification delivery',
      'Billing portal for card updates & cancel',
    ],
  },
]

type EmailPlanTiersProps = {
  /** Highlight a logged-in account's current plan when known */
  currentPlan?: 'basic' | 'premium' | null
  className?: string
}

export function EmailPlanTiers({ currentPlan = null, className = '' }: EmailPlanTiersProps) {
  return (
    <motion.section
      className={className || 'mt-20'}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 }}
    >
      <div className="mb-10 text-center">
        <p className="font-label text-[10px] uppercase tracking-[0.4em] text-outline">Pricing</p>
        <h2 className="mt-4 font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
          Subscription plans
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-on-surface-variant">
          Create a free Form API account after sign-up, then add a plan when you&apos;re ready.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {EMAIL_PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id
          return (
            <article
              key={plan.id}
              className={[
                'flex flex-col border p-8 transition-colors',
                plan.featured
                  ? 'border-white/40 bg-surface-container-high'
                  : 'border-outline-variant/20 bg-surface-container-low',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                    {plan.featured ? 'Recommended' : 'Starter'}
                  </p>
                  <h3 className="mt-2 font-headline text-2xl font-bold text-white">{plan.name}</h3>
                </div>
                {isCurrent && (
                  <span className="font-label text-[10px] uppercase tracking-widest text-white">
                    Current
                  </span>
                )}
              </div>

              <p className="mt-6 font-headline text-4xl font-bold tracking-tight text-white">
                ${plan.price}
                <span className="ml-1 text-base font-normal text-outline">/mo</span>
              </p>
              <p className="mt-2 font-headline text-lg tracking-tight text-white">
                {plan.emailsPerMonth.toLocaleString()}
                <span className="ml-1 text-sm font-normal text-outline">emails</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{plan.blurb}</p>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined mt-0.5 text-base text-white">
                      check
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 font-label text-[10px] uppercase tracking-widest text-outline">
                {plan.featured
                  ? 'Add after you create your Email Service'
                  : 'Optional paid billing via Stripe'}
              </p>
            </article>
          )
        })}
      </div>
    </motion.section>
  )
}
