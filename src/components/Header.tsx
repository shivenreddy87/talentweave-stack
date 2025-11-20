import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">FreelancerWorks</span>
          </button>
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => navigate("/find-work")} 
              className="text-foreground hover:text-primary transition-colors"
            >
              Find Work
            </button>
            {user && (
              <button 
                onClick={() => navigate("/my-applications")} 
                className="text-foreground hover:text-primary transition-colors"
              >
                My Applications
              </button>
            )}
            <button 
              onClick={() => navigate("/dashboard")} 
              className="text-foreground hover:text-primary transition-colors"
            >
              My Dashboard
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button onClick={() => navigate("/post-job")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Job
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
