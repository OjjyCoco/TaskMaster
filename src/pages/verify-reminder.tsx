import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

const VerifyReminderPage = () => {
  const { user, resendVerificationEmail, isEmailVerified } = useAuth();
  const navigate = useNavigate();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // If the user is already verified, redirect to dashboard
  if (isEmailVerified()) {
    navigate('/dashboard');
    return null;
  }

  // If there's no user, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleResendVerification = async () => {
    if (!user.email) return;
    
    setResendDisabled(true);
    setResendStatus('idle');
    
    try {
      await resendVerificationEmail(user.email);
      setResendStatus('success');
      
      // Re-enable the button after 60 seconds
      setTimeout(() => {
        setResendDisabled(false);
      }, 60000);
    } catch (error) {
      setResendStatus('error');
      // Re-enable the button after 10 seconds on error
      setTimeout(() => {
        setResendDisabled(false);
      }, 10000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">Email Verification Required</CardTitle>
          <CardDescription className="text-center">
            Please verify your email address to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center mb-6">
            <p className="mb-2">
              We sent a verification email to:
            </p>
            <p className="font-medium text-blue-600">
              {user.email}
            </p>
          </div>

          {resendStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Verification email sent! Please check your inbox and spam folders.
              </AlertDescription>
            </Alert>
          )}

          {resendStatus === 'error' && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                Failed to send verification email. Please try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Check your email and click the verification link to continue.
            </p>
            <p className="text-sm text-gray-600">
              If you didn't receive the email, check your spam folder or request a new verification email.
            </p>
            <div className="text-sm text-gray-600">
              You can't receive the email if your address is already associated with a verified TaskMaster account. In this case:{" "}
              <Link to="/login" className="font-medium text-brand hover:underline">
                Log In
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button
            variant="outline" 
            className="w-full" 
            onClick={handleResendVerification} 
            disabled={resendDisabled}
          >
            {resendDisabled ? 'Email Sent (wait 60s)' : 'Resend Verification Email'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyReminderPage;