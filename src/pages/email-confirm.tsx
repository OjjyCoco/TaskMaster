import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const EmailConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading, signIn, resendVerificationEmail } = useAuth();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check if we got redirected with a token hash from the email
      const token_hash = searchParams.get('token_hash');
      const email = searchParams.get('email');
      
      if (email) {
        setEmail(email);
      }

      if (token_hash) {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: "email",
          });

          if (error) {
            throw error;
          }

          setVerificationState('success');
          
          // Redirect to dashboard after a delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } catch (error) {
          console.error('Error verifying email:', error);
          setVerificationState('error');
        }
      } else {
        // No token hash means user is just viewing this page directly
        setVerificationState('error');
      }
    };

    if (!loading) {
      handleEmailConfirmation();
    }
  }, [searchParams, loading, navigate]);

  const handleResendVerification = () => {
    if (email) {
      resendVerificationEmail(email);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  // Display loading state
  if (loading || verificationState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <LoadingSpinner />
        <p className="mt-4 text-lg">Verifying your email...</p>
      </div>
    );
  }

  // Display success state
  if (verificationState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6 text-green-600">Email Verified!</h1>
          <p className="text-center mb-6">
            Your email has been successfully verified. You will be redirected shortly.
          </p>
          <Button 
            className="w-full" 
            onClick={() => navigate('/dashboard')}
          >
            Go to TaskMaster
          </Button>
        </div>
      </div>
    );
  }

  // Display error state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-red-600">Verification Failed</h1>
        <p className="text-center mb-6">
          We couldn't verify your email. The verification link may have expired or already been used.
        </p>
        <div className="space-y-4">
          {email && (
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={handleResendVerification}
            >
              Resend Verification Email
            </Button>
          )}
          <Button 
            className="w-full" 
            onClick={handleGoToLogin}
          >
            Return to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmPage;