// Test file to verify Supabase authentication connection
import { supabase } from './lib/supabase';

// Test function to verify Supabase connection and authentication setup
async function testSupabaseAuthConnection() {
  console.log('Testing Supabase authentication connection...');
  
  try {
    // Test 1: Check if Supabase client is initialized
    console.log('1. Checking if Supabase client is initialized...');
    if (!supabase || !supabase.auth) {
      throw new Error('Supabase client is not properly initialized');
    }
    console.log('✅ Supabase client is properly initialized');
    
    // Test 2: Get the current session to verify auth configuration
    console.log('2. Checking current auth session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Failed to get session:', sessionError.message);
    } else {
      console.log('✅ Auth session check successful');
      console.log('Current session:', sessionData.session ? 'Active' : 'None');
    }
    
    // Test 3: Check auth user API (shouldn't fail even if no user is logged in)
    console.log('3. Checking auth user API...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Failed to get user:', userError.message);
    } else {
      console.log('✅ Auth user API check successful');
      console.log('Current user:', userData.user ? 'Authenticated' : 'Not authenticated');
    }
    
    // Test 4: Test auth configuration with a sample sign-in attempt
    // This should fail gracefully with an auth error, not a connection error
    console.log('4. Testing auth configuration with sample sign-in attempt...');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@nonexistent.com',
      password: 'incorrectpassword'
    });
    
    if (signInError) {
      // This is expected to fail with an auth error, which is good
      if (signInError.message.includes('Invalid login credentials')) {
        console.log('✅ Auth configuration is working as expected (received proper auth error)');
      } else {
        console.warn('⚠️ Unexpected error type:', signInError.message);
      }
    } else {
      console.warn('⚠️ Sign-in unexpectedly succeeded with test credentials');
    }
    
    console.log('\n✨ All auth connection tests completed');
    
  } catch (error) {
    console.error('❌ Test failed with unexpected error:', error);
  }
}

// Run the test
testSupabaseAuthConnection();
