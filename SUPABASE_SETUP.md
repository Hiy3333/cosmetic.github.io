# Supabase 설정 가이드

## 1단계: Supabase 프로젝트 생성

1. **Supabase 가입 및 로그인**
   - https://supabase.com 접속
   - "Start your project" 클릭
   - GitHub 계정으로 로그인 (또는 이메일로 가입)

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - 프로젝트 이름 입력 (예: `sample-test-app`)
   - 데이터베이스 비밀번호 설정 (안전하게 저장해두세요!)
   - 지역 선택 (가장 가까운 지역 선택, 예: `Northeast Asia (Seoul)`)
   - "Create new project" 클릭
   - 프로젝트 생성 완료까지 2-3분 대기

## 2단계: API 키 확인

1. **프로젝트 대시보드에서**
   - 왼쪽 메뉴에서 "Settings" (⚙️) 클릭
   - "API" 메뉴 클릭
   - 다음 정보를 복사해두세요:
     - **Project URL** (예: `https://xxxxx.supabase.co`)
     - **anon public** 키 (JWT Secret 아래에 있음)

## 3단계: 데이터베이스 테이블 생성

1. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "New query" 클릭

2. **SQL 쿼리 실행**

   **⚠️ 중요: 마크다운 코드 블록(```sql, ```)은 복사하지 마세요! 순수 SQL만 복사하세요!**

   **방법 1: 파일에서 복사 (권장)**
   - 프로젝트 폴더의 `supabase_setup.sql` 파일을 열기
   - 파일 전체 내용을 복사 (Ctrl+A, Ctrl+C)
   - Supabase SQL Editor에 붙여넣기 (Ctrl+V)
   - "Run" 버튼 클릭

   **방법 2: 아래에서 직접 복사**
   - 아래 SQL 코드 블록에서 **```sql과 ```는 제외하고** 순수 SQL만 복사
   - 또는 아래 "순수 SQL만 보기" 섹션에서 복사

   ```sql
   -- 테스트 데이터 테이블 생성
   CREATE TABLE IF NOT EXISTS tests (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     date DATE NOT NULL,
     manufacturer TEXT NOT NULL,
     sample_number TEXT NOT NULL,
     author TEXT NOT NULL,
     usage_count TEXT NOT NULL,
     skin_type TEXT NOT NULL,
     scores JSONB NOT NULL DEFAULT '{}',
     improvement TEXT DEFAULT '',
     total_score NUMERIC DEFAULT 0,
     average_score NUMERIC DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 제조사 목록 테이블 생성
   CREATE TABLE IF NOT EXISTS manufacturers (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL UNIQUE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 작성자 목록 테이블 생성
   CREATE TABLE IF NOT EXISTS authors (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL UNIQUE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 인덱스 생성 (검색 성능 향상)
   CREATE INDEX IF NOT EXISTS idx_tests_date ON tests(date);
   CREATE INDEX IF NOT EXISTS idx_tests_manufacturer ON tests(manufacturer);
   CREATE INDEX IF NOT EXISTS idx_tests_author ON tests(author);
   CREATE INDEX IF NOT EXISTS idx_tests_date_manufacturer ON tests(date, manufacturer);
   CREATE INDEX IF NOT EXISTS idx_tests_author_manufacturer ON tests(author, manufacturer);

   -- 중복 방지를 위한 고유 제약 조건
   CREATE UNIQUE INDEX IF NOT EXISTS idx_tests_unique 
   ON tests(date, author, manufacturer, sample_number, usage_count);

   -- Row Level Security (RLS) 정책 설정
   -- 모든 사용자가 읽기/쓰기 가능하도록 설정 (공개 앱의 경우)
   ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
   ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
   ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

   -- 모든 사용자가 읽기 가능
   CREATE POLICY "Anyone can read tests" ON tests FOR SELECT USING (true);
   CREATE POLICY "Anyone can read manufacturers" ON manufacturers FOR SELECT USING (true);
   CREATE POLICY "Anyone can read authors" ON authors FOR SELECT USING (true);

   -- 모든 사용자가 쓰기 가능
   CREATE POLICY "Anyone can insert tests" ON tests FOR INSERT WITH CHECK (true);
   CREATE POLICY "Anyone can insert manufacturers" ON manufacturers FOR INSERT WITH CHECK (true);
   CREATE POLICY "Anyone can insert authors" ON authors FOR INSERT WITH CHECK (true);

   -- 모든 사용자가 업데이트 가능
   CREATE POLICY "Anyone can update tests" ON tests FOR UPDATE USING (true);
   CREATE POLICY "Anyone can update manufacturers" ON manufacturers FOR UPDATE USING (true);
   CREATE POLICY "Anyone can update authors" ON authors FOR UPDATE USING (true);

   -- 모든 사용자가 삭제 가능
   CREATE POLICY "Anyone can delete tests" ON tests FOR DELETE USING (true);
   CREATE POLICY "Anyone can delete manufacturers" ON manufacturers FOR DELETE USING (true);
   CREATE POLICY "Anyone can delete authors" ON authors FOR DELETE USING (true);

   -- 기본 제조사 데이터 삽입
   INSERT INTO manufacturers (name) VALUES 
     ('제조사 A'),
     ('제조사 B'),
     ('제조사 C'),
     ('제조사 D')
   ON CONFLICT (name) DO NOTHING;
   ```

