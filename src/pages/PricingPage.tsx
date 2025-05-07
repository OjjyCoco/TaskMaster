
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Link, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { LogOut, Settings } from "lucide-react";

const PricingPage = () => {
  const { user, signOut } = useAuth();
  const { createCheckoutSession, subscribed, loading } = useSubscription();
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const checkoutUrl = await createCheckoutSession();
    if (checkoutUrl) {
      navigate(checkoutUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-brand">TaskMaster</span>
          </Link>
          <nav className="space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center"
                  onClick={() => {
                    signOut();
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login">
                  <Button variant="outline">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-gray-600">Choose the plan that's right for you.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl">Free Plan</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <CardDescription>For casual users</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Up to 10 tasks</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Basic task management</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Mobile access</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" disabled>Current Plan</Button>
              </CardFooter>
            </Card>

            {/* Premium Plan */}
            <Card className={`border-2 ${subscribed ? 'border-brand' : 'border-gray-200'} relative`}>
              {subscribed && (
                <div className="absolute top-0 right-0 bg-brand text-white px-3 py-1 text-sm font-medium rounded-bl">
                  Your Plan
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">Premium Plan</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">$5.99</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <CardDescription>For power users</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Unlimited tasks</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Advanced task organization</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Priority reminders</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Detailed productivity reports</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Premium support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                {subscribed ? (
                  <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleSubscribe} disabled={loading}>
                    {loading ? "Processing..." : "Subscribe Now"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">How does billing work?</h3>
              <p className="text-gray-600">You'll be charged monthly for the Premium plan. You can cancel anytime and your subscription will remain active until the end of the billing period.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Can I switch plans?</h3>
              <p className="text-gray-600">Yes, you can upgrade to the Premium plan at any time. Your new features will be available immediately.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">We offer a 7-day free trial for the Premium plan so you can test out all the features before committing.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">How secure is my data?</h3>
              <p className="text-gray-600">We take security seriously. All data is encrypted and stored securely. We never share your information with third parties.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">TaskMaster</h3>
              <p>Your personal task management solution.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} TaskMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>

    
  );
};

export default PricingPage;
