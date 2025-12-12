# GitHub 배포 가이드

## 1단계: 로컬 테스트 (선택사항)

먼저 로컬에서 제대로 작동하는지 확인하세요:

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 후:
- F12 > Console에서 "✅ Supabase 연결 성공!" 메시지 확인
- 테스트 데이터 입력해보기
- Supabase 대시보드에서 데이터 확인

## 2단계: GitHub 저장소 생성

1. GitHub.com 접속
2. 우측 상단 "+" 버튼 > "New repository" 클릭
3. 저장소 이름 입력 (예: `sample-test-app`)
4. Public 또는 Private 선택
5. "Create repository" 클릭

## 3단계: 코드 푸시

프로젝트 폴더에서 다음 명령어 실행:

```bash
# Git 초기화 (아직 안 했다면)
git init

# 모든 파일 추가 (.env는 자동으로 제외됨)
git add .

# 커밋
git commit -m "Initial commit: Supabase 실시간 동기화 추가"

# GitHub 저장소 연결 (your-username과 repository-name을 실제 값으로 변경)
git remote add origin https://github.com/your-username/repository-name.git

# main 브랜치로 푸시
git branch -M main
git push -u origin main
```

## 4단계: GitHub Secrets 설정 (중요!)

GitHub Pages 배포 시 환경 변수를 사용하기 위해 Secrets를 설정해야 합니다.

1. **GitHub 저장소 페이지에서**
   - Settings (설정) 클릭
   - 왼쪽 메뉴에서 "Secrets and variables" > "Actions" 클릭
   - "New repository secret" 클릭

2. **다음 2개의 Secret 추가:**

   **Secret 1:**
   - Name: `VITE_SUPABASE_URL`
   - Secret: `https://zrwnvpfijkdvbdjcjkcn.supabase.co`
   - "Add secret" 클릭

   **Secret 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Secret: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyd252cGZpamtkdmJkamNqa2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjUwNzAsImV4cCI6MjA4MTEwMTA3MH0.SE0GzLeLrTnnuocMcR9_bQ8CPnZ-CwrJtj2VJ0XrS5s`
   - "Add secret" 클릭

## 5단계: GitHub Pages 활성화

1. **GitHub 저장소 페이지에서**
   - Settings (설정) 클릭
   - 왼쪽 메뉴에서 "Pages" 클릭
   - Source: "GitHub Actions" 선택
   - Save

## 6단계: 자동 배포 확인

1. **Actions 탭 확인**
   - GitHub 저장소 페이지에서 "Actions" 탭 클릭
   - "Deploy to GitHub Pages" 워크플로우가 실행되는지 확인
   - 약 2-3분 후 완료됨

2. **배포 완료 후**
   - Settings > Pages에서 배포된 URL 확인
   - URL 형식: `https://your-username.github.io/repository-name/`

## 7단계: 배포 확인

1. 배포된 URL 접속
2. F12 > Console에서 "✅ Supabase 연결 성공!" 메시지 확인
3. 테스트 데이터 입력
4. Supabase 대시보드에서 데이터 확인

## 문제 해결

### 배포가 실패하는 경우
- Actions 탭에서 에러 메시지 확인
- GitHub Secrets가 올바르게 설정되었는지 확인
- `.github/workflows/deploy.yml` 파일이 있는지 확인

### 연결이 안 되는 경우
- 브라우저 콘솔에서 에러 확인
- GitHub Secrets의 값이 정확한지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

## 중요 사항

- ✅ `.env` 파일은 `.gitignore`에 포함되어 있어 GitHub에 올라가지 않습니다
- ✅ GitHub Secrets에 환경 변수를 설정했으므로 배포 시에도 작동합니다
- ✅ 코드를 수정하고 푸시하면 자동으로 재배포됩니다

