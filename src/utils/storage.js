// Supabase를 사용한 데이터 저장/불러오기 유틸리티
import { supabase, isSupabaseConfigured } from './supabase'

// ==================== 테스트 데이터 관련 함수 ====================

// 테스트 데이터 저장
export const saveTestData = async (formData) => {
  try {
    // Supabase가 설정되지 않았으면 에러
    if (!isSupabaseConfigured() || !supabase) {
      console.error('❌ Supabase가 설정되지 않았습니다. 데이터를 저장할 수 없습니다.')
      return null
    }
    
    const today = new Date().toISOString().split('T')[0]
    
    // 중복 체크: 같은 날짜, 작성자, 제조사, 샘플 넘버, 회차의 테스트가 이미 있는지 확인
    const { data: existingTests, error: checkError } = await supabase
      .from('tests')
      .select('*')
      .eq('date', today)
      .eq('author', formData.author)
      .eq('manufacturer', formData.manufacturer)
      .eq('sample_number', formData.sampleNumber)
      .eq('usage_count', formData.usageCount)
    
    if (checkError) {
      console.error('중복 체크 실패:', checkError)
      // 에러가 나도 계속 진행 (중복 체크 실패는 치명적이지 않음)
    }
    
    // 중복이면 저장하지 않음
    if (existingTests && existingTests.length > 0) {
      console.log('중복된 테스트 데이터가 있어 저장하지 않습니다.')
      return null
    }
    
    // 점수 계산
    const scores = formData.scores || {}
    const scoreValues = Object.values(scores).filter(v => v !== null && v !== undefined)
    const totalScore = scoreValues.reduce((sum, score) => sum + (parseInt(score) || 0), 0)
    const averageScore = scoreValues.length > 0 
      ? (totalScore / scoreValues.length).toFixed(2) 
      : 0
    
    // Supabase에 저장
    const { data, error } = await supabase
      .from('tests')
      .insert([
        {
          date: today,
          manufacturer: formData.manufacturer,
          sample_number: formData.sampleNumber,
          author: formData.author,
          usage_count: formData.usageCount,
          skin_type: formData.skinType,
          scores: scores,
          improvement: formData.improvement || '',
          total_score: totalScore,
          average_score: parseFloat(averageScore)
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('데이터 저장 실패:', error)
      return null
    }
    
    // 반환 형식을 기존과 동일하게 맞춤
    return {
      id: data.id,
      date: data.date,
      manufacturer: data.manufacturer,
      sampleNumber: data.sample_number,
      author: data.author,
      usageCount: data.usage_count,
      skinType: data.skin_type,
      scores: data.scores,
      improvement: data.improvement,
      totalScore: data.total_score,
      averageScore: data.average_score
    }
  } catch (error) {
    console.error('데이터 저장 실패:', error)
    return null
  }
}

// 모든 테스트 데이터 불러오기
export const getTestData = async () => {
  try {
    // Supabase가 설정되지 않았으면 빈 배열 반환
    if (!isSupabaseConfigured() || !supabase) {
      console.error('❌ Supabase가 설정되지 않았습니다. 데이터를 불러올 수 없습니다.')
      return []
    }
    
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) {
      console.error('데이터 불러오기 실패:', error)
      return []
    }
    
    // 반환 형식을 기존과 동일하게 맞춤
    return (data || []).map(test => ({
      id: test.id,
      date: test.date,
      manufacturer: test.manufacturer,
      sampleNumber: test.sample_number,
      author: test.author,
      usageCount: test.usage_count,
      skinType: test.skin_type,
      scores: test.scores,
      improvement: test.improvement,
      totalScore: test.total_score,
      averageScore: test.average_score
    }))
  } catch (error) {
    console.error('데이터 불러오기 실패:', error)
    return []
  }
}

// 제조사별 테스트 데이터 불러오기
export const getTestDataByManufacturer = async (manufacturer) => {
  const allData = await getTestData()
  return allData.filter(test => test.manufacturer === manufacturer)
}

// 날짜별 테스트 데이터 불러오기
export const getTestDataByDate = async (date) => {
  const allData = await getTestData()
  return allData.filter(test => test.date === date)
}

// 특정 날짜의 제조사별 테스트 데이터 불러오기
export const getTestDataByDateAndManufacturer = async (date, manufacturer) => {
  const allData = await getTestData()
  return allData.filter(test => test.date === date && test.manufacturer === manufacturer)
}

// 모든 제조사 목록 가져오기
export const getAllManufacturers = async () => {
  const allData = await getTestData()
  const manufacturers = [...new Set(allData.map(test => test.manufacturer).filter(Boolean))]
  return manufacturers.sort()
}

// 테스트 데이터 삭제
export const deleteTestData = async (id) => {
  try {
    // Supabase가 설정되지 않았으면 false 반환
    if (!isSupabaseConfigured() || !supabase) {
      console.error('❌ Supabase가 설정되지 않았습니다. 데이터를 삭제할 수 없습니다.')
      return false
    }
    
    const { error } = await supabase
      .from('tests')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('데이터 삭제 실패:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('데이터 삭제 실패:', error)
    return false
  }
}

// ==================== 제조사 목록 관련 함수 ====================

// 제조사 목록 불러오기
export const getManufacturers = async () => {
  try {
    // Supabase가 설정되지 않았으면 기본값 반환
    if (!isSupabaseConfigured() || !supabase) {
      console.error('❌ Supabase가 설정되지 않았습니다. 기본 제조사 목록을 사용합니다.')
      return ['제조사 A', '제조사 B', '제조사 C', '제조사 D']
    }
    
    const { data, error } = await supabase
      .from('manufacturers')
      .select('name')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('제조사 목록 불러오기 실패:', error)
      return ['제조사 A', '제조사 B', '제조사 C', '제조사 D']
    }
    
    if (!data || data.length === 0) {
      // 기본 제조사 추가
      await saveManufacturers(['제조사 A', '제조사 B', '제조사 C', '제조사 D'])
      return ['제조사 A', '제조사 B', '제조사 C', '제조사 D']
    }
    
    return data.map(m => m.name)
  } catch (error) {
    console.error('제조사 목록 불러오기 실패:', error)
    return ['제조사 A', '제조사 B', '제조사 C', '제조사 D']
  }
}

// 제조사 목록 저장
export const saveManufacturers = async (manufacturers) => {
  try {
    // Supabase가 설정되지 않았으면 false 반환
    if (!isSupabaseConfigured() || !supabase) {
      console.error('❌ Supabase가 설정되지 않았습니다. 제조사 목록을 저장할 수 없습니다.')
      return false
    }
    
    // 기존 제조사 목록 가져오기
    const { data: existing } = await supabase
      .from('manufacturers')
      .select('id, name')
    
    const existingNames = (existing || []).map(m => m.name)
    const existingIds = (existing || []).reduce((acc, m) => {
      acc[m.name] = m.id
      return acc
    }, {})
    
    // 새로 추가할 제조사만 필터링
    const toAdd = manufacturers.filter(name => !existingNames.includes(name))
    
    // 삭제할 제조사 필터링 (기존에 있지만 새 목록에 없는 것)
    const toDelete = existingNames.filter(name => !manufacturers.includes(name))
    
    // 삭제할 제조사가 있으면 삭제
    if (toDelete.length > 0) {
      const idsToDelete = toDelete.map(name => existingIds[name]).filter(Boolean)
      if (idsToDelete.length > 0) {
        const { error } = await supabase
          .from('manufacturers')
          .delete()
          .in('id', idsToDelete)
        
        if (error) {
          console.error('제조사 삭제 실패:', error)
          return false
        }
      }
    }
    
    // 새로 추가할 제조사가 있으면 추가
    if (toAdd.length > 0) {
      // UNIQUE 제약 조건을 피하기 위해 upsert 사용
      const { error } = await supabase
        .from('manufacturers')
        .upsert(toAdd.map(name => ({ name })), { 
          onConflict: 'name',
          ignoreDuplicates: false 
        })
      
      if (error) {
        console.error('제조사 목록 저장 실패:', error)
        // 409 에러는 중복 데이터일 수 있으므로 무시하고 계속 진행
        if (error.code !== '23505') { // UNIQUE 제약 조건 에러가 아니면
          return false
        }
      }
    }
    
    return true
  } catch (error) {
    console.error('제조사 목록 저장 실패:', error)
    return false
  }
}

// ==================== 작성자 목록 관련 함수 ====================

// 작성자 목록 불러오기
export const getAuthors = async () => {
  try {
    // Supabase가 설정되지 않았으면 빈 배열 반환
    if (!isSupabaseConfigured() || !supabase) {
      console.error('❌ Supabase가 설정되지 않았습니다. 작성자 목록을 불러올 수 없습니다.')
      return []
    }
    
    const { data, error } = await supabase
      .from('authors')
      .select('name')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('작성자 목록 불러오기 실패:', error)
      return []
    }
    
    return (data || []).map(a => a.name)
  } catch (error) {
    console.error('작성자 목록 불러오기 실패:', error)
    return []
  }
}

