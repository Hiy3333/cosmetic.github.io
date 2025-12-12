# 🚀 GitHub 배포 초보자 가이드 (매우 자세한 설명)

## 📋 목차
1. [GitHub 저장소 만들기](#1-github-저장소-만들기)
2. [로컬에서 Git 설정하기](#2-로컬에서-git-설정하기)
3. [코드 올리기](#3-코드-올리기)
4. [GitHub Secrets 설정하기](#4-github-secrets-설정하기)
5. [GitHub Pages 활성화하기](#5-github-pages-활성화하기)
6. [배포 확인하기](#6-배포-확인하기)
7. [이후 업데이트하기](#7-이후-업데이트하기)

---

## 1. GitHub 저장소 만들기

### 1-1. GitHub 접속
1. 웹 브라우저를 엽니다 (Chrome, Edge 등)
2. 주소창에 `https://github.com` 입력하고 Enter
3. 로그인합니다 (계정이 없으면 회원가입)

### 1-2. 새 저장소 생성
1. **우측 상단의 "+" 버튼** 클릭
   - 화면 오른쪽 위에 있는 큰 "+" 아이콘
2. **"New repository"** 클릭
   - 드롭다운 메뉴에서 선택

### 1-3. 저장소 정보 입력
1. **Repository name** 입력란에 이름 입력
   - 예: `sample-test-app`
   - 영어, 숫자, 하이픈(-)만 사용 가능
   - 공백 불가

2. **Description** (선택사항)
   - 설명 입력 (비워도 됨)

3. **Public / Private** 선택
   - **Public**: 누구나 볼 수 있음 (무료)
   - **Private**: 나만 볼 수 있음 (무료)
   - 둘 다 무료이므로 원하는 것 선택

4. **아래 체크박스들은 모두 해제**
   - ☐ Add a README file (체크 해제)
   - ☐ Add .gitignore (체크 해제)
   - ☐ Choose a license (체크 해제)
   - **중요**: 모두 체크 해제해야 합니다!

5. **"Create repository"** 버튼 클릭

### 1-4. 저장소 URL 복사
1. 저장소가 생성되면 페이지가 바뀜
2. 초록색 **"Code"** 버튼 클릭
3. HTTPS 탭에서 URL 복사
   - 예: `https://github.com/Hiy3333/sample-test-app.git`
   - 이 URL을 메모장에 복사해두세요!

---

## 2. 로컬에서 Git 설정하기

### 2-1. PowerShell 열기
1. **Windows 키 + X** 누르기
2. **"Windows PowerShell"** 또는 **"터미널"** 선택
3. 또는 시작 메뉴에서 "PowerShell" 검색

### 2-2. 명령어 실행 (하나씩 복사해서 붙여넣기)

**⚠️ 중요: 아래 명령어를 하나씩 복사해서 붙여넣고 Enter를 누르세요!**

**1단계: 프로젝트 폴더로 이동**
```powershell
cd C:\Users\Hi\Desktop\sample_test
```
→ 복사해서 붙여넣고 Enter

**2단계: Git 초기화**
```powershell
git init
```
→ 복사해서 붙여넣고 Enter

**3단계: 브랜치 이름 설정**
```powershell
git branch -M main
```
→ 복사해서 붙여넣고 Enter

**4단계: 원격 저장소 연결**
```powershell
git remote add origin https://github.com/Hiy3333/저장소이름.git
```
→ `저장소이름`을 실제 저장소 이름으로 변경 후 복사해서 붙여넣고 Enter

**⚠️ "remote origin already exists" 오류가 나면:**
```powershell
git remote remove origin
```
→ 먼저 실행하고, 그 다음 4단계 다시 실행

**5단계: 모든 파일 추가**
```powershell
git add .
```
→ **점(.) 포함해서** 복사해서 붙여넣고 Enter

**6단계: 커밋 (저장)**
```powershell
git commit -m "Initial commit"
```
→ 복사해서 붙여넣고 Enter

**7단계: GitHub에 푸시 (업로드)**
```powershell
git push -u origin main
```
→ 복사해서 붙여넣고 Enter

**처음 푸시 시:**
- GitHub 로그인 창이 뜰 수 있습니다
- 사용자명과 비밀번호 입력
- 또는 Personal Access Token 사용

---

## 4. GitHub Secrets 설정하기 (매우 중요!)

### 4-1. Secrets 페이지로 이동
1. GitHub 저장소 페이지에서
2. **"Settings"** 클릭 (저장소 이름 옆에 있음)
3. 왼쪽 메뉴에서 **"Secrets and variables"** 클릭
4. **"Actions"** 클릭

### 4-2. 첫 번째 Secret 추가
1. **"New repository secret"** 버튼 클릭
2. **Name** 입력란에: `VITE_SUPABASE_URL`
3. **Secret** 입력란에: `https://zrwnvpfijkdvbdjcjkcn.supabase.co`
4. **"Add secret"** 버튼 클릭

### 4-3. 두 번째 Secret 추가
1. 다시 **"New repository secret"** 버튼 클릭
2. **Name** 입력란에: `VITE_SUPABASE_ANON_KEY`
3. **Secret** 입력란에: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyd252cGZpamtkdmJkamNqa2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjUwNzAsImV4cCI6MjA4MTEwMTA3MH0.SE0GzLeLrTnnuocMcR9_bQ8CPnZ-CwrJtj2VJ0XrS5s`
4. **"Add secret"** 버튼 클릭

**완료되면:**
- Secrets 목록에 2개가 보여야 합니다:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

---

## 5. GitHub Pages 활성화하기

### 5-1. Pages 설정 페이지로 이동
1. 저장소 페이지에서 **"Settings"** 클릭
2. 왼쪽 메뉴에서 **"Pages"** 클릭

### 5-2. Source 선택
1. **"Source"** 드롭다운 클릭
2. **"GitHub Actions"** 선택
3. **"Save"** 버튼 클릭

**설명:**
- GitHub Actions가 자동으로 빌드하고 배포합니다
- 코드를 수정하면 자동으로 재배포됩니다

---

## 6. 배포 확인하기

### 6-1. Actions 탭에서 확인
1. 저장소 페이지 상단의 **"Actions"** 탭 클릭
2. **"Deploy to GitHub Pages"** 워크플로우가 보입니다
3. 노란색 점이면 진행 중, 초록색 체크면 완료

**처음 배포는 약 2-3분 걸립니다**

### 6-2. 배포된 URL 확인
1. **"Settings"** > **"Pages"** 이동
2. **"Your site is live at"** 아래에 URL이 보입니다
   - 예: `https://hiy3333.github.io/sample-test-app/`
3. 이 URL을 클릭하거나 복사해서 브라우저에 붙여넣기

### 6-3. 사이트 테스트
1. 배포된 URL 접속
2. F12 키를 눌러 개발자 도구 열기
3. **"Console"** 탭 클릭
4. **"✅ Supabase 연결 성공!"** 메시지 확인
5. 테스트 데이터 입력해보기

---

## 7. 이후 업데이트하기

코드를 수정한 후 다시 올리는 방법:

### 7-1. 명령어 실행 (하나씩 복사해서 붙여넣기)

**1단계: 프로젝트 폴더로 이동**
```powershell
cd C:\Users\Hi\Desktop\sample_test
```
→ 복사해서 붙여넣고 Enter

**2단계: 모든 파일 추가**
```powershell
git add .
```
→ **점(.) 포함해서** 복사해서 붙여넣고 Enter

**3단계: 커밋 (저장)**
```powershell
git commit -m "업데이트 내용"
```
→ `"업데이트 내용"`을 원하는 메시지로 변경 후 복사해서 붙여넣고 Enter
- 예: `"버그 수정"`, `"새 기능 추가"`, `"디자인 개선"`

**4단계: GitHub에 푸시**
```powershell
git push
```
→ 복사해서 붙여넣고 Enter

### 7-2. 자동 배포
- `git push` 후 자동으로 GitHub Actions가 실행됩니다
- 약 2-3분 후 배포 완료
- Actions 탭에서 진행 상황 확인 가능

---

## ❓ 문제 해결

### "fatal: not a git repository" 오류
**해결 (복사해서 붙여넣기):**
```powershell
cd C:\Users\Hi\Desktop\sample_test
git init
```

### "remote origin already exists" 오류
**해결 (하나씩 복사해서 붙여넣기):**

**1단계: 기존 원격 저장소 제거**
```powershell
git remote remove origin
```
→ 복사해서 붙여넣고 Enter

**2단계: 원격 저장소 다시 추가**
```powershell
git remote add origin https://github.com/Hiy3333/저장소이름.git
```
→ `저장소이름`을 실제 저장소 이름으로 변경 후 복사해서 붙여넣고 Enter

### "Permission denied" 오류
**해결:**
- GitHub 로그인이 필요합니다
- Personal Access Token 사용 권장

### 배포가 실패하는 경우
1. Actions 탭에서 에러 메시지 확인
2. Secrets가 올바르게 설정되었는지 확인
3. `.github/workflows/deploy.yml` 파일이 있는지 확인

---

## ✅ 체크리스트

배포 전 확인사항:
- [ ] GitHub 저장소 생성 완료
- [ ] Git 초기화 완료 (`git init`)
- [ ] 원격 저장소 연결 완료 (`git remote add origin`)
- [ ] 코드 푸시 완료 (`git push`)
- [ ] GitHub Secrets 2개 설정 완료
- [ ] GitHub Pages 활성화 완료 (Source: GitHub Actions)
- [ ] Actions에서 배포 성공 확인
- [ ] 배포된 URL에서 사이트 작동 확인

---

## 💡 팁

1. **커밋 메시지는 자유롭게**
   - 예: "버그 수정", "새 기능 추가", "디자인 개선"

2. **자주 커밋하기**
   - 작은 변경사항이라도 자주 커밋하는 것이 좋습니다

3. **배포는 자동**
   - `git push`만 하면 자동으로 배포됩니다

4. **Secrets는 한 번만 설정**
   - 처음 한 번만 설정하면 계속 사용됩니다

---

## 🎉 완료!

이제 사이트가 인터넷에 공개되었습니다!
다른 사람도 URL을 알면 접속할 수 있습니다.

