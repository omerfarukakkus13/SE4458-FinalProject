import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypttdupwihxshsjskhee.supabase.co';
const supabaseKey = 'sb_publishable_wan4026_7NOHvwPWrddg4g_9tqwtSkU';

export const supabase = createClient(supabaseUrl, supabaseKey);
