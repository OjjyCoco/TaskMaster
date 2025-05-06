
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="bg-red-100 rounded-full p-3 w-20 h-20 flex items-center justify-center mx-auto">
          <X className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold">Payment Canceled</h1>
        <p className="text-gray-600">
          Your payment process was canceled. No charges have been made to your account.
        </p>
        <div className="pt-4 space-y-4">
          <Button onClick={() => navigate("/pricing")} className="w-full">
            Return to Pricing
          </Button>
          <Button onClick={() => navigate("/")} variant="outline" className="w-full">
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;
