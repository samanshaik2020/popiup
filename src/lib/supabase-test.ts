import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tfeggrnvbvasgspmukrc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZWdncm52YnZhc2dzcG11a3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjcxMTEsImV4cCI6MjA2Njg0MzExMX0.OU4CF4-yc7O30qx3gpqfLGBOfb_e0cEQqI0zY1vU8fI'

// Create a simple test client
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
)

// Test the connection
async function testConnection() {
  console.log('Testing Supabase connection...')
  try {
    // Try to fetch something simple like the database status
    const { data, error } = await supabase.from('popups').select('count()', { count: 'exact' })
    
    if (error) {
      console.error('Supabase connection error:', error)
    } else {
      console.log('Supabase connection successful! Count:', data)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

// Run the test
testConnection()
