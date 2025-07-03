import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { signIn, signUp, signOut, getSession, getCurrentUser } from '@/lib/auth';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<any>;
  signUp: (credentials: { email: string; password: string; metadata?: any }) => Promise<any>;
  signOut: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initialize auth state from Supabase
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get the current session
        const currentSession = await getSession();
        setSession(currentSession);
        
        // If session exists, get the user
        if (currentSession) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          setUser(newSession.user);
        } else {
          setUser(null);
        }

        setIsLoading(false);
      }
    );

    // Clean up the listener when component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Handle user login
  const handleSignIn = async (credentials: { email: string; password: string }) => {
    try {
      const result = await signIn(credentials);
      setUser(result.user);
      setSession(result.session);
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Handle user registration
  const handleSignUp = async (credentials: { email: string; password: string; metadata?: any }) => {
    try {
      const result = await signUp(credentials);
      
      // If we got a session back, the user is already logged in
      if (result.session) {
        setSession(result.session);
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Handle user logout
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setSession(null);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
