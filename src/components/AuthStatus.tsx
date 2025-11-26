import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserDetails } from '@/types';

const AuthStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          const { data: { user }, error: userError } = await supabase.auth.getUser();

          if (userError) {
            throw userError;
          }

          setStatus('authenticated');
          setUserDetails(user);
        } else {
          setStatus('unauthenticated');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setStatus('unauthenticated');
        setError(err instanceof Error ? err.message : 'Failed to check authentication status');
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setStatus('unauthenticated');
      setUserDetails(null);
      window.location.reload();
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    }
  };

  return (
    <Card className="w-[550px] shadow-lg">
      <CardHeader>
        <CardTitle>Supabase Authentication Status</CardTitle>
        <CardDescription>
          This component directly checks your authentication status with Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'checking' && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-sm text-gray-500">Checking auth status...</span>
          </div>
        )}

        {status === 'authenticated' && userDetails && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800 font-medium">✅ Authenticated</p>
              <p className="text-sm text-green-700 mt-1">You are successfully authenticated with Supabase!</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">User Details:</p>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm"><strong>ID:</strong> {userDetails.id}</p>
                <p className="text-sm"><strong>Email:</strong> {userDetails.email}</p>
                <p className="text-sm"><strong>Created:</strong> {new Date(userDetails.created_at).toLocaleString()}</p>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        )}

        {status === 'unauthenticated' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800 font-medium">❌ Not Authenticated</p>
              <p className="text-sm text-yellow-700 mt-1">
                You are not authenticated with Supabase. Please sign in or sign up.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                variant="default"
                className="w-full"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/register'}
              >
                Go to Register
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthStatus;
