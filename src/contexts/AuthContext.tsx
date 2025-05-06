
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// This is a placeholder for the Supabase client
// Once Supabase is connected, this will be replaced with actual client
export type User = {
  id: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  error: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This effect initialize the auth state from Supabase
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      setLoading(false);
    });
  
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    });
  
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);
  

  // These are auth functions
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
  
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
      if (error) throw error;
  
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
        toast.success("Successfully signed in!");
      }
    } catch (error: any) {
      setError(error.message || "Failed to sign in");
      toast.error("Failed to sign in");
    } finally {
      setLoading(false);
    }
  };
  

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
  
      const { data, error } = await supabase.auth.signUp({ email, password });
  
      if (error) throw error;
  
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
        toast.success("Account created successfully!");
      }
    } catch (error: any) {
      setError(error.message || "Failed to sign up");
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };
  

  const signOut = async () => {
    try {
      setLoading(true);
  
      const { error } = await supabase.auth.signOut();
  
      if (error) throw error;
  
      setUser(null);
      toast.success("Successfully signed out");
    } catch (error: any) {
      setError(error.message || "Failed to sign out");
      toast.error("Failed to sign out");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
};
