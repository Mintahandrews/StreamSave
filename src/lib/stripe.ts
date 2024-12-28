import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export const stripe = loadStripe(stripePublicKey || '');

export async function createSubscription(priceId: string) {
  const response = await fetch('/api/create-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId }),
  });

  const session = await response.json();
  
  if (!session || !session.id) {
    throw new Error('Failed to create subscription session');
  }

  const stripeInstance = await stripe;
  if (!stripeInstance) {
    throw new Error('Stripe not initialized');
  }

  const { error } = await stripeInstance.redirectToCheckout({
    sessionId: session.id,
  });

  if (error) {
    throw error;
  }
}