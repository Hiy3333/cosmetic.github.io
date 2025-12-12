import React, { useState, useMemo } from 'react'
import { createManufacturerColorMap } from '../utils/colors'
import './Calendar.css'

function Calendar({ testDates, testData = [], onDateClick }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // 모든 제조사 목록 추출 및 색상 매핑
  const manufacturerColorMap = useMemo(() => {
    const allManufacturers = [...new Set(testData.map(test => test.manufacturer).filter(Boolean))].sort()
    return createManufacturerColorMap(allManufacturers)
  }, [testData])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // 해당 월의 첫 번째 날과 마지막 날
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // 날짜 형식 변환 (YYYY-MM-DD)
  const formatDate = (year, month, day) => {
    const monthStr = String(month + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${year}-${monthStr}-${dayStr}`
  }

  // 해당 날짜에 테스트가 있는지 확인
  const hasTest = (day) => {
    const dateStr = formatDate(year, month, day)
    return testDates.includes(dateStr)
  }

  // 해당 날짜의 제조사별 평균 총점 가져오기
  const getManufacturerAverageScoresForDate = (day) => {
    const dateStr = formatDate(year, month, day)
    const testsForDate = testData.filter(test => test.date === dateStr)
    if (testsForDate.length === 0) return null
    
    // 제조사별로 그룹화
    const testsByManufacturer = {}
    testsForDate.forEach(test => {
      const manufacturer = test.manufacturer || '기타'
      if (!testsByManufacturer[manufacturer]) {
        testsByManufacturer[manufacturer] = []
      }
      testsByManufacturer[manufacturer].push(test)
    })
    
    // 각 제조사별 평균 점수 계산
    const manufacturerAverages = {}
    Object.keys(testsByManufacturer).sort().forEach(manufacturer => {
      const manufacturerTests = testsByManufacturer[manufacturer]
      const totalScore = manufacturerTests.reduce((sum, test) => sum + parseFloat(test.totalScore || 0), 0)
      const averageScore = totalScore / manufacturerTests.length
      manufacturerAverages[manufacturer] = Math.round(averageScore)
    })
    
    return manufacturerAverages
  }

  // 오늘인지 확인
  const isToday = (day) => {
    const today = new Date()
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    )
  }

  // 달력 그리드 생성
  const calendarDays = []
  
  // 빈 칸 (이전 달의 날짜)
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // 현재 달의 날짜
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="calendar-nav-btn">‹</button>
        <div className="calendar-month-year">
          <span className="calendar-month">{monthNames[month]}</span>
          <span className="calendar-year">{year}</span>
        </div>
        <button onClick={goToNextMonth} className="calendar-nav-btn">›</button>
        <button onClick={goToToday} className="calendar-today-btn">오늘</button>
      </div>

      <div className="calendar-weekdays">
        {dayNames.map((day, index) => (
          <div key={index} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-days">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="calendar-day empty"></div>
          }

          const dateStr = formatDate(year, month, day)
          const testExists = hasTest(day)
          const today = isToday(day)
          const manufacturerAverages = getManufacturerAverageScoresForDate(day)

          return (
            <div
              key={index}
              className={`calendar-day ${testExists ? 'has-test' : ''} ${today ? 'today' : ''}`}
              onClick={() => testExists && onDateClick(dateStr)}
            >
              <span className="calendar-day-number">{day}</span>
              {manufacturerAverages !== null && (
                <div className="calendar-day-scores">
                  {Object.keys(manufacturerAverages).map(manufacturer => {
                    const color = manufacturerColorMap.get(manufacturer)
                    const colorStyle = color ? { color: color.solid } : {}
                    return (
                      <span key={manufacturer} className="calendar-day-score-item" style={colorStyle}>
                        {manufacturer}: {manufacturerAverages[manufacturer]}
                      </span>
                    )
                  })}
                </div>
              )}
              {testExists && <span className="calendar-test-indicator"></span>}
            </div>
          )
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-indicator today"></span>
          <span>오늘</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator test"></span>
          <span>테스트 진행일</span>
        </div>
      </div>
    </div>
  )
}

export default Calendar

