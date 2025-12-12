# GitHub 빠른 시작 가이드

## 방법 1: 자동 스크립트 사용 (권장)

### Windows PowerShell 사용:
```powershell
.\deploy.ps1
```

### Windows CMD 사용:
```cmd
deploy.bat
```

스크립트가 자동으로:
1. 변경사항 확인
2. 커밋 메시지 입력 요청
3. GitHub에 푸시
4. GitHub Actions 자동 배포 시작

## 방법 2: 수동 명령어

### 1단계: Git 초기화 (처음 한 번만)
```bash
git init
git branch -M main
```

### 2단계: GitHub 저장소 생성
1. https://github.com 접속
2. 우측 상단 "+" > "New repository"
3. 저장소 이름 입력 (예: `sample-test-app`)
4. "Create repository" 클릭

### 3단계: 원격 저장소 연결 (처음 한 번만)
```bash
git remote add origin https://github.com/your-username/repo-name.git
```
**주의:** `your-username`과 `repo-name`을 실제 값으로 변경하세요!

### 4단계: 파일 추가 및 커밋
```bash
git add .
git commit -m "Initial commit: Supabase 실시간 동기화 추가"
```

### 5단계: GitHub에 푸시
```bash
git push -u origin main
```

### 6단계: GitHub Secrets 설정 (중요!)
1. GitHub 저장소 > Settings
2. "Secrets and variables" > "Actions"
3. "New repository secret" 클릭
4. 다음 2개 추가:
   - Name: `VITE_SUPABASE_URL`
     Value: `https://zrwnvpfijkdvbdjcjkcn.supabase.co`
   - Name: `VITE_SUPABASE_ANON_KEY`
     Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyd252cGZpamtkdmJkamNqa2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjUwNzAsImV4cCI6MjA4MTEwMTA3MH0.SE0GzLeLrTnnuocMcR9_bQ8CPnZ-CwrJtj2VJ0XrS5s`

### 7단계: GitHub Pages 활성화
1. GitHub 저장소 > Settings
2. "Pages" 메뉴
3. Source: "GitHub Actions" 선택
4. Save

## 이후 업데이트할 때

### 자동 스크립트 사용:
```powershell
.\deploy.ps1
```

### 또는 수동으로:
```bash
git add .
git commit -m "업데이트 내용"
git push
```

## 배포 확인

1. GitHub 저장소 > "Actions" 탭에서 배포 진행 상황 확인
2. 약 2-3분 후 완료
3. Settings > Pages에서 배포된 URL 확인
4. URL 접속하여 테스트

## 문제 해결

### "원격 저장소가 설정되지 않았습니다" 오류
- 위의 3단계를 다시 실행하세요

### "권한이 없습니다" 오류
- GitHub 인증이 필요합니다
- GitHub Desktop 사용 또는 Personal Access Token 설정

### 배포가 실패하는 경우
- Actions 탭에서 에러 메시지 확인
- GitHub Secrets가 올바르게 설정되었는지 확인

