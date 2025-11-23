import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
              <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">Introduction</h2>
                <p className="text-muted-foreground">
                  Welcome to FreelancerWorks. We respect your privacy and are committed to protecting your personal data. 
                  This privacy policy will inform you about how we look after your personal data when you visit our website 
                  and tell you about your privacy rights and how the law protects you.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
                <p className="text-muted-foreground mb-2">We collect the following types of information:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Personal identification information (name, email address, phone number)</li>
                  <li>Professional information (skills, experience, portfolio)</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Usage data (how you interact with our platform)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
                <p className="text-muted-foreground mb-2">We use your information to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Provide and maintain our service</li>
                  <li>Connect freelancers with clients</li>
                  <li>Process payments and transactions</li>
                  <li>Send you notifications and updates</li>
                  <li>Improve our platform and user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational security measures to protect your personal data. 
                  However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
                <p className="text-muted-foreground mb-2">You have the right to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Cookies</h2>
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to track activity on our platform and hold certain information. 
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at:
                  <br />
                  Email: privacy@freelancerworks.com
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

export default Privacy;
