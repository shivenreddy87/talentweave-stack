import { Button } from "@/components/ui/button";
import { Briefcase, Plus } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">FreelancerWorks</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#find-work" className="text-foreground hover:text-primary transition-colors">
              Find Work
            </a>
            <a href="#dashboard" className="text-foreground hover:text-primary transition-colors">
              My Dashboard
            </a>
            <a href="#hire-talent" className="text-foreground hover:text-primary transition-colors">
              Hire Talent
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Button>Get Started</Button>
            <Button size="icon" variant="outline" className="hidden lg:inline-flex">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="hidden lg:inline-flex">
              Post Job
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
