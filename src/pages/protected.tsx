import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        navigate("/login");
      } else {
        setEmail(data.user.email);
      }
    };

    fetchUser();
  }, [navigate]);

  if (!email) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <p>
        Hello <span>{email}</span>
      </p>
      <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
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
  );
}
