import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
    process.env.SUPABASE_URL!, // For the non - null assertion Operator 
    process.env.SUPABASE_ANON_KEY!
)