// localStorage 접근 에러만 억제 (다른 에러는 표시)
// 브라우저 환경에서만 실행
if (typeof window !== 'undefined') {
  (function() {
    'use strict'
    
    // 동기 에러 처리 - storage 관련만 필터링
    const originalError = window.onerror
    window.onerror = function(message, source, lineno, colno, error) {
    if (message && typeof message === 'string') {
      const msg = message.toLowerCase()
      // storage 관련 에러만 정확히 필터링
      if (
        msg.includes('storage is not allowed') ||
        msg.includes('access to storage') ||
        (msg.includes('localstorage') && msg.includes('not allowed')) ||
        (msg.includes('from this context') && msg.includes('storage'))
      ) {
        // storage 관련 에러만 무시
        return true
      }
    }
    // 다른 에러는 원래 핸들러로 전달 (표시됨)
    if (originalError) {
      return originalError.call(this, message, source, lineno, colno, error)
    }
    return false
  }

  // 비동기 에러 처리 (Promise rejection) - storage 관련만 필터링
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason
    if (reason) {
      const errorMessage = (reason.message || reason.toString() || '').toLowerCase()
      // storage 관련 에러만 정확히 필터링
      if (
        errorMessage.includes('storage is not allowed') ||
        errorMessage.includes('access to storage') ||
        (errorMessage.includes('localstorage') && errorMessage.includes('not allowed')) ||
        (errorMessage.includes('from this context') && errorMessage.includes('storage'))
      ) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        // storage 관련 에러만 무시
        return false
      }
    }
    // 다른 에러는 표시됨
  }, true)
  })()
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 브라우저 환경에서만 React 렌더링
if (typeof window !== 'undefined') {
  console.log('🚀 React 앱 시작 중...')

  // root 요소 확인
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    console.error('❌ root 요소를 찾을 수 없습니다!')
    document.body.innerHTML = '<div style="padding: 20px; color: red;"><h1>오류: root 요소를 찾을 수 없습니다</h1></div>'
  } else {
    console.log('✅ root 요소 찾음:', rootElement)
    
    try {
      console.log('📦 React 컴포넌트 렌더링 시작...')
      const root = ReactDOM.createRoot(rootElement)
      
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      )
      
      console.log('✅ React 앱 렌더링 완료!')
    } catch (error) {
      console.error('❌ 앱 렌더링 실패:', error)
      console.error('에러 상세:', error.stack)
      rootElement.innerHTML = `
        <div style="padding: 20px; color: red; background: white;">
          <h1>앱 로딩 오류</h1>
          <p><strong>${error.message}</strong></p>
          <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error.stack}</pre>
        </div>
      `
    }
  }
}
