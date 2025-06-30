// Simple JavaScript test file (no TypeScript) to test Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tfeggrnvbvasgspmukrc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZWdncm52YnZhc2dzcG11a3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjcxMTEsImV4cCI6MjA2Njg0MzExMX0.OU4CF4-yc7O30qx3gpqfLGBOfb_e0cEQqI0zY1vU8fI'

console.log('Creating Supabase client...')
const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('Testing connection...')
supabase.from('popups').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('Connection error:', error)
    } else {
      console.log('Connection successful! Table count:', count)
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err)
  })
