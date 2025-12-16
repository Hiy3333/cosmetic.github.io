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

// Supabase 클라이언트를 지연 생성하여 에러 핸들러가 먼저 설정되도록 함
let supabase = null
let supabaseInitialized = false

// Supabase 클라이언트 초기화 함수 (필요할 때만 호출)
const initializeSupabase = () => {
  if (supabaseInitialized) return
  supabaseInitialized = true
  
  console.log('🔍 Supabase 초기화 시작...')
  console.log('📍 URL:', supabaseUrl || '(없음)')
  console.log('📍 Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '(없음)')
  
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase가 설정되지 않았습니다. 환경 변수를 확인하세요.')
    console.error('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '설정됨' : '없음')
    console.error('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '설정됨' : '없음')
    return
  }
  
  // Promise 에러를 완전히 차단하는 래퍼
  const suppressedPromise = (promiseFactory) => {
    try {
      const promise = promiseFactory()
      if (promise && typeof promise.catch === 'function') {
        promise.catch((error) => {
          const errorMsg = (error.message || error.toString() || '').toLowerCase()
          if (errorMsg.includes('storage') || errorMsg.includes('localstorage')) {
            // storage 관련 에러는 완전히 무시
            return null
          }
          // 다른 에러는 다시 throw
          throw error
        })
      }
      return promise
    } catch (error) {
      const errorMsg = (error.message || error.toString() || '').toLowerCase()
      if (errorMsg.includes('storage') || errorMsg.includes('localstorage')) {
        return null
      }
      throw error
    }
  }
  
  try {
    // localStorage를 완전히 우회하는 가짜 스토리지 사용
    const fakeStorage = createFakeStorage()
    
    // Supabase 클라이언트 생성 (에러가 발생해도 계속 진행)
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: fakeStorage, // localStorage 대신 가짜 스토리지 사용
        autoRefreshToken: false, // 토큰 자동 갱신 비활성화
        persistSession: false, // 세션 저장 안 함
        detectSessionInUrl: false, // URL에서 세션 감지 안 함
        flowType: 'implicit' // implicit 플로우 사용 (pkce보다 storage 사용 적음)
      },
      global: {
        headers: {}
      },
      db: {
        schema: 'public'
      }
    })
    
    console.log('✅ Supabase 클라이언트가 생성되었습니다.')
    console.log('📍 URL:', supabaseUrl)
  } catch (error) {
    // 모든 에러를 무시하고 계속 진행
    supabase = null
    const errorMsg = (error.message || error.toString() || '').toLowerCase()
    if (!errorMsg.includes('storage') && !errorMsg.includes('localstorage')) {
      console.warn('⚠️ Supabase 클라이언트 생성 중 경고:', error.message || error)
    }
  }
}

// 앱 시작 시 즉시 초기화
initializeSupabase()

// supabase 접근 시 자동 초기화
const getSupabase = () => {
  if (!supabaseInitialized) {
    initializeSupabase()
  }
  return supabase
}

export { supabase, getSupabase }

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

