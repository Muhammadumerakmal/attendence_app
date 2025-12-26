import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bozwwxnnhskuxrrwiogs.supabase.co";
const supabaseAnonKey = "sb_publishable_rqfiCVcmOWqUDn8CID9qjQ_h7cPKtB6";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 