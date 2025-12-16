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
  const noop = function() { return null }
  const noopAsync = function() { return Promise.resolve(null) }
  
  const storage = {
    getItem: noop,
    setItem: noop,
    removeItem: noop,
    clear: noop,
    key: noop,
    length: 0
  }
  
  // Proxy를 사용하여 모든 접근을 차단하고 에러 발생 방지
  return new Proxy(storage, {
    get: function(target, prop) {
      // 존재하는 메서드 반환
      if (prop in target) {
        return target[prop]
      }
      // 알려진 async 메서드들
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return undefined // Promise가 아님을 명시
      }
      // 다른 모든 메서드는 noop 반환
      return noop
    },
    set: function(target, prop, value) {
      // 모든 설정 시도를 조용히 무시하고 성공으로 반환
      return true
    },
    has: function(target, prop) {
      return prop in target
    },
    ownKeys: function() {
      return ['getItem', 'setItem', 'removeItem', 'clear', 'key', 'length']
    },
    getOwnPropertyDescriptor: function(target, prop) {
      if (prop in target) {
        return {
          enumerable: true,
          configurable: true,
          writable: true,
          value: target[prop]
        }
      }
      return undefined
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
    
    // Supabase 클라이언트 생성 전에 전역 에러 핸들러 추가
    const originalFetch = window.fetch
    
    // Supabase 클라이언트 생성을 Promise로 감싸서 에러를 조용히 처리
    const createClientSafely = () => {
      try {
        const client = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            storage: fakeStorage, // localStorage 대신 가짜 스토리지 사용
            autoRefreshToken: false, // 토큰 자동 갱신 비활성화
            persistSession: false, // 세션 저장 안 함
            detectSessionInUrl: false, // URL에서 세션 감지 안 함
            flowType: 'implicit', // implicit 플로우 사용
            storageKey: 'sb-fake-key', // 가짜 키 사용
            debug: false // 디버그 로그 비활성화
          },
          global: {
            headers: {}
          },
          db: {
            schema: 'public'
          },
          // 모든 내부 에러를 억제
          realtime: {
            params: {
              eventsPerSecond: 2
            }
          }
        })
        
        // 모든 promise를 가로채서 storage 에러를 억제
        if (client && client.auth) {
          const originalGetSession = client.auth.getSession
          client.auth.getSession = async function(...args) {
            try {
              return await originalGetSession.apply(this, args)
            } catch (error) {
              const errorMsg = (error?.message || '').toLowerCase()
              if (errorMsg.includes('storage')) {
                return { data: { session: null }, error: null }
              }
              throw error
            }
          }
        }
        
        return client
      } catch (innerError) {
        const errorMsg = (innerError.message || innerError.toString() || '').toLowerCase()
        if (!errorMsg.includes('storage')) {
          console.warn('⚠️ createClient 내부 에러:', innerError)
        }
        return null
      }
    }
    
    supabase = createClientSafely()
    
    if (supabase) {
      console.log('✅ Supabase 클라이언트가 생성되었습니다.')
      console.log('📍 URL:', supabaseUrl)
    } else {
      console.warn('⚠️ Supabase 클라이언트 생성 실패 (null 반환)')
    }
  } catch (error) {
    // 모든 에러를 무시하고 계속 진행
    supabase = null
    const errorMsg = (error.message || error.toString() || '').toLowerCase()
    if (!errorMsg.includes('storage') && !errorMsg.includes('localstorage')) {
      console.warn('⚠️ Supabase 클라이언트 생성 중 경고:', error.message || error)
    }
  }
}

// 앱 시작 시 초기화 (브라우저 환경에서만)
if (typeof window !== 'undefined') {
  initializeSupabase()
}

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

