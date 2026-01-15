import { createClient } from '@supabase/supabase-js'
import config from '../config'

// Supabaseクライアントを条件付きで初期化
const supabaseUrl = config.supabase.url
const supabaseKey = config.supabase.key

// ダミーの値またはSupabaseが設定されていない場合はnullを返す
const supabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('dummy')
  ? createClient(supabaseUrl, supabaseKey)
  : null

export default supabase
