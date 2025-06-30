// Test file to demonstrate Supabase authentication
import { 
  signUp, 
  signIn, 
  signOut, 
  getCurrentUser, 
  getSession, 
  signInWithOAuth 
} from './lib/auth';

// Example usage of authentication functions

// 1. Test sign up functionality
async function testSignUp() {
  try {
    console.log('Testing sign up...');
    const userData = await signUp({
      email: 'test@example.com',
      password: 'password123',
      metadata: {
        full_name: 'Test User',
        company: 'Popiup'
      }
    });
    
    console.log('Sign up successful!', userData);
    return userData;
  } catch (error) {
    console.error('Sign up failed:', error.message);
  }
}

// 2. Test sign in functionality
async function testSignIn() {
  try {
    console.log('Testing sign in...');
    const session = await signIn({
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Sign in successful!', session);
    return session;
  } catch (error) {
    console.error('Sign in failed:', error.message);
  }
}

// 3. Test getting current user
async function testGetCurrentUser() {
  try {
    console.log('Getting current user...');
    const user = await getCurrentUser();
    
    if (user) {
      console.log('Current user:', user);
    } else {
      console.log('No user is currently signed in.');
    }
    
    return user;
  } catch (error) {
    console.error('Failed to get user:', error.message);
  }
}

// 4. Test getting current session
async function testGetSession() {
  try {
    console.log('Getting current session...');
    const session = await getSession();
    
    if (session) {
      console.log('Current session:', session);
    } else {
      console.log('No active session found.');
    }
    
    return session;
  } catch (error) {
    console.error('Failed to get session:', error.message);
  }
}

// 5. Test sign out
async function testSignOut() {
  try {
    console.log('Testing sign out...');
    await signOut();
    console.log('Sign out successful!');
  } catch (error) {
    console.error('Sign out failed:', error.message);
  }
}

// Run the tests in sequence
async function runTests() {
  console.log('Starting authentication tests...');
  
  // First check if we already have a session
  const initialSession = await testGetSession();
  
  if (!initialSession) {
    // If no session, try to sign in
    await testSignIn();
  }
  
  // Get user info after sign in
  await testGetCurrentUser();
  
  // Sign out at the end
  // Uncomment this to test sign out:
  // await testSignOut();
  
  console.log('Tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
});
