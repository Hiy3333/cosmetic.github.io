import React, { useState, useMemo } from 'react'
import { createManufacturerColorMap } from '../utils/colors'
import './ScoreChart.css'

function ScoreChart({ testData, selectedManufacturer, selectedAuthor }) {
  const [currentStartDate, setCurrentStartDate] = useState(() => {
    // 오늘 날짜를 기준으로 월요일 찾기
    const today = new Date()
    const dayOfWeek = today.getDay() // 0=일요일, 1=월요일, ...
    const monday = new Date(today)
    // 일요일(0)인 경우 -6일, 월요일(1)인 경우 0일, ... 토요일(6)인 경우 -5일
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    monday.setDate(today.getDate() - daysToSubtract)
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  // 모든 제조사 목록 (데이터에서 추출, 정렬하여 일관성 유지)
  const allManufacturers = useMemo(() => {
    return [...new Set(testData.map(test => test.manufacturer).filter(Boolean))].sort()
  }, [testData])

  // 제조사별 색상 매핑 (공통 유틸리티 사용)
  const manufacturerColorMap = useMemo(() => {
    return createManufacturerColorMap(allManufacturers)
  }, [allManufacturers])

  // 제조사별, 회차별로 데이터 그룹화 (각 테스트를 개별적으로 유지)
  const allTests = useMemo(() => {
    return testData.map(test => ({
      ...test,
      manufacturer: test.manufacturer || '미지정',
      usageCount: test.usageCount || '0'
    }))
  }, [testData])

  // 현재 주의 7일 데이터 생성 (월~일)
  const currentWeekData = useMemo(() => {
    const weekData = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentStartDate)
      date.setDate(currentStartDate.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      // 해당 날짜의 모든 테스트
      const dayTests = allTests.filter(test => test.date === dateStr)
      
      weekData.push({
        date: dateStr,
        tests: dayTests
      })
    }
    return weekData
  }, [currentStartDate, allTests])

  // 이전 주로 이동 (7일 전)
  const handlePrevWeek = () => {
    const newDate = new Date(currentStartDate)
    newDate.setDate(currentStartDate.getDate() - 7)
    setCurrentStartDate(newDate)
  }

  // 다음 주로 이동 (7일 후)
  const handleNextWeek = () => {
    const newDate = new Date(currentStartDate)
    newDate.setDate(currentStartDate.getDate() + 7)
    setCurrentStartDate(newDate)
  }

  // 주 범위 포맷팅 (월요일 ~ 일요일)
  const formatWeekRange = () => {
    const startDate = new Date(currentStartDate) // 월요일
    const endDate = new Date(currentStartDate)
    endDate.setDate(currentStartDate.getDate() + 6) // 일요일
    
    const formatDate = (date) => {
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}/${day}`
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  // 최대 총점을 100점으로 설정하여 비율 조정
  // 실제 데이터는 18개 항목 * 5점 = 90점이지만, 여유를 두고 100점을 최대값으로 설정
  const maxTotalScore = 100
  // 실제 사용 가능한 높이: 320px (컨테이너 높이) - 50px (padding-bottom) = 270px
  // 숫자가 잘리지 않도록 충분한 여유를 두고 200px로 설정
  // 60점 = (60/100) * 200 = 120px, 100점 = (100/100) * 200 = 200px
  // 숫자 공간(약 30px)을 고려하여 컨테이너 높이 320px에서 충분히 표시됨
  const maxChartHeight = 200

  // 날짜 포맷팅 (MM/DD)
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  // 요일 포맷팅
  const formatDayOfWeek = (dateStr) => {
    const date = new Date(dateStr)
    const dayNames = ['일', '월', '화', '수', '목', '금', '토']
    return dayNames[date.getDay()]
  }


  if (testData.length === 0) {
    return (
      <div className="chart-empty">
        <p>표시할 데이터가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="score-chart">
      {/* 주 네비게이션 */}
      <div className="chart-week-navigation">
        <button
          className="chart-nav-button"
          onClick={handlePrevWeek}
        >
          ←
        </button>
        <div className="chart-week-info">
          {formatWeekRange()}
        </div>
        <button
          className="chart-nav-button"
          onClick={handleNextWeek}
        >
          →
        </button>
      </div>

      {/* 제조사별 범례 */}
      {!selectedManufacturer && allManufacturers.length > 1 && (
        <div className="chart-legend">
          {allManufacturers.map((mfr) => {
            const color = manufacturerColorMap.get(mfr)
            if (!color) return null
            return (
              <div key={mfr} className="chart-legend-item">
                <span 
                  className="chart-legend-color" 
                  style={{ background: color.gradient }}
                ></span>
                <span className="chart-legend-label">{mfr}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="chart-container">
        <div className="chart-bars-container">
          <div className="chart-bars">
            {currentWeekData.map((dayData, index) => {
              const dateStr = dayData.date
              const dayTests = dayData.tests
              
              if (dayTests.length === 0) {
                // 테스트가 없는 날
                return (
                  <div key={`empty-${index}`} className="chart-bar-wrapper">
                    <div className="chart-bar-container">
                      <div className="chart-bar-empty"></div>
                    </div>
                    <div className="chart-bar-label">
                      <div className="chart-date">{formatDate(dateStr)}</div>
                      <div className="chart-day">{formatDayOfWeek(dateStr)}</div>
                    </div>
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
                  const totalScore = manufacturerTests.reduce((sum, test) => sum + parseFloat(test.totalScore || 0), 0)
                  const averageScore = totalScore / manufacturerTests.length
                  manufacturerAverages[manufacturer] = {
                    score: averageScore,
                    count: manufacturerTests.length
                  }
                })
                
                const totalBars = sortedManufacturers.length
                
                return (
                  <div key={`${dateStr}-${index}`} className="chart-bar-wrapper">
                    <div className="chart-bar-container">
                      <div className="chart-bars-group">
                        {sortedManufacturers.map((manufacturer) => {
                          const avgData = manufacturerAverages[manufacturer]
                          const color = manufacturerColorMap.get(manufacturer)
                          if (!color) return null
                          
                          const height = (avgData.score / maxTotalScore) * maxChartHeight
                          
                          return (
                            <div
                              key={manufacturer}
                              className="chart-bar-grouped"
                              style={{ 
                                height: `${height}px`,
                                background: color.gradient,
                                width: `${100 / totalBars}%`
                              }}
                              title={`${manufacturer} 평균: ${avgData.score.toFixed(1)}점 (${avgData.count}회)`}
                            >
                              <span className="chart-bar-value">{avgData.score.toFixed(1)}</span>
                              <span className="chart-bar-manufacturer-name">{manufacturer}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="chart-bar-label">
                      <div className="chart-date">{formatDate(dateStr)}</div>
                      <div className="chart-day">{formatDayOfWeek(dateStr)}</div>
                    </div>
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
                
                // 제조사 목록 정렬 (첫 번째 제조사가 왼쪽에 오도록)
                const sortedManufacturers = Object.keys(testsByManufacturer).sort()
                
                // 각 제조사 내에서 회차순으로 정렬 (1차, 2차, 3차 순서)
                sortedManufacturers.forEach(manufacturer => {
                  testsByManufacturer[manufacturer].sort((a, b) => {
                    const usageA = parseInt(a.usageCount) || 0
                    const usageB = parseInt(b.usageCount) || 0
                    return usageA - usageB
                  })
                })
                
                // 전체 막대 수 계산
                const totalBars = sortedManufacturers.reduce((sum, mfr) => sum + testsByManufacturer[mfr].length, 0)
                
                return (
                  <div key={`${dateStr}-${index}`} className="chart-bar-wrapper">
                    <div className="chart-bar-container">
                      <div className="chart-bars-group">
                        {sortedManufacturers.map((manufacturer) => {
                          const manufacturerTests = testsByManufacturer[manufacturer]
                          const color = manufacturerColorMap.get(manufacturer)
                          if (!color) return null
                          
                          return manufacturerTests.map((test, testIndex) => {
                            const score = parseFloat(test.totalScore || 0)
                            // 실제 데이터의 최대값에 맞춰 비율 조정 (위로 뚫고 올라가지 않도록)
                            const height = (score / maxTotalScore) * maxChartHeight
                            const usage = test.usageCount || '0'
                            
                            return (
                              <div
                                key={`${test.id || testIndex}-${test.manufacturer}-${usage}`}
                                className="chart-bar-grouped"
                                style={{ 
                                  height: `${height}px`,
                                  background: color.gradient,
                                  width: `${100 / totalBars}%`
                                }}
                                title={`${manufacturer} ${usage}차: ${score}점`}
                              >
                                <span className="chart-bar-value">{score}</span>
                                <span className="chart-bar-usage">{usage}차</span>
                              </div>
                            )
                          })
                        })}
                      </div>
                    </div>
                    <div className="chart-bar-label">
                      <div className="chart-date">{formatDate(dateStr)}</div>
                      <div className="chart-day">{formatDayOfWeek(dateStr)}</div>
                      <div className="chart-score">
                        {dayTests.length > 1 
                          ? `${dayTests.reduce((sum, t) => sum + parseFloat(t.totalScore || 0), 0)}점 (${dayTests.length}회)`
                          : `${dayTests[0].totalScore}점`
                        }
                      </div>
                    </div>
                  </div>
                )
              }
            })}
          </div>
        </div>
      </div>
      <div className="chart-x-axis-label">날짜</div>
    </div>
  )
}

export default ScoreChart
