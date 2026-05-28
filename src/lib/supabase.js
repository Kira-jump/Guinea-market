import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vzmefkzacztlgjbmrjhm.supabase.co'
const supabaseKey = 'sb_publishable_UIcZEYgho0KOTeLRbq6sDg_IyxW4qXM'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'guineeshop-auth',
    lock: async (_name, _acquireTimeout, fn) => await fn(),
  }
})
