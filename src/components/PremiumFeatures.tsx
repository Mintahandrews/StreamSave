import React from 'react';
import { Crown, Cloud, Download, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import { createSubscription } from '@/lib/stripe';
import { useAuthStore } from '@/store/useAuthStore';

const features = [
  {
    icon: Download,
    title: 'Unlimited Downloads',
    description: 'No daily download limits',
  },
  {
    icon: Zap,
    title: '4K Quality',
    description: 'Access to highest quality formats',
  },
  {
    icon: Cloud,
    title: 'Cloud Storage',
    description: 'Save videos directly to cloud',
  },
];

const PREMIUM_MONTHLY_PRICE = 'price_monthly';
const PREMIUM_YEARLY_PRICE = 'price_yearly';

export function PremiumFeatures() {
  const [loading, setLoading] = React.useState(false);
  const user = useAuthStore((state) => state.user);

  const handleSubscribe = async (priceId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await createSubscription(priceId);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Crown className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col items-center text-center p-4 rounded-lg border border-gray-200"
          >
            <Icon className="h-8 w-8 text-blue-500 mb-3" />
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-2">Monthly</h3>
          <p className="text-3xl font-bold mb-4">$9.99<span className="text-sm text-gray-600">/mo</span></p>
          <Button
            onClick={() => handleSubscribe(PREMIUM_MONTHLY_PRICE)}
            disabled={loading}
            className="w-full"
          >
            Subscribe Monthly
          </Button>
        </div>

        <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold">Yearly</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              Save 20%
            </span>
          </div>
          <p className="text-3xl font-bold mb-4">$95.88<span className="text-sm text-gray-600">/year</span></p>
          <Button
            onClick={() => handleSubscribe(PREMIUM_YEARLY_PRICE)}
            disabled={loading}
            className="w-full"
          >
            Subscribe Yearly
          </Button>
        </div>
      </div>
    </div>
  );
}