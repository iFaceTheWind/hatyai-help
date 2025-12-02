'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check if we have an auth link in the URL
    // This helps preventing a flash of "logged out" state while Supabase processes the hash
    const isAuthCallback = 
      typeof window !== 'undefined' && 
      (window.location.hash.includes('access_token') || 
       window.location.hash.includes('type=recovery') ||
       window.location.hash.includes('type=invite') ||
       window.location.search.includes('code='));
    
    // Check for errors in the URL (e.g. link consumed)
    if (typeof window !== 'undefined' && window.location.hash.includes('error_description')) {
       const params = new URLSearchParams(window.location.hash.substring(1));
       const errorDesc = params.get('error_description');
       if (errorDesc) {
         console.error('Auth Error from URL:', errorDesc.replace(/\+/g, ' '));
         // If there's an error, we probably won't successfully log in from this link
       }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        if (session) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        } else if (!isAuthCallback) {
          // Only stop loading immediately if we are NOT waiting for an auth callback
          setLoading(false);
        }
        // If isAuthCallback is true and session is null, we keep loading: true
        // and wait for onAuthStateChange to fire (or our timeout)
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Safety timeout: if we are waiting for a callback but it hangs (e.g. invalid token that doesn't trigger explicit error),
    // stop loading after a few seconds so the user can at least retry.
    if (isAuthCallback) {
      setTimeout(() => {
        if (mounted) setLoading((prev) => prev ? false : prev); // Only set false if it was true
      }, 5000);
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
