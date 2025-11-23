import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Terms of Service</CardTitle>
              <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using FreelancerWorks, you accept and agree to be bound by the terms and provisions 
                  of this agreement. If you do not agree to these terms, please do not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. User Accounts</h2>
                <p className="text-muted-foreground mb-2">When you create an account with us, you must:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
                <p className="text-muted-foreground mb-2">As a user, you agree to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Use the platform in compliance with all applicable laws</li>
                  <li>Not misrepresent your skills, experience, or qualifications</li>
                  <li>Communicate professionally with other users</li>
                  <li>Not engage in fraudulent or deceptive practices</li>
                  <li>Respect intellectual property rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Payment Terms</h2>
                <p className="text-muted-foreground">
                  All payments processed through FreelancerWorks are subject to our payment processing fees. 
                  Clients agree to pay for services as agreed upon with freelancers. Freelancers agree to 
                  deliver work as specified in project agreements.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Dispute Resolution</h2>
                <p className="text-muted-foreground">
                  In the event of a dispute between users, FreelancerWorks may, at its discretion, assist in 
                  mediating the dispute. However, we are not responsible for resolving disputes or enforcing 
                  agreements between users.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  The platform and its original content, features, and functionality are owned by FreelancerWorks 
                  and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Termination</h2>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account immediately, without prior notice, if you breach these Terms. 
                  Upon termination, your right to use the platform will immediately cease.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  FreelancerWorks shall not be liable for any indirect, incidental, special, consequential, or 
                  punitive damages resulting from your use of or inability to use the platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. We will notify users of any material 
                  changes by posting the new terms on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
                <p className="text-muted-foreground">
                  For questions about these Terms, please contact us at:
                  <br />
                  Email: legal@freelancerworks.com
                  <br />
                  Phone: +1 (555) 123-4567
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
