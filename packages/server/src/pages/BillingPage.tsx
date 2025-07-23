import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'For individuals and hobbyists starting out.',
    features: ['1 User', '2 Projects', 'Community Support'],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$49',
    description: 'For professional developers and small teams.',
    features: ['5 Users', 'Unlimited Projects', 'AI Debugger', 'Priority Support'],
    cta: 'Upgrade to Pro',
    primary: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with advanced needs.',
    features: ['Unlimited Users', 'On-premise Deployment', 'Dedicated Support', 'IP Guard'],
    cta: 'Contact Sales',
  },
];

/**
 * Static UI page for Billing and Pricing Tiers.
 */
function BillingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Pricing Plans</h1>
        <p className="text-muted-foreground mt-2">Choose the plan that fits your needs.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.name} className={cn("flex flex-col", tier.primary && "border-primary ring-2 ring-primary")}>
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <p className="text-4xl font-bold">{tier.price}<span className="text-sm font-normal text-muted-foreground">{tier.name !== 'Custom' && '/month'}</span></p>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={tier.primary ? 'default' : 'outline'}>{tier.cta}</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default BillingPage;