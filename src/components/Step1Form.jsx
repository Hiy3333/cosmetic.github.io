import React, { useState, useEffect } from 'react'
import { getManufacturers, saveManufacturers, getAuthors, saveAuthors, getPreviousSkinTypeByAuthorAndManufacturer, getMaxUsageCountByAuthorAndManufacturer } from '../utils/storage'
import './Step1Form.css'

function Step1Form({ formData, onNext }) {
  const [manufacturer, setManufacturer] = useState(formData.manufacturer || '')
  const [sampleNumber, setSampleNumber] = useState(formData.sampleNumber || '')
  const [author, setAuthor] = useState(formData.author || '')
  const [usageCount, setUsageCount] = useState(formData.usageCount || '')
  const [skinType, setSkinType] = useState(formData.skinType || '')
  
  // 제조사 관련 상태
  const [manufacturers, setManufacturers] = useState([])
  const [showManufacturerList, setShowManufacturerList] = useState(false)
  const [newManufacturer, setNewManufacturer] = useState('')
  const [showAddManufacturer, setShowAddManufacturer] = useState(false)
  
  // 작성자 관련 상태
  const [authors, setAuthors] = useState([])
  const [showAuthorList, setShowAuthorList] = useState(false)
  const [newAuthor, setNewAuthor] = useState('')
  const [showAddAuthor, setShowAddAuthor] = useState(false)
  
  // 피부타입 옵션
  const skinTypes = ['건성', '지성', '복합성']
  const [showSkinTypeList, setShowSkinTypeList] = useState(false)

  // 컴포넌트 마운트 시 저장된 목록 불러오기
  useEffect(() => {
    const loadData = async () => {
      const savedManufacturers = await getManufacturers()
      setManufacturers(savedManufacturers)
      
      const savedAuthors = await getAuthors()
      setAuthors(savedAuthors)
      
      // formData에 작성자와 제조사가 이미 있으면 이전 정보 가져오기
      if (formData.author && formData.manufacturer) {
        await updatePreviousInfo(formData.author, formData.manufacturer)
      }
    }
    
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 제조사 추가 함수
  const handleAddManufacturer = async (e) => {
    e.preventDefault()
    if (newManufacturer.trim() && !manufacturers.includes(newManufacturer.trim())) {
      const updatedManufacturers = [...manufacturers, newManufacturer.trim()]
      setManufacturers(updatedManufacturers)
      await saveManufacturers(updatedManufacturers) // Supabase에 저장
      const selectedManufacturer = newManufacturer.trim()
      setManufacturer(selectedManufacturer)
      
      // 작성자가 선택되어 있으면 함께 고려하여 이전 정보 업데이트
      if (author) {
        await updatePreviousInfo(author, selectedManufacturer)
      } else {
        setSkinType('')
        setPreviousUsageCount(0)
      }
      setNewManufacturer('')
      setShowAddManufacturer(false)
      setShowManufacturerList(false)
    }
  }

  // 제조사 삭제 함수 (확인 팝업 포함)
  const handleDeleteManufacturer = async (mfr, index, e) => {
    e.stopPropagation()
    
    // 삭제 확인 팝업
    if (window.confirm(`"${mfr}" 제조사를 삭제하시겠습니까?`)) {
      const newManufacturers = manufacturers.filter((_, i) => i !== index)
      setManufacturers(newManufacturers)
      await saveManufacturers(newManufacturers) // Supabase에 저장
      
      // 현재 선택된 제조사가 삭제되는 경우 선택 해제
      if (manufacturer === mfr) {
        setManufacturer('')
        setSkinType('')
        setPreviousUsageCount(0)
      } else if (author && manufacturer) {
        // 다른 제조사가 삭제되어도 현재 선택된 작성자와 제조사의 정보는 유지
        await updatePreviousInfo(author, manufacturer)
      }
    }
  }

  // 작성자 추가 함수
  const handleAddAuthor = async (e) => {
    e.preventDefault()
    if (newAuthor.trim() && !authors.includes(newAuthor.trim())) {
      const updatedAuthors = [...authors, newAuthor.trim()]
      setAuthors(updatedAuthors)
      await saveAuthors(updatedAuthors) // Supabase에 저장
      const selectedAuthor = newAuthor.trim()
      setAuthor(selectedAuthor)
      setNewAuthor('')
      setShowAddAuthor(false)
      setShowAuthorList(false)
      
      // 새로 추가된 작성자의 이전 정보 가져오기 (제조사가 선택되어 있으면 함께 고려)
      if (manufacturer) {
        await updatePreviousInfo(selectedAuthor, manufacturer)
      } else {
        setSkinType('')
        setPreviousUsageCount(0)
      }
    }
  }

  // 작성자 삭제 함수 (확인 팝업 포함)
  const handleDeleteAuthor = async (auth, index, e) => {
    e.stopPropagation()
    
    // 삭제 확인 팝업
    if (window.confirm(`"${auth}" 작성자를 삭제하시겠습니까?`)) {
      const newAuthors = authors.filter((_, i) => i !== index)
      setAuthors(newAuthors)
      await saveAuthors(newAuthors) // Supabase에 저장
      
      // 현재 선택된 작성자가 삭제되는 경우 선택 해제
      if (author === auth) {
        setAuthor('')
        setSkinType('')
        setPreviousUsageCount(0)
      } else if (author && manufacturer) {
        // 다른 작성자가 삭제되어도 현재 선택된 작성자와 제조사의 정보는 유지
        await updatePreviousInfo(author, manufacturer)
      }
    }
  }

  // 이전 사용 회차 상태
  const [previousUsageCount, setPreviousUsageCount] = useState(0)
  const [showPreviousUsageHint, setShowPreviousUsageHint] = useState(true)

  // 날짜 변경 확인 (다음날 초기화)
  useEffect(() => {
    const LAST_DATE_KEY = 'sample_test_last_date'
    const today = new Date().toISOString().split('T')[0]
    const lastDate = localStorage.getItem(LAST_DATE_KEY)
    
    // 날짜가 바뀌었으면 이전 사용 회차 힌트 숨기기
    if (lastDate && lastDate !== today) {
      setShowPreviousUsageHint(false)
    } else if (!lastDate) {
      // 첫 방문이면 힌트 표시
      setShowPreviousUsageHint(true)
    }
    
    // 오늘 날짜 저장
    localStorage.setItem(LAST_DATE_KEY, today)
  }, [])

  // 작성자와 제조사 선택 시 이전 피부타입 및 사용 회차 업데이트
  const updatePreviousInfo = async (selectedAuthor, selectedManufacturer) => {
    if (selectedAuthor && selectedManufacturer) {
      // 작성자와 제조사별 이전 피부타입 자동 선택
      const prevSkinType = await getPreviousSkinTypeByAuthorAndManufacturer(selectedAuthor, selectedManufacturer)
      if (prevSkinType) {
        setSkinType(prevSkinType)
      } else {
        setSkinType('')
      }
      
      // 작성자와 제조사별 이전 최대 사용 회차 가져오기
      const maxUsageCount = await getMaxUsageCountByAuthorAndManufacturer(selectedAuthor, selectedManufacturer)
      setPreviousUsageCount(maxUsageCount)
    } else {
      setSkinType('')
      setPreviousUsageCount(0)
    }
  }

  // 작성자 선택 시 이전 피부타입 및 사용 회차 가져오기
  const handleAuthorSelect = async (selectedAuthor) => {
    setAuthor(selectedAuthor)
    setShowAuthorList(false)
    
    // 제조사가 선택되어 있으면 함께 고려
    if (manufacturer) {
      await updatePreviousInfo(selectedAuthor, manufacturer)
    } else {
      setSkinType('')
      setPreviousUsageCount(0)
    }
  }

  // 제조사 선택 시 이전 피부타입 및 사용 회차 업데이트
  useEffect(() => {
    const updateInfo = async () => {
      if (author && manufacturer) {
        await updatePreviousInfo(author, manufacturer)
      } else if (manufacturer && !author) {
        // 제조사만 선택된 경우 초기화
        setSkinType('')
        setPreviousUsageCount(0)
      }
    }
    updateInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturer])

  // 폼 제출 검증 및 다음 단계로 이동
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 모든 필드 검증
    if (!manufacturer) {
      alert('제조사명을 선택해주세요.')
      return
    }
    if (!sampleNumber) {
      alert('샘플 넘버를 입력해주세요.')
      return
    }
    if (!author) {
      alert('작성자를 입력해주세요.')
      return
    }
    if (!usageCount) {
      alert('사용 회차를 입력해주세요.')
      return
    }
    if (!skinType) {
      alert('피부타입을 선택해주세요.')
      return
    }

    // 하루에 여러 번 테스트 가능하도록 변경 (제한 제거)

    onNext({
      manufacturer,
      sampleNumber,
      author,
      usageCount,
      skinType
    })
  }

  return (
    <form className="step1-form" onSubmit={handleSubmit}>
      {/* 제조사명 선택 */}
      <div className="form-group">
        <label>OEM 제조사명 *</label>
        <div className="dropdown-container">
          <div
            className="dropdown-input"
            onClick={() => {
              setShowManufacturerList(!showManufacturerList)
              setShowAddManufacturer(false)
            }}
          >
            <span className="dropdown-text">{manufacturer || '제조사명을 선택하세요'}</span>
            <div className="dropdown-actions">
              {manufacturer && (
                <span
                  className="clear-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setManufacturer('')
                    setSkinType('')
                    setPreviousUsageCount(0)
                  }}
                  title="선택 해제"
                >
                  ✕
                </span>
              )}
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
          {showManufacturerList && (
            <div className="dropdown-list">
              {manufacturers.map((mfr, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                >
                  <span
                    onClick={() => {
                      setManufacturer(mfr)
                      setShowManufacturerList(false)
                    }}
                    className="dropdown-item-text"
                  >
                    {mfr}
                  </span>
                  <span
                    className="delete-btn"
                    onClick={(e) => handleDeleteManufacturer(mfr, index, e)}
                    title="삭제"
                  >
                    ✕
                  </span>
                </div>
              ))}
              <div
                className="dropdown-item add-item"
                onClick={() => {
                  setShowAddManufacturer(true)
                  setShowManufacturerList(false)
                }}
              >
                + 제조사 추가
              </div>
            </div>
          )}
        </div>
        {showAddManufacturer && (
          <div className="add-manufacturer-form">
            <input
              type="text"
              value={newManufacturer}
              onChange={(e) => setNewManufacturer(e.target.value)}
              placeholder="새 제조사명 입력"
              className="add-input"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddManufacturer(e)
                }
              }}
            />
            <div className="add-buttons">
              <button
                type="button"
                onClick={handleAddManufacturer}
                className="btn-add"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddManufacturer(false)
                  setNewManufacturer('')
                }}
                className="btn-cancel"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 샘플 넘버 */}
      <div className="form-group">
        <label>샘플 넘버 *</label>
        <div className="input-wrapper">
          <span className="input-prefix">샘플</span>
          <input
            type="text"
            value={sampleNumber}
            onChange={(e) => setSampleNumber(e.target.value)}
            placeholder="번호를 입력하세요"
            className="form-input"
            required
          />
        </div>
      </div>

      {/* 작성자 */}
      <div className="form-group">
        <label>작성자 *</label>
        <div className="dropdown-container">
          <div
            className="dropdown-input"
            onClick={() => {
              setShowAuthorList(!showAuthorList)
              setShowAddAuthor(false)
            }}
          >
            <span className="dropdown-text">{author || '작성자를 선택하세요'}</span>
            <div className="dropdown-actions">
              {author && (
                <span
                  className="clear-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAuthor('')
                    setSkinType('')
                    setPreviousUsageCount(0)
                  }}
                  title="선택 해제"
                >
                  ✕
                </span>
              )}
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
          {showAuthorList && (
            <div className="dropdown-list">
              {authors.map((auth, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                >
                  <span
                    onClick={() => handleAuthorSelect(auth)}
                    className="dropdown-item-text"
                  >
                    {auth}
                  </span>
                  <span
                    className="delete-btn"
                    onClick={(e) => handleDeleteAuthor(auth, index, e)}
                    title="삭제"
                  >
                    ✕
                  </span>
                </div>
              ))}
              <div
                className="dropdown-item add-item"
                onClick={() => {
                  setShowAddAuthor(true)
                  setShowAuthorList(false)
                }}
              >
                + 작성자 추가
              </div>
            </div>
          )}
        </div>
        {showAddAuthor && (
          <div className="add-manufacturer-form">
            <input
              type="text"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              placeholder="새 작성자 이름 입력"
              className="add-input"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddAuthor(e)
                }
              }}
            />
            <div className="add-buttons">
              <button
                type="button"
                onClick={handleAddAuthor}
                className="btn-add"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddAuthor(false)
                  setNewAuthor('')
                }}
                className="btn-cancel"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 사용 회차 */}
      <div className="form-group">
        <label>사용 회차 *</label>
        <div className="input-wrapper">
          <input
            type="text"
            value={usageCount}
            onChange={(e) => setUsageCount(e.target.value)}
            placeholder=""
            className="form-input"
            required
          />
          <span className="input-suffix">차</span>
          {author && previousUsageCount > 0 && showPreviousUsageHint && (
            <span className="previous-usage-hint">(이전 사용 회차 {previousUsageCount}차)</span>
          )}
        </div>
      </div>

      {/* 피부타입 */}
      <div className="form-group">
        <label>피부타입 *</label>
        <div className="dropdown-container">
          <div
            className="dropdown-input"
            onClick={() => setShowSkinTypeList(!showSkinTypeList)}
          >
            {skinType || '피부타입을 선택하세요'}
            <span className="dropdown-arrow">▼</span>
          </div>
          {showSkinTypeList && (
            <div className="dropdown-list">
              {skinTypes.map((type, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                  onClick={() => {
                    setSkinType(type)
                    setShowSkinTypeList(false)
                  }}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 다음 버튼 */}
      <button type="submit" className="btn-next">
        다음
      </button>
    </form>
  )
}

export default Step1Form

