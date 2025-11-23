import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileMenuProps {
  user: any;
}

const MobileMenu = ({ user }: MobileMenuProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          <button
            onClick={() => handleNavigate("/find-work")}
            className="text-left text-foreground hover:text-primary transition-colors py-2"
          >
            Find Work
          </button>
          <button
            onClick={() => handleNavigate("/browse-talent")}
            className="text-left text-foreground hover:text-primary transition-colors py-2"
          >
            Browse Talent
          </button>
          {user && (
            <button
              onClick={() => handleNavigate("/my-applications")}
              className="text-left text-foreground hover:text-primary transition-colors py-2"
            >
              My Applications
            </button>
          )}
          <button
            onClick={() => handleNavigate("/dashboard")}
            className="text-left text-foreground hover:text-primary transition-colors py-2"
          >
            Dashboard
          </button>
          
          <div className="border-t border-border pt-4 mt-4 space-y-2">
            {user ? (
              <>
                <Button
                  onClick={() => handleNavigate("/profile")}
                  className="w-full"
                  variant="outline"
                >
                  Profile
                </Button>
                <Button
                  onClick={() => handleNavigate("/post-job")}
                  className="w-full"
                >
                  Post Job
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => handleNavigate("/auth")}
                  className="w-full"
                  variant="ghost"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => handleNavigate("/auth")}
                  className="w-full"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
