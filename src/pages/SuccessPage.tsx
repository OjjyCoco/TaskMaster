
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Check } from "lucide-react";

const SuccessPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkSubscription } = useSubscription();
  
  useEffect(() => {
    // When landing on success page, verify the subscription status
    if (user) {
      checkSubscription();
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="bg-green-100 rounded-full p-3 w-20 h-20 flex items-center justify-center mx-auto">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Payment Successful!</h1>
        <p className="text-gray-600">
          Thank you for subscribing to TaskMaster Premium. You now have access to all premium features.
        </p>
        <div className="pt-4">
          <Button onClick={() => navigate("/dashboard")} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
