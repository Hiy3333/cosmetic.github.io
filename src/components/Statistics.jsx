import React, { useState, useEffect } from 'react'
import { getTestData, getAllManufacturers, getManufacturers, getAllAuthors, getAuthors, getTestDataByDateAndManufacturer, getTestDataByAuthorAndManufacturer, subscribeToTests, subscribeToManufacturers, subscribeToAuthors } from '../utils/storage'
import { migrateOilnessToStickiness, migrateViscosityName } from '../utils/migrateData'
import Calendar from './Calendar'
import ScoreChart from './ScoreChart'
import TestDetailModal from './TestDetailModal'
import ItemScoreChart from './ItemScoreChart'
import './Statistics.css'

// 테스트 항목 목록
const testItems = [
  '점도(육안)',
  '제형 안정성',
  '롤링감(뭉침)',
  '흡수 속도',
  '흡수 후 잔감',
  '재도포',
  '후속화장품 흡수',
  '수분감(속)',
  '수분감(겉)',
  '피부결 개선',
  '진정감',
  '보습 지속력',
  '따가움',
  '가려움',
  '홍반',
  '열감',
  '트러블',
  '피막감',
  '끈적임',
  '타깃 제품과 제형 유사성'
]

function Statistics() {
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [selectedManufacturer, setSelectedManufacturer] = useState('')
  const [authors, setAuthors] = useState([])
  const [manufacturers, setManufacturers] = useState([])
  const [testData, setTestData] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTest, setSelectedTest] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showItemChart, setShowItemChart] = useState(false)

  // 컴포넌트 마운트 시 및 페이지 포커스 시 데이터 로드
  useEffect(() => {
    // 마이그레이션 실행 (한 번만 실행되도록 localStorage 체크)
    const migrationKey1 = 'data_migration_oilness_to_stickiness_done'
    const migrationKey2 = 'data_migration_viscosity_name_done'
    const isMigration1Done = localStorage.getItem(migrationKey1)
    const isMigration2Done = localStorage.getItem(migrationKey2)
    
    const runMigrations = async () => {
      let needsRefresh = false
      
      // 유분감 -> 끈적임 마이그레이션
      if (!isMigration1Done) {
        const success = await migrateOilnessToStickiness()
        if (success) {
          localStorage.setItem(migrationKey1, 'true')
          console.log('유분감 -> 끈적임 마이그레이션 완료')
          needsRefresh = true
        }
      }
      
      // 점도 -> 점도(육안) 마이그레이션
      if (!isMigration2Done) {
        const success = await migrateViscosityName()
        if (success) {
          localStorage.setItem(migrationKey2, 'true')
          console.log('점도 -> 점도(육안) 마이그레이션 완료')
          needsRefresh = true
        }
      }
      
      // 마이그레이션이 실행되었으면 데이터 새로고침
      if (needsRefresh) {
        loadData(false)
      } else {
        loadData(false) // 초기 로드 시에는 선택 유지 안 함
      }
    }
    
    runMigrations()
    
    // 페이지가 포커스를 받을 때 데이터 새로고침 (선택 유지)
    const handleFocus = () => {
      loadData(true)
    }
    window.addEventListener('focus', handleFocus)
    
    // 페이지가 보일 때 데이터 새로고침 (탭 전환 등)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // 통계 페이지로 이동할 때 데이터 새로고침
    const handleRefreshStatistics = () => {
      loadData(true)
    }
    window.addEventListener('refreshStatistics', handleRefreshStatistics)
    
    // 실시간 동기화 구독
    const unsubscribeTests = subscribeToTests(() => {
      loadData(true) // 데이터 변경 시 자동 새로고침
    })
    
    const unsubscribeManufacturers = subscribeToManufacturers(() => {
      loadData(true) // 제조사 목록 변경 시 자동 새로고침
    })
    
    const unsubscribeAuthors = subscribeToAuthors(() => {
      loadData(true) // 작성자 목록 변경 시 자동 새로고침
    })
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('refreshStatistics', handleRefreshStatistics)
      unsubscribeTests()
      unsubscribeManufacturers()
      unsubscribeAuthors()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 작성자와 제조사 선택 시 데이터 필터링
  useEffect(() => {
    const filterData = async () => {
      const allData = await getTestData()
      let filtered = allData
      
      if (selectedAuthor) {
        filtered = filtered.filter(test => test.author === selectedAuthor)
      }
      
      if (selectedManufacturer) {
        filtered = filtered.filter(test => test.manufacturer === selectedManufacturer)
      }
      
      setTestData(filtered)
    }
    
    filterData()
  }, [selectedAuthor, selectedManufacturer])

  // 데이터 로드 (제조사 선택은 변경하지 않음)
  const loadData = async (preserveSelection = true) => {
    try {
      // 테스트 데이터에서 추출한 작성자와 저장된 작성자 목록을 합침
      const testDataAuthors = await getAllAuthors()
      const savedAuthors = await getAuthors()
      const allAuthors = [...new Set([...testDataAuthors, ...savedAuthors])].sort()
      setAuthors(allAuthors)
      
      // 테스트 데이터에서 추출한 제조사와 저장된 제조사 목록을 합침
      const testDataManufacturers = await getAllManufacturers()
      const savedManufacturers = await getManufacturers()
      const allManufacturers = [...new Set([...testDataManufacturers, ...savedManufacturers])].sort()
      setManufacturers(allManufacturers)
    
    // 작성자 목록이 변경되었을 때 현재 선택된 작성자가 목록에 없으면 "전체"로 설정
    if (allAuthors.length > 0) {
      if (selectedAuthor && !allAuthors.includes(selectedAuthor)) {
        // 현재 선택된 작성자가 목록에 없으면 "전체"로 설정
        setSelectedAuthor('')
      }
      // 선택이 없거나 목록에 있으면 유지 (기본값은 "전체"(''))
    } else {
      setSelectedAuthor('')
    }
    
    // 제조사 목록이 변경되었을 때
    if (allManufacturers.length > 0) {
      if (preserveSelection) {
        // 선택 유지 모드: 현재 선택된 제조사가 목록에 없을 때만 변경
        // 단, 선택이 없으면 "전체"('')로 유지
        if (selectedManufacturer && !allManufacturers.includes(selectedManufacturer)) {
          // 현재 선택된 제조사가 목록에 없으면 "전체"로 설정
          setSelectedManufacturer('')
        }
        // 현재 선택된 제조사가 목록에 있거나 "전체"('')이면 유지
      } else {
        // 초기 로드 시: "전체"('')로 설정
        if (!selectedManufacturer) {
          setSelectedManufacturer('')
        } else if (!allManufacturers.includes(selectedManufacturer)) {
          // 현재 선택된 제조사가 목록에 없으면 "전체"로 설정
          setSelectedManufacturer('')
        }
        // 현재 선택된 제조사가 목록에 있으면 유지
      }
    } else {
      setSelectedManufacturer('')
    }
    
    // 테스트 데이터도 새로고침
    const allData = await getTestData()
    let filtered = allData
    
    if (selectedAuthor) {
      filtered = filtered.filter(test => test.author === selectedAuthor)
    }
    
    if (selectedManufacturer) {
      filtered = filtered.filter(test => test.manufacturer === selectedManufacturer)
    }
    
    setTestData(filtered)
    } catch (error) {
      console.error('데이터 로드 실패:', error)
    }
  }

  // 날짜 클릭 핸들러
  const handleDateClick = async (date) => {
    try {
      let tests = []
      
      if (selectedAuthor && selectedManufacturer) {
        // 작성자와 제조사가 모두 선택된 경우
        const authorManufacturerTests = await getTestDataByAuthorAndManufacturer(selectedAuthor, selectedManufacturer)
        tests = authorManufacturerTests.filter(test => test.date === date)
      } else if (selectedAuthor) {
        // 작성자만 선택된 경우
        const allData = await getTestData()
        tests = allData.filter(test => test.author === selectedAuthor && test.date === date)
      } else if (selectedManufacturer) {
        // 제조사만 선택된 경우
        tests = await getTestDataByDateAndManufacturer(date, selectedManufacturer)
      } else {
        // 둘 다 선택되지 않은 경우 해당 날짜의 모든 테스트
        const allData = await getTestData()
        tests = allData.filter(test => test.date === date)
      }
      
      // 회차순으로 정렬
      tests.sort((a, b) => {
        const usageA = parseInt(a.usageCount) || 0
        const usageB = parseInt(b.usageCount) || 0
        return usageA - usageB
      })
      
      if (tests.length > 0) {
        setSelectedDate(date)
        // 모든 테스트를 전달 (회차별 표시를 위해)
        setSelectedTest(tests)
        setShowModal(true)
      }
    } catch (error) {
      console.error('날짜 클릭 처리 실패:', error)
    }
  }

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedDate(null)
    setSelectedTest(null)
  }

  // 테스트 삭제 후 데이터 새로고침
  const handleTestDelete = async () => {
    try {
      // 현재 선택된 작성자와 제조사 저장
      const currentAuthor = selectedAuthor
      const currentManufacturer = selectedManufacturer
      
      // 목록만 업데이트하고 선택은 유지
      const testDataAuthors = await getAllAuthors()
      const savedAuthors = await getAuthors()
      const allAuthors = [...new Set([...testDataAuthors, ...savedAuthors])].sort()
      setAuthors(allAuthors)
      
      // 테스트 데이터에서 추출한 제조사와 저장된 제조사 목록을 합침
      const testDataManufacturers = await getAllManufacturers()
      const savedManufacturers = await getManufacturers()
      const allManufacturers = [...new Set([...testDataManufacturers, ...savedManufacturers])].sort()
      setManufacturers(allManufacturers)
    
    // 작성자 유지 (목록에 없으면 "전체"로)
    if (allAuthors.length > 0) {
      if (currentAuthor && allAuthors.includes(currentAuthor)) {
        setSelectedAuthor(currentAuthor)
      } else {
        // 목록에 없으면 "전체"로 설정
        setSelectedAuthor('')
      }
    } else {
      setSelectedAuthor('')
    }
    
    // 제조사 유지 (목록에 없으면 "전체"로)
    if (allManufacturers.length > 0) {
      if (currentManufacturer && allManufacturers.includes(currentManufacturer)) {
        // 현재 선택된 제조사가 목록에 있으면 유지
        setSelectedManufacturer(currentManufacturer)
      } else {
        // 현재 선택된 제조사가 목록에 없으면 "전체"로 설정
        setSelectedManufacturer('')
      }
    } else {
      setSelectedManufacturer('')
    }
    } catch (error) {
      console.error('테스트 삭제 후 데이터 새로고침 실패:', error)
    }
  }

  // 테스트가 있는 날짜 목록
  const getTestDates = () => {
    const dates = [...new Set(testData.map(test => test.date).filter(Boolean))]
    console.log('통계 페이지 테스트 날짜 목록:', dates)
    console.log('현재 testData:', testData)
    return dates
  }

  // 테스트 항목 클릭 핸들러
  const handleItemClick = (itemName) => {
    setSelectedItem(itemName)
    setShowItemChart(true)
  }

  // 항목 차트 닫기
  const handleCloseItemChart = () => {
    setShowItemChart(false)
    setSelectedItem(null)
  }

  return (
    <div className="statistics">
      <h1 className="statistics-title">진행상황 통계</h1>

      {/* 작성자 선택 */}
      <div className="author-selector">
        <label>작성자 선택:</label>
        <select
          value={selectedAuthor}
          onChange={(e) => setSelectedAuthor(e.target.value)}
          className="author-select"
        >
          <option value="">전체</option>
          {authors.map((auth, index) => (
            <option key={index} value={auth}>{auth}</option>
          ))}
        </select>
      </div>

      {/* 제조사 선택 */}
      <div className="manufacturer-selector">
        <label>제조사 선택:</label>
        <select
          value={selectedManufacturer}
          onChange={(e) => setSelectedManufacturer(e.target.value)}
          className="manufacturer-select"
        >
          <option value="">전체</option>
          {manufacturers.map((mfr, index) => (
            <option key={index} value={mfr}>{mfr}</option>
          ))}
        </select>
      </div>

      {/* 통계 요약 */}
      <div className="statistics-summary">
        <div className="summary-card">
          <div className="summary-label">총 테스트 수</div>
          <div className="summary-value">
            {testData.length > 0 
              ? [...new Set(testData.map(test => test.id))].length 
              : 0
            }회
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">평균 총점</div>
          <div className="summary-value">
            {testData.length > 0
              ? (testData.reduce((sum, test) => sum + parseFloat(test.totalScore || 0), 0) / testData.length).toFixed(1)
              : '0.0'
            }점
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">테스트 일수</div>
          <div className="summary-value">{getTestDates().length}일</div>
        </div>
      </div>

      {/* 달력 */}
      <div className="calendar-section">
        <h2 className="section-title">테스트 일정</h2>
        <Calendar
          testDates={getTestDates()}
          testData={testData}
          onDateClick={handleDateClick}
        />
        {/* 오늘의 평균 총점 */}
        {(() => {
          const today = new Date().toISOString().split('T')[0]
          const todayTests = testData.filter(test => test.date === today)
          if (todayTests.length > 0) {
            const avgTotalScore = (todayTests.reduce((sum, test) => sum + parseFloat(test.totalScore || 0), 0) / todayTests.length).toFixed(1)
            return (
              <div className="today-score-display">
                <span className="today-score-label">오늘의 평균 총점:</span>
                <span className="today-score-value">{avgTotalScore}점</span>
              </div>
            )
          }
          return null
        })()}
      </div>

      {/* 테스트 항목 그리드 */}
      <div className="test-items-section">
        <h2 className="section-title">테스트 항목별 점수 추이</h2>
        <p className="section-description">항목을 클릭하면 해당 항목의 점수 추이를 확인할 수 있습니다.</p>
        <div className="test-items-grid">
          {testItems.map((item, index) => (
            <div
              key={index}
              className="test-item-card"
              onClick={() => handleItemClick(item)}
            >
              <div className="test-item-card-content">
                <span className="test-item-card-name">{item}</span>
                <span className="test-item-card-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 전체 총점 추이 그래프 */}
      <div className="chart-section">
        <h2 className="section-title">전체 총점 추이</h2>
        <ScoreChart testData={testData} selectedManufacturer={selectedManufacturer} selectedAuthor={selectedAuthor} />
      </div>

      {/* 테스트 상세 모달 */}
      {showModal && selectedTest && (
        <TestDetailModal
          tests={Array.isArray(selectedTest) ? selectedTest : [selectedTest]}
          date={selectedDate}
          onClose={handleCloseModal}
          onDelete={handleTestDelete}
          selectedAuthor={selectedAuthor}
          selectedManufacturer={selectedManufacturer}
        />
      )}

      {/* 항목별 점수 차트 모달 */}
      {showItemChart && selectedItem && (
        <div className="item-chart-modal-overlay" onClick={handleCloseItemChart}>
          <div className="item-chart-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="item-chart-modal-header">
              <h2 className="item-chart-modal-title">항목별 점수 추이</h2>
              <button className="item-chart-modal-close" onClick={handleCloseItemChart}>✕</button>
            </div>
            <div className="item-chart-modal-body">
              <ItemScoreChart testData={testData} itemName={selectedItem} selectedManufacturer={selectedManufacturer} selectedAuthor={selectedAuthor} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Statistics

