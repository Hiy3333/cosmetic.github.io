// localStorage 접근 에러를 최우선으로 억제 (모든 스크립트 로드 전에 실행)
(function() {
  'use strict'
  
  // 동기 에러 처리
  const originalError = window.onerror
  window.onerror = function(message, source, lineno, colno, error) {
    if (message && typeof message === 'string' && (
      message.includes('storage is not allowed') ||
      message.includes('Access to storage') ||
      message.includes('localStorage') ||
      message.includes('Storage')
    )) {
      // 에러를 완전히 무시하고 콘솔에도 표시 안 함
      return true
    }
    // 다른 에러는 원래 핸들러로 전달
    if (originalError) {
      return originalError.call(this, message, source, lineno, colno, error)
    }
    return false
  }

  // 비동기 에러 처리 (Promise rejection) - capture phase에서 처리
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason
    if (reason && (
      (reason.message && (
        reason.message.includes('storage is not allowed') ||
        reason.message.includes('Access to storage') ||
        reason.message.includes('localStorage') ||
        reason.message.includes('Storage')
      )) ||
      (typeof reason === 'string' && (
        reason.includes('storage is not allowed') ||
        reason.includes('Access to storage')
      ))
    )) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      // 에러를 완전히 무시
      return false
    }
  }, true)
})()

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

try {
  const root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  console.error('앱 렌더링 실패:', error)
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; color: red;">
      <h1>앱 로딩 오류</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `
}
