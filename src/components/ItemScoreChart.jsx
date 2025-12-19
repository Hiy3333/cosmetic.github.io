import React, { useMemo } from 'react'
import { createManufacturerColorMap } from '../utils/colors'
import './ItemScoreChart.css'

function ItemScoreChart({ testData, itemName, selectedManufacturer, selectedAuthor }) {
  if (testData.length === 0) {
    return (
      <div className="item-chart-empty">
        <p>표시할 데이터가 없습니다.</p>
      </div>
    )
  }

  // 모든 제조사 목록 (데이터에서 추출, 정렬하여 일관성 유지)
  const allManufacturers = useMemo(() => {
    return [...new Set(testData.map(test => test.manufacturer).filter(Boolean))].sort()
  }, [testData])

  // 제조사별 색상 매핑 (공통 유틸리티 사용)
  const manufacturerColorMap = useMemo(() => {
    return createManufacturerColorMap(allManufacturers)
  }, [allManufacturers])

  // 해당 항목의 점수가 있는 모든 테스트
  const filteredTests = useMemo(() => {
    return testData
      .filter(test => test.scores && test.scores[itemName] !== undefined)
      .map(test => ({
        ...test,
        manufacturer: test.manufacturer || '미지정',
        usageCount: test.usageCount || '0',
        score: test.scores[itemName]
      }))
  }, [testData, itemName])

  // 날짜별로 정렬하여 표시
  const allDates = useMemo(() => {
    const dates = new Set(filteredTests.map(test => test.date))
    return Array.from(dates).sort((a, b) => new Date(a) - new Date(b))
  }, [filteredTests])

  if (filteredTests.length === 0) {
    return (
      <div className="item-chart-empty">
        <p>"{itemName}" 항목에 대한 데이터가 없습니다.</p>
      </div>
    )
  }

  // 최대 점수 (5점)
  const maxScore = 5
  // 실제 사용 가능한 높이: 320px (컨테이너 높이) - 50px (padding-bottom) = 270px
  // 숫자가 잘리지 않도록 충분한 여유를 두고 170px로 설정
  // 4점 = (4/5) * 170 = 136px, 5점 = (5/5) * 170 = 170px (차이 34px로 명확함)
  // 숫자 공간(약 30px)을 고려하여 컨테이너 높이 320px에서 충분히 표시됨
  const maxChartHeight = 170

  // 날짜 포맷팅 (MM/DD)
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  // 평균 점수 계산
  const allScores = filteredTests.map(test => test.score)
  const averageScore = allScores.length > 0 
    ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length 
    : 0

  return (
    <div className="item-score-chart">
      <div className="item-chart-header">
        <h3 className="item-chart-title">{itemName}</h3>
        <div className="item-chart-stats">
          <span className="item-chart-stat">
            평균: <strong>{averageScore.toFixed(2)}점</strong>
          </span>
          <span className="item-chart-stat">
            테스트 수: <strong>{allScores.length}회</strong>
          </span>
        </div>
      </div>

      {/* 제조사별 범례 */}
      {!selectedManufacturer && allManufacturers.length > 1 && (
        <div className="item-chart-legend">
          {allManufacturers.map((mfr) => {
            const color = manufacturerColorMap.get(mfr)
            if (!color) return null
            return (
              <div key={mfr} className="item-chart-legend-item">
                <span 
                  className="item-chart-legend-color" 
                  style={{ background: color.gradient }}
                ></span>
                <span className="item-chart-legend-label">{mfr}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="item-chart-container">
        <div className="item-chart-bars-container">
          <div className="item-chart-bars">
            {allDates.map((date, dateIndex) => {
              // 해당 날짜의 모든 테스트
              const dayTests = filteredTests.filter(test => test.date === date)
              
              if (dayTests.length === 0) {
                return (
                  <div key={`empty-${dateIndex}`} className="item-chart-bar-wrapper">
                    <div className="item-chart-bar-container">
                      <div className="item-chart-bar-empty"></div>
                    </div>
                    <div className="item-chart-bar-label">{formatDate(date)}</div>
                  </div>
                )
              }
              
              // 항상 제조사별 평균값으로 표시 (작성자, 회차는 평균내서 제조사별 비교)
              const shouldShowAverage = true
              
              if (shouldShowAverage) {
                // 제조사별로 그룹화하여 평균값 계산
                const testsByManufacturer = {}
                dayTests.forEach(test => {
                  const manufacturer = test.manufacturer || '기타'
                  if (!testsByManufacturer[manufacturer]) {
                    testsByManufacturer[manufacturer] = []
                  }
                  testsByManufacturer[manufacturer].push(test)
                })
                
                // 제조사 목록 정렬
                const sortedManufacturers = Object.keys(testsByManufacturer).sort()
                
                // 각 제조사별 평균 점수 계산
                const manufacturerAverages = {}
                sortedManufacturers.forEach(manufacturer => {
                  const manufacturerTests = testsByManufacturer[manufacturer]
                  const totalScore = manufacturerTests.reduce((sum, test) => sum + test.score, 0)
                  const averageScore = totalScore / manufacturerTests.length
                  // 샘플 번호 가져오기 (첫 번째 테스트의 샘플 번호 사용)
                  const sampleNumber = manufacturerTests[0]?.sampleNumber || ''
                  manufacturerAverages[manufacturer] = {
                    score: averageScore,
                    count: manufacturerTests.length,
                    sampleNumber: sampleNumber
                  }
                })
                
                const totalBars = sortedManufacturers.length
                const barWidth = 60 // 평균값일 때는 고정 너비
                
                return (
                  <div key={`${date}-${dateIndex}`} className="item-chart-bar-wrapper">
                    <div className="item-chart-bar-container">
                      <div className="item-chart-bars-horizontal">
                        {sortedManufacturers.map((manufacturer) => {
                          const avgData = manufacturerAverages[manufacturer]
                          const color = manufacturerColorMap.get(manufacturer)
                          if (!color) return null
                          
                          const height = (avgData.score / maxScore) * maxChartHeight
                          
                          return (
                            <div key={manufacturer} className="item-chart-manufacturer-group">
                              <div className="item-chart-usage-bars-group">
                                <div className="item-chart-bar-horizontal-item">
                                  <div
                                    className="item-chart-bar-grouped"
                                    style={{ 
                                      height: `${height}px`,
                                      background: color.gradient,
                                      width: `${barWidth}px`
                                    }}
                                    title={`${manufacturer} 샘플(${avgData.sampleNumber}) 평균: ${avgData.score.toFixed(1)}점 (${avgData.count}회)`}
                                  >
                                    <span className="item-chart-bar-value">{avgData.score.toFixed(1)}</span>
                                    <span className="item-chart-bar-manufacturer-name">{manufacturer}</span>
                                    <span className="item-chart-bar-sample-number">샘플({avgData.sampleNumber})</span>
                                  </div>
                                  <div className="item-chart-bar-info">
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="item-chart-bar-label">{formatDate(date)}</div>
                  </div>
                )
              } else {
                // 기존 로직 (개별 표시)
                // 제조사별로 그룹화
                const testsByManufacturer = {}
                dayTests.forEach(test => {
                  const manufacturer = test.manufacturer || '기타'
                  if (!testsByManufacturer[manufacturer]) {
                    testsByManufacturer[manufacturer] = []
                  }
                  testsByManufacturer[manufacturer].push(test)
                })
                
                // 제조사 목록 정렬
                const sortedManufacturers = Object.keys(testsByManufacturer).sort()
                
                // 각 제조사 내에서 회차순으로 정렬
                sortedManufacturers.forEach(manufacturer => {
                  testsByManufacturer[manufacturer].sort((a, b) => {
                    const usageA = parseInt(a.usageCount) || 0
                    const usageB = parseInt(b.usageCount) || 0
                    return usageA - usageB
                  })
                })
                
                // 전체 회차 수 계산
                const allUsages = new Set()
                sortedManufacturers.forEach(manufacturer => {
                  testsByManufacturer[manufacturer].forEach(test => {
                    allUsages.add(test.usageCount)
                  })
                })
                const maxUsagesPerManufacturer = Math.max(...sortedManufacturers.map(mfr => testsByManufacturer[mfr].length), 1)
                const totalBars = sortedManufacturers.length * maxUsagesPerManufacturer
                
                // 동적 너비 계산
                const calculateBarWidth = () => {
                  if (totalBars <= 5) return 50
                  if (totalBars <= 10) return 40
                  if (totalBars <= 15) return 35
                  return 30
                }
                const barWidth = calculateBarWidth()
                
                return (
                  <div key={`${date}-${dateIndex}`} className="item-chart-bar-wrapper">
                    <div className="item-chart-bar-container">
                      <div className="item-chart-bars-horizontal">
                        {sortedManufacturers.map((manufacturer, mfrIndex) => {
                          const manufacturerTests = testsByManufacturer[manufacturer]
                          // 제조사별 색상
                          const color = manufacturerColorMap.get(manufacturer)
                          if (!color) return null
                          
                          return (
                            <div key={manufacturer} className="item-chart-manufacturer-group">
                              <div className="item-chart-usage-bars-group">
                                {manufacturerTests.map((test, testIndex) => {
                                  const score = test.score
                                  // 실제 데이터의 최대값에 맞춰 비율 조정 (위로 뚫고 올라가지 않도록)
                                  const height = (score / maxScore) * maxChartHeight
                                  
                                  return (
                                    <div
                                      key={`${test.id || testIndex}-${test.usageCount}`}
                                      className="item-chart-bar-horizontal-item"
                                    >
                                      <div
                                        className="item-chart-bar-grouped"
                                        style={{ 
                                          height: `${height}px`,
                                          background: color.gradient,
                                          width: `${barWidth}px`
                                        }}
                                        title={`${manufacturer} ${test.usageCount}차: ${score.toFixed(1)}점`}
                                      >
                                        <span className="item-chart-bar-value">{score.toFixed(1)}</span>
                                      </div>
                                      <div className="item-chart-bar-info">
                                        <span className="item-chart-bar-usage">{test.usageCount}차</span>
                                        <span className="item-chart-bar-score-text">{score.toFixed(1)}점</span>
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
                    <div className="item-chart-bar-label">{formatDate(date)}</div>
                  </div>
                )
              }
            })}
          </div>
        </div>
      </div>
      <div className="item-chart-x-axis-label">날짜</div>
    </div>
  )
}

export default ItemScoreChart