// 작성자 목록 저장
export const saveAuthors = async (authors) => {
  try {
    // Supabase가 설정되지 않았으면 false 반환
    if (!isSupabaseConfigured() || !supabase) {
      console.error('❌ Supabase가 설정되지 않았습니다. 작성자 목록을 저장할 수 없습니다.')
      return false
    }
    
    // 기존 작성자 목록 가져오기
    const { data: existing } = await supabase
      .from('authors')
      .select('id, name')
    
    const existingNames = (existing || []).map(a => a.name)
    const existingIds = (existing || []).reduce((acc, a) => {
      acc[a.name] = a.id
      return acc
    }, {})
    
    // 새로 추가할 작성자만 필터링
    const toAdd = authors.filter(name => !existingNames.includes(name))
    
    // 삭제할 작성자 필터링 (기존에 있지만 새 목록에 없는 것)
    const toDelete = existingNames.filter(name => !authors.includes(name))
    
    // 삭제할 작성자가 있으면 삭제
    if (toDelete.length > 0) {
      const idsToDelete = toDelete.map(name => existingIds[name]).filter(Boolean)
      if (idsToDelete.length > 0) {
        const { error } = await supabase
          .from('authors')
          .delete()
          .in('id', idsToDelete)
        
        if (error) {
          console.error('작성자 삭제 실패:', error)
          return false
        }
      }
    }
    
    // 새로 추가할 작성자가 있으면 추가
    if (toAdd.length > 0) {
      // UNIQUE 제약 조건을 피하기 위해 upsert 사용
      const { error } = await supabase
        .from('authors')
        .upsert(toAdd.map(name => ({ name })), { 
          onConflict: 'name',
          ignoreDuplicates: false 
        })
      
      if (error) {
        console.error('작성자 목록 저장 실패:', error)
        // 409 에러는 중복 데이터일 수 있으므로 무시하고 계속 진행
        if (error.code !== '23505') { // UNIQUE 제약 조건 에러가 아니면
          return false
        }
      }
    }
    
    return true
  } catch (error) {
    console.error('작성자 목록 저장 실패:', error)
    return false
  }
}

