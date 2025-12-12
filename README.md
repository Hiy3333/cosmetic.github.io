# 샘플 테스트 애플리케이션

React와 Vite를 사용한 샘플 테스트 관리 애플리케이션입니다. Supabase를 사용하여 실시간 데이터 동기화를 지원합니다.

## 기능

- 테스트 데이터 입력 및 관리
- 실시간 데이터 동기화 (Supabase)
- 통계 및 차트 시각화
- 엑셀 다운로드
- 제조사별, 작성자별 데이터 분석
- 여러 사용자 간 데이터 공유

## 시작하기

### 1. Supabase 설정

먼저 Supabase 프로젝트를 생성하고 데이터베이스를 설정해야 합니다.

**자세한 설정 방법은 [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) 파일을 참고하세요.**

요약:
1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 데이터베이스 테이블 생성 (SQL 쿼리는 `SUPABASE_SETUP.md` 참고)
3. API 키 확인 (Settings > API)

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ 중요: `.env` 파일은 절대 GitHub에 올리지 마세요!**

### 3. 개발 환경 실행

```bash
npm install
npm run dev
```

### 4. 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

## GitHub Pages 배포

### 방법 1: GitHub Actions 자동 배포 (권장)

1. GitHub 저장소 생성
2. 코드 푸시
3. GitHub Actions가 자동으로 빌드 및 배포

### 방법 2: 수동 배포

1. 빌드 실행: `npm run build`
2. `dist` 폴더의 모든 파일을 GitHub 저장소의 `gh-pages` 브랜치에 푸시
3. GitHub 저장소 Settings > Pages에서 `gh-pages` 브랜치 선택

## 기술 스택

- React 18
- Vite
- Supabase (실시간 데이터베이스)
- XLSX (엑셀 다운로드)

## 실시간 동기화

이 애플리케이션은 Supabase를 사용하여 실시간 데이터 동기화를 지원합니다:

- 여러 사용자가 동시에 사용 가능
- 한 사용자가 데이터를 추가/수정/삭제하면 다른 사용자에게 자동으로 반영
- 작성자 및 제조사 목록도 실시간으로 공유됨
- 모든 데이터는 Supabase 클라우드에 저장되어 어느 기기에서든 접근 가능

## 문제 해결

### Supabase 연결 실패
- `.env` 파일이 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 데이터가 보이지 않을 때
- Supabase 대시보드 > Table Editor에서 데이터 확인
- RLS (Row Level Security) 정책이 올바르게 설정되었는지 확인

자세한 내용은 [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)를 참고하세요.
