import React, { useState } from 'react'
import Step1Form from './components/Step1Form'
import Step2Form from './components/Step2Form'
import Step3Result from './components/Step3Result'
import Statistics from './components/Statistics'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('test') // 'home' or 'test'
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1 데이터
    manufacturer: '',
    sampleNumber: '',
    author: '',
    usageCount: '',
    skinType: '',
    // Step 2 데이터
    scores: {},
    improvement: ''
  })

  // Step 1에서 다음 단계로 이동
  const handleStep1Next = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(2)
  }

  // Step 2에서 다음 단계로 이동
  const handleStep2Next = (scores, improvement) => {
    setFormData(prev => ({
      ...prev,
      scores,
      improvement
    }))
    setStep(3)
  }

  // 처음으로 돌아가기
  const handleReset = () => {
    setStep(1)
    setFormData({
      manufacturer: '',
      sampleNumber: '',
      author: '',
      usageCount: '',
      skinType: '',
      scores: {},
      improvement: ''
    })
    // 테스트 페이지 유지
  }

  return (
    <div className="app">
      {/* 네비게이션 바 */}
      <nav className="app-nav">
        <div className="nav-container">
          <h1 className="nav-title">샘플 테스트</h1>
          <div className="nav-buttons">
            <button
              className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              통계
            </button>
            <button
              className={`nav-btn ${currentPage === 'test' ? 'active' : ''}`}
              onClick={() => {
                setCurrentPage('test')
                setStep(1)
              }}
            >
              테스트
            </button>
          </div>
        </div>
      </nav>

      <div className="app-container">
        {currentPage === 'home' ? (
          <Statistics />
        ) : (
          <div className="test-page-container">
            <div className="test-page-content">
              <div className="step-indicator">
                <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
                <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
                <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
              </div>

              {step === 1 && (
                <Step1Form
                  formData={formData}
                  onNext={handleStep1Next}
                />
              )}
              {step === 2 && (
                <Step2Form
                  onNext={handleStep2Next}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <Step3Result
                  formData={formData}
                  onReset={handleReset}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

