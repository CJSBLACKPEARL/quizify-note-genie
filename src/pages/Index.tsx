
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          setShowAuth(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleGetStarted = () => {
    if (user) {
      // User is already authenticated, scroll to dashboard
      return;
    }
    setShowAuth(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (showAuth && !user) {
    return <Auth onAuthSuccess={() => setShowAuth(false)} />;
  }


  if (user) {
    return (
      <>
        <Header 
          isAuthenticated={true}
          onAuthClick={() => setShowAuth(true)}
          onLogout={handleLogout}
          userName={user.user_metadata?.full_name || user.email?.split('@')[0]}
        />
        <Dashboard userName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'} currentPlan="free" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isAuthenticated={false}
        onAuthClick={() => setShowAuth(true)}
        onLogout={handleLogout}
        userName={undefined}
      />
      
      <Hero onGetStarted={handleGetStarted} />
      
      {/* Footer */}
      <footer className="bg-muted border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 QuizifyGenie. Transform your notes into knowledge.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
