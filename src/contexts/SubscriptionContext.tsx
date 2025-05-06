
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from "sonner";

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
    if (!user) return;
    
    try {
      setLoading(true);
      // Placeholder - will be replaced with actual Supabase edge function call
      console.log("Checking subscription for user:", user.id);
      
      // Mock subscription data for development
      const mockHasSubscription = localStorage.getItem('mockSubscription') === 'true';
      
      setSubscribed(mockHasSubscription);
      if (mockHasSubscription) {
        setSubscriptionTier('premium');
        // Set subscription end to 30 days from now
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        setSubscriptionEnd(endDate.toISOString());
      }
    } catch (error: any) {
      console.error("Failed to check subscription:", error);
      toast.error("Failed to verify subscription status");
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async () => {
    if (!user) {
      toast.error("Please log in to subscribe");
      return null;
    }
    
    try {
      setLoading(true);
      // Placeholder - will be replaced with actual Supabase edge function call
      console.log("Creating checkout session for user:", user.id);
      
      // Mock checkout for development
      localStorage.setItem('mockSubscription', 'true');
      
      // In real implementation, this would return a Stripe checkout URL
      toast.success("Subscription activated (development mode)");
      await checkSubscription();
      
      return '/success'; // Simulate redirect URL
    } catch (error: any) {
      console.error("Failed to create checkout session:", error);
      toast.error("Failed to start subscription process");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createCustomerPortalSession = async () => {
    if (!user) {
      toast.error("Please log in to manage your subscription");
      return null;
    }
    
    try {
      setLoading(true);
      // Placeholder - will be replaced with actual Supabase edge function call
      console.log("Creating customer portal session for user:", user.id);
      
      // In real implementation, this would return a Stripe customer portal URL
      toast.success("Customer portal accessed (development mode)");
      
      return '#'; // Simulate redirect URL
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
