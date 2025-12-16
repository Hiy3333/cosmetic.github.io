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
