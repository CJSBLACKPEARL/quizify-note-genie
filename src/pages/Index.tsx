
import React, { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PricingPlans from '@/components/PricingPlans';
import AuthModal from '@/components/AuthModal';
import Dashboard from '@/components/Dashboard';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; plan: string } | null>(null);
  const { toast } = useToast();

  const handleAuth = (email: string, password: string, name?: string) => {
    // Simulate authentication
    const userData = {
      name: name || email.split('@')[0],
      email,
      plan: 'free' // Default to free plan
    };
    
    setUser(userData);
    setIsAuthenticated(true);
    
    toast({
      title: name ? "Account created!" : "Welcome back!",
      description: name ? "Your account has been created successfully." : "You have been signed in.",
    });
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Scroll to dashboard or quiz generation
      return;
    }
    setShowAuthModal(true);
  };

  const handleSelectPlan = (plan: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    if (user) {
      setUser({ ...user, plan });
      toast({
        title: "Plan updated!",
        description: `You've switched to the ${plan} plan.`,
      });
    }
  };

  if (isAuthenticated && user) {
    return (
      <>
        <Header 
          isAuthenticated={isAuthenticated}
          onAuthClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          userName={user.name}
        />
        <Dashboard userName={user.name} currentPlan={user.plan} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        isAuthenticated={isAuthenticated}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        userName={user?.name}
      />
      
      <Hero onGetStarted={handleGetStarted} />
      <PricingPlans onSelectPlan={handleSelectPlan} />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
      />
      
      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 QuizifyGenie. Transform your notes into knowledge.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
