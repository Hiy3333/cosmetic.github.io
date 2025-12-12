# 🚀 GitHub 배포 빠른 가이드

## ⚠️ 중요: 프로젝트 폴더에서 실행하세요!

현재 위치: `C:\Users\Hi\Desktop\sample_test`

## 📋 배포 방법

### 방법 1: PowerShell 스크립트 (가장 쉬움)

1. **프로젝트 폴더로 이동:**
   ```powershell
   cd C:\Users\Hi\Desktop\sample_test
   ```

2. **스크립트 실행:**
   ```powershell
   .\deploy.ps1
   ```

### 방법 2: npm 스크립트

1. **프로젝트 폴더로 이동:**
   ```powershell
   cd C:\Users\Hi\Desktop\sample_test
   ```

2. **실행:**
   ```bash
   npm run git:push
   ```

### 방법 3: 배치 파일

1. **프로젝트 폴더로 이동:**
   ```cmd
   cd C:\Users\Hi\Desktop\sample_test
   ```

2. **실행:**
   ```cmd
   deploy.bat
   ```

## 🔧 첫 번째 푸시 전 설정

### 1. GitHub 저장소 생성
- https://github.com 접속
- "+" > "New repository"
- 저장소 이름 입력 후 "Create repository"

### 2. 스크립트 실행 시 저장소 URL 입력
스크립트가 자동으로 물어봅니다:
```
GitHub 저장소 URL을 입력하세요: https://github.com/your-username/repo-name.git
```

## 📝 이후 업데이트

코드 수정 후:
```powershell
cd C:\Users\Hi\Desktop\sample_test
.\deploy.ps1
```

## ⚙️ GitHub 설정 (첫 푸시 후)

1. **Secrets 설정:**
   - Settings > Secrets and variables > Actions
   - `VITE_SUPABASE_URL` 추가
   - `VITE_SUPABASE_ANON_KEY` 추가

2. **Pages 활성화:**
   - Settings > Pages
   - Source: "GitHub Actions" 선택

## 💡 팁

- 항상 프로젝트 폴더(`sample_test`)에서 실행하세요
- 스크립트는 자동으로 커밋 메시지를 물어봅니다
- Enter만 누르면 자동 메시지가 사용됩니다

