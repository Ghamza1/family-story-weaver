
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tree, Users, Shield, Award } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white py-4 px-6 border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Tree size={24} className="text-asli-terracotta mr-2" />
            <span className="text-2xl font-bold text-asli-navy">ASLI</span>
          </div>
          <div className="space-x-2">
            <Button asChild variant="ghost">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-asli-terracotta hover:bg-asli-terracotta/90">
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <div className="bg-asli-beige py-16 px-6 flex-1">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-asli-navy leading-tight">
                Build Your Family Story with ASLI
              </h1>
              <p className="text-lg text-asli-gray">
                A free, private, and intuitive online family tree builder. Easily create, visualize, and share your family's history.
              </p>
              <div className="flex gap-4 pt-4">
                <Button asChild size="lg" className="bg-asli-navy hover:bg-asli-blue">
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="w-full max-w-md aspect-square bg-white rounded-lg shadow-xl p-8 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Tree size={120} className="text-asli-terracotta mb-6 animate-pulse-light" />
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-asli-navy mb-2">Your Family Tree</h3>
                    <p className="text-asli-gray">Create a beautiful visualization of your family history</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-asli-navy mb-12">Why Choose ASLI?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-asli-beige/50 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-asli-terracotta/10 p-3 rounded-full">
                  <Shield size={32} className="text-asli-terracotta" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-asli-navy mb-3">Private & Secure</h3>
              <p className="text-asli-gray">
                Your family data is private by default. Share only with the people you choose.
              </p>
            </div>
            
            <div className="bg-asli-beige/50 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-asli-terracotta/10 p-3 rounded-full">
                  <Award size={32} className="text-asli-terracotta" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-asli-navy mb-3">Simple & Intuitive</h3>
              <p className="text-asli-gray">
                Easy-to-use interface designed for everyone, regardless of technical skill.
              </p>
            </div>
            
            <div className="bg-asli-beige/50 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-asli-terracotta/10 p-3 rounded-full">
                  <Users size={32} className="text-asli-terracotta" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-asli-navy mb-3">Preserve Your History</h3>
              <p className="text-asli-gray">
                Document and preserve your family's legacy for generations to come.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-asli-navy py-12 px-6 text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Start Building Your Family Tree Today</h2>
          <p className="mb-8 text-white/80">
            It's free, private, and takes just a minute to get started.
          </p>
          <Button asChild size="lg" className="bg-asli-terracotta hover:bg-asli-terracotta/90">
            <Link to="/register">Create Your Free Account</Link>
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white py-8 px-6 border-t border-gray-200">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Tree size={20} className="text-asli-terracotta mr-2" />
              <span className="font-semibold text-asli-navy">ASLI</span>
            </div>
            <div className="flex gap-6 text-sm text-asli-gray">
              <Link to="#" className="hover:text-asli-navy">About</Link>
              <Link to="#" className="hover:text-asli-navy">Privacy Policy</Link>
              <Link to="#" className="hover:text-asli-navy">Terms of Service</Link>
              <Link to="#" className="hover:text-asli-navy">Contact</Link>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-asli-gray">
            &copy; {new Date().getFullYear()} ASLI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
