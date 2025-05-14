
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import LoadingSpinner from './LoadingSpinner';
import { toast } from "sonner";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading, isEmailVerified } = useAuth();
  const { subscribed, loading: subscriptionLoading } = useSubscription();
  
  // Show loading spinner while checking authentication and subscription
  if (authLoading || subscriptionLoading) {
    return <LoadingSpinner />;
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but email not verified, redirect to verification reminder
  if (!isEmailVerified()) {
    return <Navigate to="/verify-reminder" replace />;
  }
  
  // If authenticated but not subscribed, redirect to pricing page
  if (!subscribed) {
    return <Navigate to="/pricing" replace />;
  }
  
  // User is authenticated, email verified, and subscribed, show the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
