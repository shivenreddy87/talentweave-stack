import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const profileSchema = z.object({
  full_name: z.string().trim().max(100, "Name must be less than 100 characters").optional().or(z.literal("")),
  bio: z.string().trim().max(2000, "Bio must be less than 2000 characters").optional().or(z.literal("")),
  location: z.string().trim().max(200, "Location must be less than 200 characters").optional().or(z.literal("")),
  hourly_rate: z.string().optional().or(z.literal("")).refine(
    (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 10000),
    "Rate must be between 0 and 10000"
  ),
  skills: z.string().max(500, "Skills must be less than 500 characters").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      bio: "",
      location: "",
      hourly_rate: "",
      skills: "",
    },
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await fetchProfile(session.user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          full_name: data.full_name || "",
          bio: data.bio || "",
          location: data.location || "",
          hourly_rate: data.hourly_rate?.toString() || "",
          skills: data.skills?.join(", ") || "",
        });
      }
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error fetching profile:", error);
      toast.error("Unable to load profile data");
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setSaving(true);

    try {
      const skillsArray = values.skills
        ? values.skills
            .split(",")
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0)
            .slice(0, 50) // Limit to 50 skills
        : [];

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name || null,
          bio: values.bio || null,
          location: values.location || null,
          hourly_rate: values.hourly_rate ? parseFloat(values.hourly_rate) : null,
          skills: skillsArray.length > 0 ? skillsArray : null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-24">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-3xl">
                    {form.watch("full_name")?.[0] || user?.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">Edit Profile</CardTitle>
                  <CardDescription>Update your profile information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about yourself..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco, CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hourly_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10000"
                            placeholder="50.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills (comma-separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="React, Node.js, TypeScript" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
