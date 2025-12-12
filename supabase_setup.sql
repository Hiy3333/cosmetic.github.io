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

-- 기존 정책 삭제 (이미 존재하는 경우를 대비)
DROP POLICY IF EXISTS "Anyone can read tests" ON tests;
DROP POLICY IF EXISTS "Anyone can read manufacturers" ON manufacturers;
DROP POLICY IF EXISTS "Anyone can read authors" ON authors;
DROP POLICY IF EXISTS "Anyone can insert tests" ON tests;
DROP POLICY IF EXISTS "Anyone can insert manufacturers" ON manufacturers;
DROP POLICY IF EXISTS "Anyone can insert authors" ON authors;
DROP POLICY IF EXISTS "Anyone can update tests" ON tests;
DROP POLICY IF EXISTS "Anyone can update manufacturers" ON manufacturers;
DROP POLICY IF EXISTS "Anyone can update authors" ON authors;
DROP POLICY IF EXISTS "Anyone can delete tests" ON tests;
DROP POLICY IF EXISTS "Anyone can delete manufacturers" ON manufacturers;
DROP POLICY IF EXISTS "Anyone can delete authors" ON authors;

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

