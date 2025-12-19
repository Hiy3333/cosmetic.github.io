// 데이터 마이그레이션 함수들
import { supabase } from './supabase'

// "유분감"을 "끈적임"으로 변경
export async function migrateOilnessToStickiness() {
  try {
    console.log('마이그레이션 시작: 유분감 -> 끈적임')
    
    // 모든 테스트 데이터 가져오기
    const { data: tests, error } = await supabase
      .from('tests')
      .select('*')
    
    if (error) {
      console.error('데이터 가져오기 실패:', error)
      return false
    }
    
    if (!tests || tests.length === 0) {
      console.log('마이그레이션할 데이터가 없습니다.')
      return true
    }
    
    console.log(`총 ${tests.length}개의 테스트 데이터 확인`)
    
    let updateCount = 0
    
    // 각 테스트 데이터의 scores를 확인하고 업데이트
    for (const test of tests) {
      if (test.scores && test.scores['유분감'] !== undefined) {
        // 새로운 scores 객체 생성
        const newScores = { ...test.scores }
        
        // "유분감" 값을 "끈적임"으로 복사하고 "유분감" 삭제
        newScores['끈적임'] = newScores['유분감']
        delete newScores['유분감']
        
        // 데이터베이스 업데이트
        const { error: updateError } = await supabase
          .from('tests')
          .update({ scores: newScores })
          .eq('id', test.id)
        
        if (updateError) {
          console.error(`테스트 ${test.id} 업데이트 실패:`, updateError)
        } else {
          updateCount++
          console.log(`테스트 ${test.id} 업데이트 완료`)
        }
      }
    }
    
    console.log(`마이그레이션 완료: ${updateCount}개 업데이트됨`)
    return true
  } catch (error) {
    console.error('마이그레이션 중 오류 발생:', error)
    return false
  }
}

// "점도"를 "점도(육안)"으로 변경
export async function migrateViscosityName() {
  try {
    console.log('마이그레이션 시작: 점도 -> 점도(육안)')
    
    // 모든 테스트 데이터 가져오기
    const { data: tests, error } = await supabase
      .from('tests')
      .select('*')
    
    if (error) {
      console.error('데이터 가져오기 실패:', error)
      return false
    }
    
    if (!tests || tests.length === 0) {
      console.log('마이그레이션할 데이터가 없습니다.')
      return true
    }
    
    console.log(`총 ${tests.length}개의 테스트 데이터 확인`)
    
    let updateCount = 0
    
    // 각 테스트 데이터의 scores를 확인하고 업데이트
    for (const test of tests) {
      if (test.scores && test.scores['점도'] !== undefined) {
        // 새로운 scores 객체 생성
        const newScores = { ...test.scores }
        
        // "점도" 값을 "점도(육안)"으로 복사하고 "점도" 삭제
        newScores['점도(육안)'] = newScores['점도']
        delete newScores['점도']
        
        // 데이터베이스 업데이트
        const { error: updateError } = await supabase
          .from('tests')
          .update({ scores: newScores })
          .eq('id', test.id)
        
        if (updateError) {
          console.error(`테스트 ${test.id} 업데이트 실패:`, updateError)
        } else {
          updateCount++
          console.log(`테스트 ${test.id} 업데이트 완료`)
        }
      }
    }
    
    console.log(`마이그레이션 완료: ${updateCount}개 업데이트됨`)
    return true
  } catch (error) {
    console.error('마이그레이션 중 오류 발생:', error)
    return false
  }
}