// ==================== 작성자별 데이터 조회 함수 ====================

// 작성자별 테스트 데이터 불러오기
export const getTestDataByAuthor = async (author) => {
  const allData = await getTestData()
  return allData.filter(test => test.author === author)
}

// 작성자의 이전 피부타입 가져오기 (가장 최근 것)
export const getPreviousSkinTypeByAuthor = async (author) => {
  const authorTests = await getTestDataByAuthor(author)
  if (authorTests.length === 0) return null
  
  // 날짜순으로 정렬하여 가장 최근 것 가져오기
  const sorted = authorTests.sort((a, b) => new Date(b.date) - new Date(a.date))
  return sorted[0].skinType || null
}

// 작성자의 최대 사용 회차 가져오기
export const getMaxUsageCountByAuthor = async (author) => {
  const authorTests = await getTestDataByAuthor(author)
  if (authorTests.length === 0) return 0
  
  const usageCounts = authorTests.map(test => parseInt(test.usageCount) || 0)
  return Math.max(...usageCounts)
}

// 작성자와 제조사별 이전 피부타입 가져오기 (가장 최근 것)
export const getPreviousSkinTypeByAuthorAndManufacturer = async (author, manufacturer) => {
  const tests = await getTestDataByAuthorAndManufacturer(author, manufacturer)
  if (tests.length === 0) return null
  
  // 날짜순으로 정렬하여 가장 최근 것 가져오기
  const sorted = tests.sort((a, b) => new Date(b.date) - new Date(a.date))
  return sorted[0].skinType || null
}

// 작성자와 제조사별 최대 사용 회차 가져오기
export const getMaxUsageCountByAuthorAndManufacturer = async (author, manufacturer) => {
  const tests = await getTestDataByAuthorAndManufacturer(author, manufacturer)
  if (tests.length === 0) return 0
  
  const usageCounts = tests.map(test => parseInt(test.usageCount) || 0)
  return Math.max(...usageCounts)
}

// 작성자와 제조사별 테스트 데이터 불러오기
export const getTestDataByAuthorAndManufacturer = async (author, manufacturer) => {
  const allData = await getTestData()
  return allData.filter(test => test.author === author && test.manufacturer === manufacturer)
}

// 오늘 같은 작성자가 같은 제조사를 테스트했는지 확인
export const hasTestedToday = async (author, manufacturer) => {
  const today = new Date().toISOString().split('T')[0]
  const tests = await getTestDataByAuthorAndManufacturer(author, manufacturer)
  return tests.some(test => test.date === today)
}

// 모든 작성자 목록 가져오기
export const getAllAuthors = async () => {
  const allData = await getTestData()
  const authors = [...new Set(allData.map(test => test.author).filter(Boolean))]
  return authors.sort()
}

// ==================== 실시간 동기화 함수 ====================

// 테스트 데이터 실시간 구독
export const subscribeToTests = (callback) => {
  // Supabase가 설정되지 않았으면 빈 함수 반환
  if (!isSupabaseConfigured() || !supabase) {
    return () => {}
  }
  
  const channel = supabase
    .channel('tests-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE 모두 감지
        schema: 'public',
        table: 'tests'
      },
      (payload) => {
        console.log('테스트 데이터 변경 감지:', payload)
        callback(payload)
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}

// 제조사 목록 실시간 구독
export const subscribeToManufacturers = (callback) => {
  // Supabase가 설정되지 않았으면 빈 함수 반환
  if (!isSupabaseConfigured() || !supabase) {
    return () => {}
  }
  
  const channel = supabase
    .channel('manufacturers-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'manufacturers'
      },
      (payload) => {
        console.log('제조사 목록 변경 감지:', payload)
        callback(payload)
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}

// 작성자 목록 실시간 구독
export const subscribeToAuthors = (callback) => {
  // Supabase가 설정되지 않았으면 빈 함수 반환
  if (!isSupabaseConfigured() || !supabase) {
    return () => {}
  }
  
  const channel = supabase
    .channel('authors-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'authors'
      },
      (payload) => {
        console.log('작성자 목록 변경 감지:', payload)
        callback(payload)
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}
