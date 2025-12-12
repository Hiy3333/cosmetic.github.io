import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { testConnection } from './utils/supabase'

// Supabase 연결 테스트
testConnection().then(success => {
  if (success) {
    console.log('✅ Supabase 연결 성공!')
  } else {
    console.error('❌ Supabase 연결 실패! .env 파일을 확인하세요.')
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)




