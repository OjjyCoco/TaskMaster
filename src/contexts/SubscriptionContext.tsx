
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type SubscriptionTier = 'basic' | 'premium' | null;

type SubscriptionContextType = {
  subscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckoutSession: () => Promise<string | null>;
  createCustomerPortalSession: () => Promise<string | null>;
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscribed: false,
  subscriptionTier: null,
  subscriptionEnd: null,
  loading: false,
  checkSubscription: async () => {},
  createCheckoutSession: async () => null,
  createCustomerPortalSession: async () => null,
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check subscription status on auth state change
  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      // Reset subscription state when user logs out
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
    }
  }, [user]);

  const checkSubscription = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    console.log("data:", session)
    const token = session?.access_token

    if (!user) return;
  
    try {
      setLoading(true);
  
      const response = await fetch('https://kzkjeofueynaeelxstef.supabase.co/functions/v1/get-subscription-status', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch subscription');
  
      setSubscribed(data.active);
      setSubscriptionTier(data.tier || null);
      setSubscriptionEnd(data.end || null);
    } catch (error: any) {
      console.error("Failed to check subscription:", error);
      console.log("JWT:", token);

      if (error.message === "Invalid JWT") {
        toast.error("Your session has expired. Please sign out and in again.");
      } else {
        toast.error("Failed to verify subscription status");
      }
    } finally {
      setLoading(false);
    }
  };
  

  const createCheckoutSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    console.log("data:", data)
    const token = session?.access_token
    
    if (!user) {
      toast.error("Please log in to subscribe");
      return null;
    }
  
    try {
      setLoading(true);
  
      const response = await fetch('https://kzkjeofueynaeelxstef.supabase.co/functions/v1/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userEmail: user.email }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create session');
  
      window.location.href = data.url; // Redirect to Stripe checkout
      return data.url;
    } catch (error: any) {
      console.error("Failed to create checkout session:", error);
      console.log("JWT:", token);

      if (error.message === "Invalid JWT") {
        toast.error("Your session has expired. Please sign out and in again.");
      } else {
        toast.error("Failed to start subscription process");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };
  

  const createCustomerPortalSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    
    if (!user) {
      toast.error("Please log in to manage your subscription");
      return null;
    }
  
    try {
      setLoading(true);
  
      const response = await fetch('https://kzkjeofueynaeelxstef.supabase.co/functions/v1/create-portal-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create portal session');
  
      window.location.href = data.url; // Redirect to Stripe portal
      return data.url;
    } catch (error: any) {
      console.error("Failed to create customer portal session:", error);
      toast.error("Failed to access subscription management");
      return null;
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <SubscriptionContext.Provider value={{ 
      subscribed, 
      subscriptionTier,
      subscriptionEnd,
      loading, 
      checkSubscription,
      createCheckoutSession,
      createCustomerPortalSession
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
