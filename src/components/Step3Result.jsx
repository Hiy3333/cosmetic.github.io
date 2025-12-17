import React, { useEffect, useRef } from 'react'
import { saveTestData } from '../utils/storage'
import { exportToExcel } from '../utils/excelExport'
import './Step3Result.css'

function Step3Result({ formData, onReset }) {
  const hasSavedRef = useRef(false)
  
  // 컴포넌트 마운트 시 데이터 저장 (한 번만, React StrictMode 대응)
  useEffect(() => {
    const saveData = async () => {
      try {
        if (!hasSavedRef.current && formData.manufacturer && Object.keys(formData.scores || {}).length > 0) {
          console.log('저장할 데이터:', formData)
          console.log('저장할 날짜:', formData.testDate)
          const result = await saveTestData(formData)
          if (result) {
            console.log('데이터 저장 성공:', result)
            console.log('저장된 날짜:', result.date)
            hasSavedRef.current = true
            // 저장 성공 후 통계 페이지 새로고침 이벤트 발생
            window.dispatchEvent(new Event('refreshStatistics'))
          } else {
            console.warn('데이터 저장 실패: 저장 결과가 null입니다.')
          }
        }
      } catch (error) {
        console.error('데이터 저장 실패:', error)
      }
    }
    saveData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // 점수 계산
  const scores = formData.scores || {}
  const testItems = Object.keys(scores)
  const totalScore = testItems.reduce((sum, item) => sum + (scores[item] || 0), 0)
  const maxPossibleScore = testItems.length * 5
  const averageScore = testItems.length > 0 ? (totalScore / testItems.length).toFixed(2) : 0

  // 점수별 항목 분류
  const getScoreCategory = (score) => {
    if (score >= 4) return 'excellent'
    if (score >= 3) return 'good'
    if (score >= 2) return 'average'
    return 'poor'
  }

  return (
    <div className="step3-result">
      <h2 className="result-title">테스트 결과</h2>

      {/* 기본 정보 */}
      <div className="result-section">
        <h3 className="section-title">기본 정보</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">테스트 날짜:</span>
            <span className="info-value">{formData.testDate}</span>
          </div>
          <div className="info-item">
            <span className="info-label">시간:</span>
            <span className="info-value">{formData.timeSlot}</span>
          </div>
          <div className="info-item">
            <span className="info-label">제조사명:</span>
            <span className="info-value">{formData.manufacturer}</span>
          </div>
          <div className="info-item">
            <span className="info-label">샘플 넘버:</span>
            <span className="info-value">샘플 {formData.sampleNumber}</span>
          </div>
          <div className="info-item">
            <span className="info-label">작성자:</span>
            <span className="info-value">{formData.author}</span>
          </div>
          <div className="info-item">
            <span className="info-label">사용 회차:</span>
            <span className="info-value">{formData.usageCount}차</span>
          </div>
          <div className="info-item">
            <span className="info-label">피부타입:</span>
            <span className="info-value">{formData.skinType}</span>
          </div>
        </div>
      </div>

      {/* 점수 요약 */}
      <div className="result-section">
        <h3 className="section-title">점수 요약</h3>
        <div className="score-summary">
          <div className="score-card">
            <div className="score-label">총점</div>
            <div className="score-value large">{totalScore}점</div>
            <div className="score-max">/ {maxPossibleScore}점</div>
          </div>
          <div className="score-card">
            <div className="score-label">평균 점수</div>
            <div className="score-value large">{averageScore}점</div>
            <div className="score-max">/ 5.0점</div>
          </div>
        </div>
      </div>

      {/* 상세 점수 */}
      <div className="result-section">
        <h3 className="section-title">상세 점수</h3>
        <div className="detailed-scores">
          {Object.entries(scores).map(([item, score]) => (
            <div key={item} className={`score-row ${getScoreCategory(score)}`}>
              <span className="score-item-name">{item}</span>
              <div className="score-display">
                <div className="score-bar-container">
                  <div
                    className="score-bar"
                    style={{ width: `${(score / 5) * 100}%` }}
                  />
                </div>
                <span className="score-number">{score}점</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 개선사항 */}
      {formData.improvement && (
        <div className="result-section">
          <h3 className="section-title">개선사항(향,색상 추가)</h3>
          <div className="improvement-content">
            {formData.improvement}
          </div>
        </div>
      )}

      {/* 버튼들 */}
      <div className="result-buttons">
        <button onClick={async () => await exportToExcel(formData)} className="btn-excel">
          📥 엑셀 다운로드
        </button>
        <button onClick={onReset} className="btn-reset">
          처음으로
        </button>
      </div>
    </div>
  )
}

export default Step3Result

