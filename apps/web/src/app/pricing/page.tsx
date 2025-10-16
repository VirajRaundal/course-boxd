import type { Metadata } from "next";

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "For individual creators launching their first course.",
    features: ["Unlimited lessons", "Analytics dashboard", "Community support"],
  },
  {
    name: "Team",
    price: "$99",
    description: "Collaborate with teams and ship programs at scale.",
    features: [
      "Shared workspaces",
      "Advanced analytics",
      "Automations",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Let’s chat",
    description: "Custom solutions for enterprises and learning organizations.",
    features: [
      "Dedicated success manager",
      "Custom SLAs",
      "Security reviews",
      "Integration support",
    ],
  },
];

export const metadata: Metadata = {
  title: "Pricing | CourseBoxd",
  description: "Choose the CourseBoxd plan that meets your learning goals.",
};

export default function PricingPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Pricing
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Scalable plans designed for modern course teams—from first launch to
          global rollout.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className="flex h-full flex-col rounded-xl border border-border bg-background/70 p-6 shadow-sm"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {plan.name}
              </h2>
              <p className="text-3xl font-bold text-primary">{plan.price}</p>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 inline-flex items-center text-sm font-medium text-primary">
              Choose plan
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
