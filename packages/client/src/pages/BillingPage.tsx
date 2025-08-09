import { useState } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, CreditCard, Download, Zap, Crown, Rocket, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Mock Stripe implementation for build compatibility
const mockStripe = {
  redirectToCheckout: async ({ sessionId }: { sessionId: string }) => {
    console.log('Mock Stripe redirect to checkout:', sessionId);
    alert('Stripe integration is not configured. This is a demo.');
  }
};

const stripePromise = Promise.resolve(mockStripe);

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Zap,
    features: [
      '3 projects per month',
      'Basic AI models',
      'Community support',
      '1GB storage',
      'Basic templates'
    ],
    limitations: [
      'Limited API calls',
      'No priority support',
      'Basic features only'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: 'per month',
    icon: Crown,
    popular: true,
    features: [
      'Unlimited projects',
      'Advanced AI models',
      'Priority support',
      '50GB storage',
      'Premium templates',
      'Code export',
      'Custom domains',
      'Team collaboration'
    ],
    limitations: []
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    period: 'per month',
    icon: Rocket,
    features: [
      'Everything in Pro',
      'Custom AI training',
      'Dedicated support',
      'Unlimited storage',
      'White-label solution',
      'API access',
      'Advanced analytics',
      'SSO integration'
    ],
    limitations: []
  }
];

const mockInvoices = [
  { id: 'inv_001', date: '2024-01-15', amount: '$29.00', status: 'Paid', plan: 'Pro' },
  { id: 'inv_002', date: '2023-12-15', amount: '$29.00', status: 'Paid', plan: 'Pro' },
  { id: 'inv_003', date: '2023-11-15', amount: '$29.00', status: 'Paid', plan: 'Pro' },
];

function BillingPage() {
  const { user } = useApp();
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(planId);

    if (!user) {
      alert('You must be logged in to upgrade.');
      setIsUpgrading(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: user.id }),
      });

      const { sessionId, error } = await response.json();

      if (error) throw new Error(error);

      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setIsUpgrading(null);
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // Simulate invoice download
    alert(`Downloading invoice ${invoiceId}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <Badge variant={user?.subscription === 'enterprise' ? 'default' : user?.subscription === 'pro' ? 'secondary' : 'outline'}>
          {user?.subscription?.toUpperCase() || 'FREE'} PLAN
        </Badge>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = user?.subscription === plan.id;
              const isUpgradingThis = isUpgrading === plan.id;
              
              return (
                <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {isCurrentPlan ? (
                      <Button className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isUpgradingThis}
                      >
                        {isUpgradingThis ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Download your invoices and view payment history.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.plan}</TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'Paid' ? 'default' : 'destructive'}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Usage</CardTitle>
                <CardDescription>Your usage for this billing period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Projects Created</span>
                    <span>7 / {user?.subscription === 'free' ? '3' : '∞'}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={cn("bg-primary h-2 rounded-full", user?.subscription === 'free' ? 'w-full' : 'w-[20%]')}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI API Calls</span>
                    <span>1,247 / {user?.subscription === 'free' ? '1,000' : '∞'}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={cn("bg-primary h-2 rounded-full", user?.subscription === 'free' ? 'w-full' : 'w-[30%]')}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Used</span>
                    <span>2.3 GB / {user?.subscription === 'free' ? '1 GB' : user?.subscription === 'pro' ? '50 GB' : '∞'}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={cn("bg-primary h-2 rounded-full", user?.subscription === 'free' ? 'w-full' : 'w-[5%]')}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upgrade Benefits</CardTitle>
                <CardDescription>Unlock more features with a paid plan</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced AI models</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom domains</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BillingPage;