import { supabase } from './supabase';
import { SignUpCredentials, SignInCredentials, AuthResponse } from '@/types';

export const signUp = async ({ email, password, metadata }: SignUpCredentials): Promise<AuthResponse> => {
  try {
    if (import.meta.env.DEV) {
      console.log('Attempting to sign up user:', email);
    }

    // Trim inputs to prevent whitespace issues
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      throw new Error('Email and password cannot be empty');
    }

    // For development: Disable email confirmation by setting emailRedirectTo
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
      options: {
        data: metadata,
        // Redirect URL for email confirmation
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    // Log detailed information for debugging
    if (error) {
      console.error('Supabase Sign Up Error:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
    } else {
      if (import.meta.env.DEV) {
        console.log('Sign up response:', {
          user: data.user?.email,
          session: data.session ? 'Session created' : 'No session (email confirmation required)'
        });
      }
    }

    if (error) {
      // If there's an error with email confirmation, we'll try a different approach
      if (error.message.includes('confirmation email')) {
        console.warn('Email service not configured properly. Attempting alternative signup method.');

        // Try creating the user with admin API (this is a workaround for development)
        // First check if the user already exists and try to sign them in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (!signInError) {
          if (import.meta.env.DEV) {
            console.log('User already exists, signed in successfully');
          }
          return signInData;
        }

        // If we can't sign in, try a different signup approach without email confirmation
        const { data: altSignUpData, error: altSignUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
            // Skip email confirmation entirely
            emailRedirectTo: undefined
          }
        });

        if (altSignUpError) {
          console.error('Alternative signup failed:', altSignUpError);
          throw altSignUpError;
        }

        // Try to immediately sign in after signup
        const { data: autoSignInData, error: autoSignInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (autoSignInError) {
          console.error('Auto sign-in after signup failed:', autoSignInError);
          return altSignUpData; // Return the signup data even without session
        }

        return autoSignInData;
      } else {
        // For other errors, throw them as usual
        throw error;
      }
    }

    // If signup was successful but no session (needs email confirmation)
    if (data.session === null) {
      if (import.meta.env.DEV) {
        console.log('User created but requires email confirmation. Attempting direct sign-in...');
      }

      // Try to sign in anyway (works if email confirmation is not enforced)
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          if (import.meta.env.DEV) {
            console.log('Direct sign-in failed, user needs to confirm email first');
          }
          return data; // Return original data with user but no session
        }

        if (import.meta.env.DEV) {
          console.log('Direct sign-in successful despite pending confirmation');
        }
        return signInData;
      } catch (signInError) {
        if (import.meta.env.DEV) {
          console.log('Error during direct sign-in attempt:', signInError);
        }
        return data; // Return original data
      }
    }

    return data;
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
};

export const signIn = async ({ email, password }: SignInCredentials): Promise<AuthResponse> => {
  if (import.meta.env.DEV) {
    console.log('Attempting to sign in user:', email);
  }

  try {
    // Trim inputs to prevent whitespace issues
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      throw new Error('Email and password cannot be empty');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword
    });

    // Log the full error object for debugging
    if (error) {
      console.error('Supabase Auth Error:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      throw error;
    }

    if (import.meta.env.DEV) {
      console.log('Sign in successful:', { user: data.user?.email });
    }
    return data;
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
  return data;
};

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) throw error;
  return session;
};

// Function to handle OAuth sign-in (Google, GitHub, etc.)
export const signInWithOAuth = async (provider: 'google' | 'github' | 'facebook') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
};

// Listen for authentication state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};
