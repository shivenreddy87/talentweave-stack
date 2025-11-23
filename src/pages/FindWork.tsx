import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Clock, Briefcase, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface Job {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  skills_required: string[];
  location: string;
  job_type: string;
  experience_level: string;
  created_at: string;
  employer_id: string;
}

interface Profile {
  [key: string]: { full_name: string; email: string };
}

const applicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  coverLetter: z.string().min(20, "Cover letter must be at least 20 characters"),
  proposedRate: z.number().min(0, "Rate must be a positive number").optional(),
});

const FindWork = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [profiles, setProfiles] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      coverLetter: "",
      proposedRate: undefined,
    },
  });

  useEffect(() => {
    fetchJobs();
    fetchUser();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, jobTypeFilter, experienceFilter, minBudget, maxBudget, jobs]);

  const filterJobs = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.skills_required?.some(skill => skill.toLowerCase().includes(term))
      );
    }

    // Job type filter
    if (jobTypeFilter !== "all") {
      filtered = filtered.filter(job => job.job_type === jobTypeFilter);
    }

    // Experience level filter
    if (experienceFilter !== "all") {
      filtered = filtered.filter(job => job.experience_level === experienceFilter);
    }

    // Budget filter
    if (minBudget) {
      const min = parseFloat(minBudget);
      filtered = filtered.filter(job => job.budget_min >= min);
    }
    if (maxBudget) {
      const max = parseFloat(maxBudget);
      filtered = filtered.filter(job => job.budget_max <= max);
    }

    setFilteredJobs(filtered);
  };

  const fetchJobs = async () => {
    try {
      const { data: jobsData, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setJobs(jobsData || []);
      setFilteredJobs(jobsData || []);

      // Fetch employer profiles
      const employerIds = [...new Set(jobsData?.map(job => job.employer_id))];
      if (employerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", employerIds);

        if (profilesData) {
          const profilesMap: Profile = {};
          profilesData.forEach(profile => {
            profilesMap[profile.id] = { full_name: profile.full_name, email: profile.email };
          });
          setProfiles(profilesMap);
        }
      }
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);

    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        form.setValue("name", profile.full_name || "");
        form.setValue("email", profile.email);
      }
    }
  };

  const handleApply = (jobId: string) => {
    if (!user) {
      toast.error("Please sign in to apply for jobs");
      return;
    }
    setSelectedJobId(jobId);
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values: z.infer<typeof applicationSchema>) => {
    if (!selectedJobId || !user) return;

    setSubmitting(true);

    try {
      let resumeUrl = null;

      if (resumeFile) {
        const fileExt = resumeFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from("resumes")
          .upload(fileName, resumeFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("resumes")
          .getPublicUrl(fileName);
        
        resumeUrl = publicUrl;
      }

      const { error } = await supabase.from("job_applications").insert({
        job_id: selectedJobId,
        freelancer_id: user.id,
        cover_letter: values.coverLetter,
        proposed_rate: values.proposedRate,
        phone_number: values.phone,
        resume_url: resumeUrl,
      });

      if (error) throw error;

      toast.success("Application submitted successfully!");
      setDialogOpen(false);
      form.reset();
      setResumeFile(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
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
            <h1 className="text-4xl font-bold">Find Work</h1>
            <p className="text-lg text-muted-foreground">
              Discover opportunities that match your skills
            </p>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by title, description, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <CardTitle className="text-lg">Filters</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label>Job Type</Label>
                      <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="full-time">Full-Time</SelectItem>
                          <SelectItem value="part-time">Part-Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Experience Level</Label>
                      <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Min Budget ($)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Budget ($)</Label>
                      <Input
                        type="number"
                        placeholder="10000"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm || jobTypeFilter !== "all" || experienceFilter !== "all" || minBudget || maxBudget
                    ? "No jobs found matching your filters"
                    : "No jobs available at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-2xl">{job.title}</CardTitle>
                        <CardDescription>
                          Posted by {profiles[job.employer_id]?.full_name || "Unknown"} •{" "}
                          {new Date(job.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {job.job_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{job.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm">
                      {job.location && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {job.budget_min && job.budget_max && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            ${job.budget_min} - ${job.budget_max}
                          </span>
                        </div>
                      )}
                      {job.experience_level && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="capitalize">{job.experience_level}</span>
                        </div>
                      )}
                    </div>

                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills_required.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button onClick={() => handleApply(job.id)} className="w-full md:w-auto">
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Application Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for Job</DialogTitle>
            <DialogDescription>
              Fill out the form below to submit your application
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
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

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proposedRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposed Rate ($/hr) - Optional</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="50.00"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us why you're a great fit for this role..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="resume">Resume (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {resumeFile && (
                    <span className="text-sm text-muted-foreground">{resumeFile.name}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default FindWork;
