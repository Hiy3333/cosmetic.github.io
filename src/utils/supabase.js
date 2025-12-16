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

// 완전히 안전한 가짜 스토리지 객체 생성 (모든 메서드 구현)
const createFakeStorage = () => {
  const storage = {
    getItem: function(key) {
      try {
        return null
      } catch (e) {
        return null
      }
    },
    setItem: function(key, value) {
      // 아무것도 하지 않음
    },
    removeItem: function(key) {
      // 아무것도 하지 않음
    },
    clear: function() {
      // 아무것도 하지 않음
    },
    length: 0,
    key: function(index) {
      return null
    }
  }
  
  // Proxy를 사용하여 모든 접근을 차단
  return new Proxy(storage, {
    get: function(target, prop) {
      if (prop in target) {
        return target[prop]
      }
      return function() { return null }
    },
    set: function() {
      return true // 모든 설정 시도 무시
    }
  })
}

// Supabase 클라이언트 생성 (설정이 없으면 null 반환)
let supabase = null
if (isSupabaseConfigured()) {
  try {
    // 에러를 완전히 무시하고 Supabase 클라이언트 생성
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    
    // Supabase 클라이언트 생성 중 발생하는 에러를 일시적으로 무시
    console.error = function(...args) {
      const message = args.join(' ')
      if (message.toLowerCase().includes('storage') || 
          message.toLowerCase().includes('localstorage')) {
        return // storage 관련 에러는 무시
      }
      originalConsoleError.apply(console, args)
    }
    
    console.warn = function(...args) {
      const message = args.join(' ')
      if (message.toLowerCase().includes('storage') || 
          message.toLowerCase().includes('localstorage')) {
        return // storage 관련 경고는 무시
      }
      originalConsoleWarn.apply(console, args)
    }
    
    // localStorage를 완전히 우회하는 가짜 스토리지 사용
    const fakeStorage = createFakeStorage()
    
    // Supabase 클라이언트 생성 (에러가 발생해도 계속 진행)
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: fakeStorage, // localStorage 대신 가짜 스토리지 사용
        autoRefreshToken: false, // 토큰 자동 갱신 비활성화
        persistSession: false, // 세션 저장 안 함
        detectSessionInUrl: false, // URL에서 세션 감지 안 함
        flowType: 'pkce' // PKCE 플로우 사용
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
    
    // 콘솔 함수 복원
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    
    console.log('✅ Supabase 클라이언트가 생성되었습니다.')
    console.log('📍 URL:', supabaseUrl)
  } catch (error) {
    // 모든 에러를 무시하고 계속 진행
    // 에러가 발생해도 null로 설정하여 앱이 계속 작동하도록 함
    supabase = null
    console.warn('⚠️ Supabase 클라이언트 생성 중 경고 (앱은 계속 작동합니다):', error.message || error)
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

