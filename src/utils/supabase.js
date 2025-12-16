// Supabase REST API 클라이언트
// localStorage 문제를 완전히 회피하기 위해 Supabase JS 라이브러리 대신 fetch API 사용

// 환경 변수에서 Supabase URL과 API Key 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Supabase가 제대로 설정되었는지 확인
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && 
         supabaseUrl !== '' && supabaseAnonKey !== '' &&
         !supabaseUrl.includes('placeholder') && 
         !supabaseAnonKey.includes('placeholder')
}

// REST API 기본 헤더
const getHeaders = () => {
  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
  
  console.log('🔑 API 헤더:', {
    apikey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '없음',
    Authorization: supabaseAnonKey ? 'Bearer ...' : '없음'
  })
  
  return headers
}

// REST API 헬퍼 함수
export const supabaseAPI = {
  // SELECT 쿼리
  select: async (table, options = {}) => {
    try {
      const { 
        select = '*', 
        eq = {}, 
        order = null, 
        limit = null,
        single = false 
      } = options
      
      let url = `${supabaseUrl}/rest/v1/${table}?select=${select}`
      
      // 필터링 추가 (eq)
      Object.entries(eq).forEach(([key, value]) => {
        url += `&${key}=eq.${encodeURIComponent(value)}`
      })
      
      // 정렬 추가
      if (order) {
        const direction = order.ascending ? 'asc' : 'desc'
        url += `&order=${order.column}.${direction}`
      }
      
      // 제한 추가
      if (limit) {
        url += `&limit=${limit}`
      }
      
      console.log('📡 SELECT 요청:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        mode: 'cors',
        credentials: 'omit'
      })
      
      console.log('📥 SELECT 응답:', response.status, response.statusText)
      
      if (!response.ok) {
        let error
        try {
          error = await response.json()
        } catch (e) {
          error = { message: response.statusText, status: response.status }
        }
        console.error('SELECT 실패:', error)
        return { data: null, error }
      }
      
      const data = await response.json()
      console.log('✅ SELECT 성공, 데이터 개수:', Array.isArray(data) ? data.length : 1)
      
      // single 모드면 첫 번째 항목만 반환
      if (single) {
        return { data: data[0] || null, error: null }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('SELECT 오류:', error)
      console.error('오류 상세:', error.message, error.stack)
      return { data: null, error }
    }
  },
  
  // INSERT 쿼리
  insert: async (table, records, options = {}) => {
    try {
      const { single = false } = options
      
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(records)
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error('INSERT 실패:', error)
        return { data: null, error }
      }
      
      const data = await response.json()
      
      // single 모드면 첫 번째 항목만 반환
      if (single) {
        return { data: Array.isArray(data) ? data[0] : data, error: null }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('INSERT 오류:', error)
      return { data: null, error }
    }
  },
  
  // UPDATE 쿼리
  update: async (table, updates, eq = {}) => {
    try {
      let url = `${supabaseUrl}/rest/v1/${table}?`
      
      // 필터링 추가
      Object.entries(eq).forEach(([key, value]) => {
        url += `${key}=eq.${encodeURIComponent(value)}&`
      })
      
      url = url.slice(0, -1) // 마지막 & 제거
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error('UPDATE 실패:', error)
        return { data: null, error }
      }
      
      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error('UPDATE 오류:', error)
      return { data: null, error }
    }
  },
  
  // DELETE 쿼리
  delete: async (table, eq = {}) => {
    try {
      let url = `${supabaseUrl}/rest/v1/${table}?`
      
      // 필터링 추가
      Object.entries(eq).forEach(([key, value]) => {
        url += `${key}=eq.${encodeURIComponent(value)}&`
      })
      
      url = url.slice(0, -1) // 마지막 & 제거
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders()
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error('DELETE 실패:', error)
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      console.error('DELETE 오류:', error)
      return { error }
    }
  },
  
  // UPSERT 쿼리
  upsert: async (table, records, options = {}) => {
    try {
      const { onConflict = null } = options
      
      const headers = { ...getHeaders() }
      if (onConflict) {
        headers['Prefer'] = `return=representation,resolution=merge-duplicates`
      }
      
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(records)
      })
      
      if (!response.ok) {
        const error = await response.json()
        // 중복 에러(23505)는 무시
        if (error.code === '23505') {
          return { data: null, error: null }
        }
        console.error('UPSERT 실패:', error)
        return { data: null, error }
      }
      
      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error('UPSERT 오류:', error)
      return { data: null, error }
    }
  },
  
  // IN 쿼리
  deleteIn: async (table, column, values) => {
    try {
      const url = `${supabaseUrl}/rest/v1/${table}?${column}=in.(${values.join(',')})`
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders()
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error('DELETE IN 실패:', error)
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      console.error('DELETE IN 오류:', error)
      return { error }
    }
  }
}

// 초기화 시 설정 확인
if (typeof window !== 'undefined') {
  console.log('🔍 Supabase REST API 초기화...')
  console.log('📍 URL:', supabaseUrl || '(없음)')
  console.log('📍 Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '(없음)')
  
  if (isSupabaseConfigured()) {
    console.log('✅ Supabase REST API 설정 완료!')
  } else {
    console.error('❌ Supabase가 설정되지 않았습니다.')
  }
}

// 하위 호환성을 위해 supabase 객체 export (사용하지 않음)
export const supabase = null
export const getSupabase = () => null
