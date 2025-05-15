
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TodoList from "@/components/TodoList";
import { LogOut, Settings, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { subscriptionTier, subscriptionEnd, createCustomerPortalSession } = useSubscription();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    document.title = "Dashboard | TaskMaster";
  }, []);

  const handleManageSubscription = async () => {
    const portalUrl = await createCustomerPortalSession();
    if (portalUrl) {
      window.open(portalUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link to="/" className="text-2xl font-bold text-brand">TaskMaster</Link>
          </div>
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] flex flex-col">
                <div className="flex flex-col gap-4 py-4 mt-8">
                  <div className="text-sm text-gray-600 font-medium py-2 border-b pb-4 mb-2">{user?.email}</div>
                  <Button
                    variant="outline"
                    className="flex items-center justify-start py-2"
                    onClick={handleManageSubscription}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex items-center justify-start py-2"
                    onClick={() => {
                      signOut();
                      navigate("/");
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">{user?.email}</div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={handleManageSubscription}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Subscription
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
          )}
        </div>
      </header>

      {/* Main content grows to fill available space */}
      <main className="flex-grow container mx-auto px-4 py-8"> {/* <-- Changed line */}
        <div className="mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-semibold">Premium Subscription</h2>
                <p className="text-sm text-gray-600">
                  {subscriptionEnd
                    ? `Your subscription will renew on ${new Date(subscriptionEnd).toLocaleDateString()}`
                    : "Active subscription"}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleManageSubscription}>
                Manage Plan
              </Button>
            </div>
          </div>
        </div>

        <TodoList />
      </main>

      {/* Footer stays at bottom */}
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

export default Dashboard;
