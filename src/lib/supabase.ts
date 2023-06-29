import { createClient } from '@supabase/supabase-js'

console.log(import.meta.env)

export const supabase = createClient(
	import.meta.env.VITE_APP_SUPABASE_URL as string,
	import.meta.env.VITE_APP_SUPABASE_KEY as string
)
