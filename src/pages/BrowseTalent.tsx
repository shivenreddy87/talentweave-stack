import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactFreelancerDialog from "@/components/ContactFreelancerDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, DollarSign, Search } from "lucide-react";
import { toast } from "sonner";

interface FreelancerProfile {
  id: string;
  full_name: string | null;
  email: string;
  bio: string | null;
  location: string | null;
  hourly_rate: number | null;
  skills: string[] | null;
}

const BrowseTalent = () => {
  const [profiles, setProfiles] = useState<FreelancerProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerProfile | null>(null);

  useEffect(() => {
    fetchProfiles();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", session.user.id)
        .single();
      
      if (profile) {
        setCurrentUser({
          name: profile.full_name || "A FreelancerWorks User",
          email: profile.email,
        });
      }
    }
  };

  const handleContactClick = (profile: FreelancerProfile) => {
    setSelectedFreelancer(profile);
    setContactDialogOpen(true);
  };

  useEffect(() => {
    filterProfiles();
  }, [searchTerm, profiles]);

  const fetchProfiles = async () => {
    try {
      // Get all user roles to find freelancers
      const { data: freelancerRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "freelancer");

      if (rolesError) throw rolesError;

      if (!freelancerRoles || freelancerRoles.length === 0) {
        setProfiles([]);
        setFilteredProfiles([]);
        setLoading(false);
        return;
      }

      const freelancerIds = freelancerRoles.map(r => r.user_id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", freelancerIds);

      if (error) throw error;

      setProfiles(data || []);
      setFilteredProfiles(data || []);
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error fetching profiles:", error);
      toast.error("Failed to load freelancers");
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    if (!searchTerm.trim()) {
      setFilteredProfiles(profiles);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = profiles.filter(profile => {
      const nameMatch = profile.full_name?.toLowerCase().includes(term);
      const locationMatch = profile.location?.toLowerCase().includes(term);
      const bioMatch = profile.bio?.toLowerCase().includes(term);
      const skillsMatch = profile.skills?.some(skill => 
        skill.toLowerCase().includes(term)
      );

      return nameMatch || locationMatch || bioMatch || skillsMatch;
    });

    setFilteredProfiles(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-6 py-24">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Browse Talent</h1>
            <p className="text-lg text-muted-foreground">
              Find skilled freelancers for your next project
            </p>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, skills, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredProfiles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? "No freelancers found matching your search" : "No freelancers available yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProfiles.map((profile) => (
                <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {profile.full_name?.[0] || profile.email[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {profile.full_name || "Anonymous"}
                        </CardTitle>
                        <CardDescription className="truncate">
                          {profile.email}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {profile.bio}
                      </p>
                    )}

                    <div className="space-y-2">
                      {profile.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}

                      {profile.hourly_rate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>${profile.hourly_rate}/hr</span>
                        </div>
                      )}
                    </div>

                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        {profile.skills.length > 4 && (
                          <Badge variant="outline">
                            +{profile.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <Button className="w-full" onClick={() => handleContactClick(profile)}>Contact</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {selectedFreelancer && (
        <ContactFreelancerDialog
          open={contactDialogOpen}
          onOpenChange={setContactDialogOpen}
          freelancer={selectedFreelancer}
          senderName={currentUser?.name}
          senderEmail={currentUser?.email}
        />
      )}
    </div>
  );
};

export default BrowseTalent;
