import React, { useState, useRef } from 'react'
import './Step2Form.css'

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
  '유분감',
  '타깃 제품과 제형 유사성'
]

function Step2Form({ onNext, onBack }) {
  const [scores, setScores] = useState({})
  const [improvement, setImprovement] = useState('')
  const [negativeFeedback, setNegativeFeedback] = useState({}) // 피막감, 유분감의 부정적 피드백
  const [confirmedItems, setConfirmedItems] = useState({}) // 확인 버튼을 누른 항목들
  const itemRefs = useRef({})

  // 점수 선택 핸들러
  const handleScoreChange = (item, score) => {
    setScores(prev => ({
      ...prev,
      [item]: score
    }))
    
    // 피막감, 유분감, 제형 안정성에서 매우 별로다(1점) 또는 별로다(2점)를 선택하지 않으면 확인 상태 초기화
    if ((item === '피막감' || item === '유분감' || item === '제형 안정성') && score !== 1 && score !== 2) {
      setConfirmedItems(prev => {
        const newState = { ...prev }
        delete newState[item]
        return newState
      })
      setNegativeFeedback(prev => {
        const newState = { ...prev }
        delete newState[item]
        return newState
      })
    }
    
    // 후속화장품 흡수, 점도(육안)는 점수가 변경되면 확인 상태 초기화 (다시 입력하도록)
    if ((item === '후속화장품 흡수' || item === '점도(육안)') && confirmedItems[item]) {
      setConfirmedItems(prev => {
        const newState = { ...prev }
        delete newState[item]
        return newState
      })
      setNegativeFeedback(prev => {
        const newState = { ...prev }
        delete newState[item]
        return newState
      })
    }
    
    // 텍스트창이 필요한 항목들은 자동 스크롤하지 않음
    const itemsNeedingFeedback = ['피막감', '유분감', '제형 안정성', '후속화장품 흡수', '점도(육안)']
    const needsFeedback = itemsNeedingFeedback.includes(item) && (
      // 피막감, 유분감, 제형 안정성: 1점 또는 2점 선택 시
      ((item === '피막감' || item === '유분감' || item === '제형 안정성') && (score === 1 || score === 2)) ||
      // 후속화장품 흡수, 점도(육안): 어떤 점수든 선택 시
      (item === '후속화장품 흡수' || item === '점도(육안)')
    )
    
    // 텍스트창이 필요하지 않은 경우에만 다음 항목으로 스크롤 이동
    if (!needsFeedback) {
      setTimeout(() => {
        const currentIndex = testItems.indexOf(item)
        if (currentIndex < testItems.length - 1) {
          const nextItem = testItems[currentIndex + 1]
          const nextElement = itemRefs.current[nextItem]
          const container = document.querySelector('.test-items-container')
          
          if (nextElement && container) {
            // 컨테이너 내부에서만 스크롤
            const containerRect = container.getBoundingClientRect()
            const elementRect = nextElement.getBoundingClientRect()
            
            // 요소가 컨테이너 상단에 오도록 스크롤
            const scrollTop = container.scrollTop + (elementRect.top - containerRect.top) - 20
            container.scrollTo({
              top: scrollTop,
              behavior: 'smooth'
            })
          }
        }
      }, 100) // 약간의 딜레이를 주어 상태 업데이트 후 스크롤
    }
  }

  // 확인 버튼 핸들러
  const handleConfirm = (item) => {
    if (negativeFeedback[item] && negativeFeedback[item].trim()) {
      // 텍스트가 있으면 개선사항에 추가
      const feedbackText = `${item}: ${negativeFeedback[item]}`
      if (improvement) {
        setImprovement(prev => prev + '\n' + feedbackText)
      } else {
        setImprovement(feedbackText)
      }
      // 확인 완료 표시
      setConfirmedItems(prev => ({ ...prev, [item]: true }))
    } else {
      alert('내용을 입력해주세요.')
    }
  }

  // 폼 제출
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 피막감, 유분감, 제형 안정성에서 매우 별로다(1점) 또는 별로다(2점)를 선택했는데 확인을 안한 경우 체크
    const itemsNeedingConfirmation = ['피막감', '유분감', '제형 안정성']
    const unconfirmedItems = itemsNeedingConfirmation.filter(item => {
      const score = scores[item]
      return (score === 1 || score === 2) && !confirmedItems[item]
    })
    
    // 후속화장품 흡수, 점도(육안)는 어떤 선택지를 선택하든 확인을 해야 함
    const itemsAlwaysNeedingConfirmation = ['후속화장품 흡수', '점도(육안)']
    const unconfirmedAlwaysItems = itemsAlwaysNeedingConfirmation.filter(item => {
      const score = scores[item]
      return score !== undefined && !confirmedItems[item]
    })
    
    const allUnconfirmedItems = [...unconfirmedItems, ...unconfirmedAlwaysItems]
    
    if (allUnconfirmedItems.length > 0) {
      alert(`${allUnconfirmedItems.join(', ')} 항목에 대한 피드백을 입력하고 확인 버튼을 눌러주세요.`)
      return
    }
    
    // 모든 항목에 점수가 있는지 확인 (선택사항이므로 경고만)
    const missingItems = testItems.filter(item => scores[item] === undefined)
    if (missingItems.length > 0) {
      const confirm = window.confirm(
        `${missingItems.length}개의 항목에 점수가 입력되지 않았습니다. 계속하시겠습니까?`
      )
      if (!confirm) return
    }

    onNext(scores, improvement)
  }

  return (
    <form className="step2-form" onSubmit={handleSubmit}>
      <h2 className="step-title">테스트 항목 평가</h2>
      <p className="step-description">각 항목에 대해 평가를 선택해주세요.</p>

      <div className="test-items-container">
        {testItems.map((item, index) => {
          // 텍스트창이 필요한 항목들
          const itemsNeedingFeedback = ['피막감', '유분감', '제형 안정성', '후속화장품 흡수', '점도(육안)']
          
          // 이전 항목 중 확인이 필요한 항목이 있는지 확인
          const hasUnconfirmedPreviousItem = testItems.slice(0, index).some(prevItem => {
            if (!itemsNeedingFeedback.includes(prevItem)) return false
            
            const prevScore = scores[prevItem]
            if (prevItem === '후속화장품 흡수' || prevItem === '점도(육안)') {
              // 후속화장품 흡수, 점도(육안)는 어떤 점수든 확인 필요
              return prevScore !== undefined && !confirmedItems[prevItem]
            } else {
              // 피막감, 유분감, 제형 안정성은 1점 또는 2점일 때만 확인 필요
              return (prevScore === 1 || prevScore === 2) && !confirmedItems[prevItem]
            }
          })
          
          // 이 항목이 확인이 필요한 항목인지 확인
          const isItemNeedingConfirmation = itemsNeedingFeedback.includes(item)
          const itemScore = scores[item]
          const needsConfirmation = isItemNeedingConfirmation && (
            (item === '후속화장품 흡수' || item === '점도(육안)') ? 
              itemScore !== undefined && !confirmedItems[item] :
              (itemScore === 1 || itemScore === 2) && !confirmedItems[item]
          )
          
          return (
          <div 
            key={index} 
            className="test-item"
            ref={(el) => { itemRefs.current[item] = el }}
          >
            <div className="test-item-label">{item}</div>
            <div className="score-buttons">
              {(() => {
                // 특정 항목별로 다른 선택지 사용
                let options = []
                if (item === '재도포') {
                  options = [
                    { label: '1회', score: 1 },
                    { label: '2회', score: 2 },
                    { label: '3회', score: 3 },
                    { label: '4회', score: 4 },
                    { label: '5회', score: 5 }
                  ]
                } else if (item === '보습 지속력') {
                  options = [
                    { label: '10초', score: 1 },
                    { label: '30초', score: 2 },
                    { label: '1분', score: 3 },
                    { label: '3분', score: 4 },
                    { label: '5분 이상', score: 5 }
                  ]
                } else if (item === '흡수 속도') {
                  options = [
                    { label: '5분', score: 1 },
                    { label: '3분', score: 2 },
                    { label: '1분', score: 3 },
                    { label: '30초', score: 4 },
                    { label: '10초', score: 5 }
                  ]
                } else if (item === '타깃 제품과 제형 유사성') {
                  // 타깃 제품과 제형 유사성 선택지
                  options = [
                    { label: '매우 다르다', score: 1 },
                    { label: '다르다', score: 2 },
                    { label: '보통이다', score: 3 },
                    { label: '같다', score: 4 },
                    { label: '매우 같다', score: 5 }
                  ]
                } else if (item === '피막감' || item === '유분감') {
                  // 피막감, 유분감 선택지
                  options = [
                    { label: '매우 별로다', score: 1 },
                    { label: '별로다', score: 2 },
                    { label: '보통이다', score: 3 },
                    { label: '좋다', score: 4 },
                    { label: '매우 좋다', score: 5 }
                  ]
                } else if (item === '롤링감(뭉침)' || item === '흡수 후 잔감' || item === '따가움' || item === '가려움' || item === '홍반' || item === '열감' || item === '트러블') {
                  // 부정적 특성 항목들
                  options = [
                    { label: '매우 많다', score: 1 },
                    { label: '많다', score: 2 },
                    { label: '보통이다', score: 3 },
                    { label: '없다', score: 4 },
                    { label: '매우 없다', score: 5 }
                  ]
                } else {
                  // 기본 선택지
                  options = [
                    { label: '매우 별로다', score: 1 },
                    { label: '별로다', score: 2 },
                    { label: '보통이다', score: 3 },
                    { label: '좋다', score: 4 },
                    { label: '매우 좋다', score: 5 }
                  ]
                }
                
                return options.map(({ label, score }) => {
                  // 이전 항목에서 확인이 필요한 항목이 있으면 버튼 비활성화
                  const isDisabled = hasUnconfirmedPreviousItem
                  
                  return (
                    <button
                      key={score}
                      type="button"
                      className={`score-btn ${scores[item] === score ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => {
                        if (!isDisabled) {
                          handleScoreChange(item, score)
                        } else {
                          // 이전 항목의 확인이 필요한 항목 찾기
                          const unconfirmedItem = testItems.slice(0, index).find(prevItem => {
                            if (!itemsNeedingFeedback.includes(prevItem)) return false
                            const prevScore = scores[prevItem]
                            if (prevItem === '후속화장품 흡수' || prevItem === '점도(육안)') {
                              return prevScore !== undefined && !confirmedItems[prevItem]
                            } else {
                              return (prevScore === 1 || prevScore === 2) && !confirmedItems[prevItem]
                            }
                          })
                          if (unconfirmedItem) {
                            alert(`${unconfirmedItem} 항목의 피드백을 입력하고 확인 버튼을 눌러주세요.`)
                          }
                        }
                      }}
                      disabled={isDisabled}
                    >
                      {label}
                    </button>
                  )
                })
              })()}
            </div>
            {/* 피막감, 유분감, 제형 안정성에서 매우 별로다(1점) 또는 별로다(2점)를 선택한 경우 텍스트 박스 표시 */}
            {((item === '피막감' || item === '유분감' || item === '제형 안정성') && (scores[item] === 1 || scores[item] === 2) && !confirmedItems[item]) && (
              <div className="negative-feedback-box">
                <textarea
                  className="negative-feedback-input"
                  placeholder="피드백을 입력해주세요..."
                  value={negativeFeedback[item] || ''}
                  onChange={(e) => setNegativeFeedback(prev => ({ ...prev, [item]: e.target.value }))}
                  rows="3"
                />
                <button
                  type="button"
                  className="confirm-feedback-btn"
                  onClick={() => handleConfirm(item)}
                >
                  확인
                </button>
              </div>
            )}
            {/* 후속화장품 흡수, 점도(육안)는 어떤 선택지를 선택하든 텍스트 박스 표시 */}
            {((item === '후속화장품 흡수' || item === '점도(육안)') && scores[item] !== undefined && !confirmedItems[item]) && (
              <div className="negative-feedback-box">
                <textarea
                  className="negative-feedback-input"
                  placeholder="피드백을 입력해주세요..."
                  value={negativeFeedback[item] || ''}
                  onChange={(e) => setNegativeFeedback(prev => ({ ...prev, [item]: e.target.value }))}
                  rows="3"
                />
                <button
                  type="button"
                  className="confirm-feedback-btn"
                  onClick={() => handleConfirm(item)}
                >
                  확인
                </button>
              </div>
            )}
            {/* 확인 완료 표시 */}
            {((item === '피막감' || item === '유분감' || item === '제형 안정성' || item === '후속화장품 흡수' || item === '점도(육안)') && confirmedItems[item]) && (
              <div className="feedback-confirmed">
                ✓ 확인 완료
              </div>
            )}
          </div>
          )
        })}
      </div>

      {/* 개선사항 입력 */}
      <div className="form-group">
        <label>개선사항(향,색상 추가)</label>
        <textarea
          value={improvement}
          onChange={(e) => setImprovement(e.target.value)}
          placeholder="(향,색상) 입력해주세요!!"
          className="improvement-textarea"
          rows="5"
        />
      </div>

      {/* 버튼 */}
      <div className="form-buttons">
        <button type="button" onClick={onBack} className="btn-back">
          이전
        </button>
        <button type="submit" className="btn-next">
          다음
        </button>
      </div>
    </form>
  )
}

export default Step2Form

