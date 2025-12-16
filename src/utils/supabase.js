// Supabase 클라이언트 설정
import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 Supabase URL과 API Key 가져오기
// 개발 환경에서는 .env 파일에서, 프로덕션에서는 환경 변수에서 가져옵니다
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Supabase가 제대로 설정되었는지 확인
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && 
         supabaseUrl !== '' && supabaseAnonKey !== '' &&
         !supabaseUrl.includes('placeholder') && 
         !supabaseAnonKey.includes('placeholder')
}

// localStorage를 사용하지 않는 가짜 스토리지 객체 생성
const createFakeStorage = () => {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null
  }
}

// Supabase 클라이언트 생성 (설정이 없으면 null 반환)
let supabase = null
if (isSupabaseConfigured()) {
  try {
    // localStorage 접근을 완전히 차단하고 Supabase 클라이언트 생성
    const fakeStorage = createFakeStorage()
    
    // localStorage를 완전히 우회하는 가짜 스토리지 사용
    // flowType을 'pkce'로 설정하여 더 안전한 인증 방식 사용
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: fakeStorage, // localStorage 대신 가짜 스토리지 사용
        autoRefreshToken: false, // 토큰 자동 갱신 비활성화 (인증 사용 안 함)
        persistSession: false, // 세션 저장 안 함
        detectSessionInUrl: false,
        flowType: 'pkce' // PKCE 플로우 사용 (더 안전)
      },
      global: {
        headers: {}
      },
      db: {
        schema: 'public'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
    
    console.log('✅ Supabase 클라이언트가 생성되었습니다.')
    console.log('📍 URL:', supabaseUrl)
  } catch (error) {
    // 모든 에러를 무시하고 계속 진행 (앱이 작동해야 함)
    console.warn('⚠️ Supabase 클라이언트 생성 중 경고:', error.message || error)
    // 에러가 발생해도 null로 설정하여 앱이 계속 작동하도록 함
    supabase = null
  }
} else {
  console.warn('⚠️ Supabase가 설정되지 않았습니다.')
  console.log('📍 URL:', supabaseUrl || '(없음)')
  console.log('📍 Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '(없음)')
}

export { supabase }

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

