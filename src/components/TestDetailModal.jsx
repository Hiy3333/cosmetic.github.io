import React from 'react'
import { deleteTestData } from '../utils/storage'
import { createManufacturerColorMap } from '../utils/colors'
import { exportToExcel } from '../utils/excelExport'
import './TestDetailModal.css'

function TestDetailModal({ tests, date, onClose, onDelete, selectedAuthor, selectedManufacturer }) {
  if (!tests || tests.length === 0) return null

  // 첫 번째 테스트의 기본 정보 사용
  const firstTest = tests[0]

  // 삭제 핸들러
  const handleDelete = async (testId) => {
    if (window.confirm('이 테스트를 삭제하시겠습니까?')) {
      const success = await deleteTestData(testId)
      if (success) {
        alert('테스트가 삭제되었습니다.')
        if (onDelete) {
          onDelete()
        }
        // 모든 테스트가 삭제되면 모달 닫기
        if (tests.length === 1) {
          onClose()
        }
      } else {
        alert('삭제에 실패했습니다.')
      }
    }
  }

  // 필터링된 엑셀 다운로드 핸들러 (선택한 제조사, 작성자, 날짜만)
  const handleFilteredExcelDownload = async () => {
    if (tests.length === 0) {
      alert('다운로드할 테스트 데이터가 없습니다.')
      return
    }
    
    // 선택한 제조사, 작성자, 날짜로 필터링된 데이터만 다운로드
    // 빈 문자열('')이면 필터링하지 않음 (전체 선택)
    const filterOptions = {
      manufacturer: selectedManufacturer || undefined,
      author: selectedAuthor || undefined,
      date: date || undefined
    }
    await exportToExcel(firstTest, filterOptions)
  }

  // 전체 엑셀 다운로드 핸들러 (선택한 제조사, 작성자의 모든 데이터)
  const handleFullExcelDownload = async () => {
    if (tests.length === 0) {
      alert('다운로드할 테스트 데이터가 없습니다.')
      return
    }
    
    // 선택한 제조사, 작성자의 모든 데이터 다운로드 (날짜 필터 없음)
    // 빈 문자열('')이면 필터링하지 않음 (전체 선택)
    const filterOptions = {
      manufacturer: selectedManufacturer || undefined,
      author: selectedAuthor || undefined,
      date: null // 날짜 필터 없음
    }
    await exportToExcel(firstTest, filterOptions)
  }

  // 테스트 항목 목록 (첫 번째 테스트 기준)
  const testItems = Object.keys(firstTest.scores || {})
  
  // 작성자별로 그룹화
  const testsByAuthor = {}
  tests.forEach(test => {
    const author = test.author || '기타'
    if (!testsByAuthor[author]) {
      testsByAuthor[author] = []
    }
    testsByAuthor[author].push(test)
  })
  
  // 각 작성자 내에서 제조사별로 그룹화
  const testsByAuthorAndManufacturer = {}
  Object.keys(testsByAuthor).forEach(author => {
    testsByAuthorAndManufacturer[author] = {}
    testsByAuthor[author].forEach(test => {
      const manufacturer = test.manufacturer || '기타'
      if (!testsByAuthorAndManufacturer[author][manufacturer]) {
        testsByAuthorAndManufacturer[author][manufacturer] = []
      }
      testsByAuthorAndManufacturer[author][manufacturer].push(test)
    })
  })
  
  // 각 작성자-제조사 내에서 회차별로 그룹화
  const testsByAuthorManufacturerAndUsage = {}
  Object.keys(testsByAuthorAndManufacturer).forEach(author => {
    testsByAuthorManufacturerAndUsage[author] = {}
    Object.keys(testsByAuthorAndManufacturer[author]).forEach(manufacturer => {
      testsByAuthorManufacturerAndUsage[author][manufacturer] = {}
      testsByAuthorAndManufacturer[author][manufacturer].forEach(test => {
        const usage = test.usageCount || '0'
        if (!testsByAuthorManufacturerAndUsage[author][manufacturer][usage]) {
          testsByAuthorManufacturerAndUsage[author][manufacturer][usage] = []
        }
        testsByAuthorManufacturerAndUsage[author][manufacturer][usage].push(test)
      })
    })
  })
  
  // 작성자 목록 정렬
  const sortedAuthors = Object.keys(testsByAuthorManufacturerAndUsage).sort()
  
  // 모든 제조사 목록 추출 (색상 매핑용)
  const allManufacturers = new Set()
  sortedAuthors.forEach(author => {
    Object.keys(testsByAuthorManufacturerAndUsage[author] || {}).forEach(manufacturer => {
      allManufacturers.add(manufacturer)
    })
  })
  const sortedAllManufacturers = Array.from(allManufacturers).sort()
  
  // 제조사별 색상 매핑 (공통 유틸리티 사용)
  const manufacturerColorMap = createManufacturerColorMap(sortedAllManufacturers)
  
  // 각 작성자의 제조사 목록 정렬
  const getSortedManufacturersForAuthor = (author) => {
    return Object.keys(testsByAuthorManufacturerAndUsage[author] || {}).sort()
  }
  
  // 각 제조사의 회차 목록 정렬 (1차, 2차, 3차 순서)
  const getSortedUsagesForAuthorAndManufacturer = (author, manufacturer) => {
    return Object.keys(testsByAuthorManufacturerAndUsage[author]?.[manufacturer] || {}).sort((a, b) => parseInt(a) - parseInt(b))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">테스트 상세 정보</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* 기본 정보 */}
          <div className="modal-section">
            <h3 className="modal-section-title">기본 정보</h3>
            <div className="modal-info-item">
              <span className="modal-info-label">테스트 날짜:</span>
              <span className="modal-info-value">
                {date ? new Date(date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : new Date(firstTest.date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {firstTest.timeSlot && ` (${firstTest.timeSlot})`}
              </span>
            </div>
          </div>

          {/* 회차별 상세 점수 - 작성자별로 표시 */}
          <div className="modal-section">
            <h3 className="modal-section-title">회차별 상세 점수</h3>
            <div className="modal-authors-container">
              {/* 모든 작성자 중 최대 회차 수 계산 (그래프 너비 통일용) */}
              {(() => {
                let maxTotalBars = 0
                sortedAuthors.forEach(author => {
                  const sortedManufacturers = getSortedManufacturersForAuthor(author)
                  let maxUsagesForAuthor = 0
                  sortedManufacturers.forEach(manufacturer => {
                    const usages = getSortedUsagesForAuthorAndManufacturer(author, manufacturer)
                    maxUsagesForAuthor = Math.max(maxUsagesForAuthor, usages.length)
                  })
                  const totalBarsForAuthor = sortedManufacturers.length * maxUsagesForAuthor
                  maxTotalBars = Math.max(maxTotalBars, totalBarsForAuthor)
                })
                
                // 모든 작성자에 동일한 너비 적용
                const calculateBarWidth = () => {
                  if (maxTotalBars <= 5) return 60
                  if (maxTotalBars <= 10) return 45
                  if (maxTotalBars <= 15) return 35
                  return 28
                }
                const barWidth = calculateBarWidth()
                
                return sortedAuthors.map((author) => {
                  const sortedManufacturers = getSortedManufacturersForAuthor(author)
                  
                  return (
                    <div key={author} className="modal-author-section">
                      <div className="modal-author-header">
                        <h4 className="modal-author-title">{author}</h4>
                      </div>
                      <div className="modal-scores-chart-container">
                        <div 
                          className="modal-scores-table"
                          style={{ '--test-items-count': testItems.length }}
                        >
                          {/* 항목별 점수 행 */}
                          {testItems.map((item, index) => {
                            const maxScore = 5
                            const maxHeight = 150
                            
                            return (
                              <div key={index} className="modal-score-item-row">
                                <div className="modal-score-item-name">{item}</div>
                                <div className="modal-score-bars-row">
                                  {sortedManufacturers.map((manufacturer) => {
                                    const sortedUsages = getSortedUsagesForAuthorAndManufacturer(author, manufacturer)
                                    // 제조사별 색상 (공통 유틸리티 사용)
                                    const color = manufacturerColorMap.get(manufacturer)
                                    if (!color) return null
                                    
                                    return (
                                      <div key={manufacturer} className="modal-manufacturer-group">
                                        <div className="modal-manufacturer-label-above">{manufacturer}</div>
                                        <div className="modal-usage-bars-group">
                                          {sortedUsages.map((usage) => {
                                            const testForUsage = testsByAuthorManufacturerAndUsage[author][manufacturer][usage][0]
                                            const score = testForUsage.scores?.[item] || 0
                                            const height = (score / maxScore) * maxHeight
                                            
                                            return (
                                              <div key={usage} className="modal-usage-bar-item">
                                                <div
                                                  className="modal-score-bar-vertical"
                                                  style={{ 
                                                    height: `${height}px`,
                                                    background: color.gradient,
                                                    width: `${barWidth}px`
                                                  }}
                                                  title={`${author} - ${manufacturer} ${usage}회차: ${score}점`}
                                                >
                                                  <span className="modal-score-bar-value">{score}</span>
                                                </div>
                                                <div className="modal-score-bar-info">
                                                  <span className="modal-score-usage">{usage}차</span>
                                                  <span className="modal-score-text">{score}점</span>
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                          
                          {/* 전체 점수 행 */}
                          <div className="modal-score-item-row modal-total-score-row">
                            <div className="modal-score-item-name">전체 점수</div>
                            <div className="modal-score-bars-row">
                              {sortedManufacturers.map((manufacturer) => {
                                const sortedUsages = getSortedUsagesForAuthorAndManufacturer(author, manufacturer)
                                // 제조사별 색상 (공통 유틸리티 사용)
                                const color = manufacturerColorMap.get(manufacturer)
                                if (!color) return null
                                
                                return (
                                  <div key={manufacturer} className="modal-manufacturer-group">
                                    <div className="modal-manufacturer-label-above">{manufacturer}</div>
                                    <div className="modal-usage-bars-group">
                                      {sortedUsages.map((usage) => {
                                        const testForUsage = testsByAuthorManufacturerAndUsage[author][manufacturer][usage][0]
                                        // 전체 점수 계산 (100점 만점 기준)
                                        const totalScore = testForUsage.totalScore || 
                                          Object.values(testForUsage.scores || {}).reduce((sum, score) => sum + (score || 0), 0)
                                        const maxTotalScore = 100
                                        const maxHeight = 150
                                        const height = (totalScore / maxTotalScore) * maxHeight
                                        
                                        return (
                                          <div key={usage} className="modal-usage-bar-item">
                                            <div
                                              className="modal-score-bar-vertical"
                                              style={{ 
                                                height: `${height}px`,
                                                background: color.gradient,
                                                width: `${barWidth}px`
                                              }}
                                              title={`${author} - ${manufacturer} ${usage}회차: ${totalScore}점`}
                                            >
                                              <span className="modal-score-bar-value">{totalScore}</span>
                                            </div>
                                            <div className="modal-score-bar-info">
                                              <span className="modal-score-usage">{usage}차</span>
                                              <span className="modal-score-text">{totalScore}점</span>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>

          {/* 개선사항 및 삭제 버튼 */}
          {sortedAuthors.map(author => {
            const sortedManufacturers = getSortedManufacturersForAuthor(author)
            return sortedManufacturers.map(manufacturer => {
              const sortedUsages = getSortedUsagesForAuthorAndManufacturer(author, manufacturer)
              return sortedUsages.map(usage => {
                const testForUsage = testsByAuthorManufacturerAndUsage[author][manufacturer][usage][0]
                const hasImprovement = testForUsage.improvement
                
                return (
                  <div key={`${author}-${manufacturer}-${usage}`} className="modal-section">
                    {hasImprovement && (
                      <>
                        <h3 className="modal-section-title">{author} - {manufacturer} {usage}회차 개선사항(향,색상 추가)</h3>
                        <div className="modal-improvement">
                          {testForUsage.improvement}
                        </div>
                      </>
                    )}
                    <div className="modal-delete-section">
                      <div className="modal-delete-author-name-small">{author}</div>
                      <button 
                        className="modal-delete-button" 
                        onClick={() => handleDelete(testForUsage.id)}
                      >
                        {manufacturer} {usage}회차 삭제
                      </button>
                    </div>
                  </div>
                )
              })
            })
          })}
        </div>

        <div className="modal-footer">
          <button className="modal-full-download-button" onClick={handleFullExcelDownload}>
            📥 전체 다운로드
          </button>
          <button className="modal-download-button" onClick={handleFilteredExcelDownload}>
            📥 다운로드
          </button>
          <button className="modal-close-button" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}

export default TestDetailModal

