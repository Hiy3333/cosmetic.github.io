// Supabase 클라이언트 설정
import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 Supabase URL과 API Key 가져오기
// 개발 환경에서는 .env 파일에서, 프로덕션에서는 환경 변수에서 가져옵니다
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Supabase 클라이언트 생성 (환경변수가 없으면 null 반환)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// 연결 테스트 함수
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('tests').select('count').limit(1)
    if (error) {
      console.error('Supabase 연결 실패:', error)
      return false
    }
    console.log('Supabase 연결 성공!')
    return true
  } catch (error) {
    console.error('Supabase 연결 오류:', error)
    return false
  }
}

