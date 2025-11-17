import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import heroBackground from "@/assets/hero-background.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-hero-overlay to-background/30" />
      </div>
      
      <div className="relative z-10 container mx-auto px-6 py-32 text-center">
        <p className="text-sm md:text-base text-white/90 mb-6 tracking-wider font-medium">
          Connect • Create • Succeed
        </p>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Where Talent Meets
          <br />
          Opportunity
        </h1>
        
        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of freelancers and employers building the future of work. 
          Find your next project or discover top talent.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
          <Button size="lg" className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Input 
            placeholder="Search for projects or talent..." 
            className="bg-background/95 backdrop-blur border-white/20 h-12 text-base px-6"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