3. **"Run" 버튼 클릭**하여 쿼리 실행
4. 성공 메시지 확인

## 4단계: 환경 변수 설정

1. **프로젝트 루트에 `.env` 파일 생성**
   - 파일 이름: `.env` (앞에 점 포함)
   - 다음 내용 추가:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **실제 값으로 교체**
   - `VITE_SUPABASE_URL`: 2단계에서 복사한 Project URL
   - `VITE_SUPABASE_ANON_KEY`: 2단계에서 복사한 anon public 키

3. **`.env` 파일을 `.gitignore`에 추가** (이미 있다면 확인만)
   - `.env` 파일은 절대 GitHub에 올리지 마세요!

## 5단계: GitHub Pages 배포 시 환경 변수 설정

GitHub Pages는 환경 변수를 직접 지원하지 않으므로, 빌드 시점에 환경 변수를 주입해야 합니다.

### 방법 1: GitHub Secrets 사용 (권장)

1. **GitHub 저장소에서**
   - Settings > Secrets and variables > Actions
   - "New repository secret" 클릭
   - 다음 시크릿 추가:
     - `VITE_SUPABASE_URL`: Supabase Project URL
     - `VITE_SUPABASE_ANON_KEY`: Supabase anon key

2. **`.github/workflows/deploy.yml` 수정** (이미 자동으로 설정됨)

### 방법 2: 빌드 시점에 주입

`vite.config.js`에서 환경 변수를 주입하도록 설정 (이미 완료됨)

## 6단계: 테스트

1. **개발 서버 실행**
   ```bash
   npm run dev
   ```

2. **브라우저 콘솔 확인**
   - F12 > Console
   - "Supabase 연결 성공!" 메시지 확인

3. **데이터 입력 테스트**
   - 테스트 데이터 입력
   - Supabase 대시보드 > Table Editor > tests 테이블에서 데이터 확인

## 문제 해결

### 연결 실패 시
- `.env` 파일이 올바른지 확인
- Supabase URL과 API 키가 정확한지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### RLS 정책 오류 시
- Supabase 대시보드 > Authentication > Policies에서 정책 확인
- 위의 SQL 쿼리를 다시 실행

### 데이터가 보이지 않을 때
- Supabase 대시보드 > Table Editor에서 직접 확인
- 네트워크 탭에서 API 요청 확인 (F12 > Network)

## 보안 참고사항

- `anon` 키는 공개되어도 괜찮습니다 (Row Level Security로 보호됨)
- 하지만 `service_role` 키는 절대 공개하지 마세요!
- 프로덕션 환경에서는 더 엄격한 RLS 정책을 설정하는 것을 권장합니다

