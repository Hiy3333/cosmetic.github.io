# GitHub Pages 배포 가이드

## 현재 상황
- 저장소 이름: `sample.github.io`
- 배포 URL: `https://hiy3333.github.io/sample.github.io/`

## 문제 해결 방법

### 방법 1: dist 폴더 내용을 루트에 배포 (권장)

저장소 이름이 `*.github.io`인 경우, GitHub Pages는 루트 폴더에서 파일을 찾습니다.

**단계:**
1. `dist` 폴더의 **내용**을 복사합니다 (dist 폴더 자체가 아닌!)
   - `index.html`
   - `assets/` 폴더 전체

2. GitHub 저장소의 **루트**에 올립니다:
   ```
   저장소 루트/
   ├── index.html
   └── assets/
       ├── index-BJQX5MBu.js
       └── index-DrBVdrq-.css
   ```

3. GitHub Pages 설정:
   - Settings > Pages
   - Source: `/ (root)` 선택
   - Save

### 방법 2: GitHub Pages에서 /dist 폴더 선택

1. GitHub 저장소에 `dist` 폴더를 그대로 올립니다
2. Settings > Pages에서:
   - Source: `/dist` 선택
   - Save

### 방법 3: GitHub Actions 자동 배포 (가장 권장)

이미 `.github/workflows/deploy.yml` 파일이 생성되어 있습니다.

1. 코드를 main 브랜치에 푸시:
   ```bash
   git add .
   git commit -m "Add GitHub Actions deployment"
   git push origin main
   ```

2. GitHub Actions가 자동으로:
   - 빌드를 실행
   - `gh-pages` 브랜치에 배포

3. Settings > Pages에서:
   - Source: `gh-pages` 브랜치 선택
   - Save

## 확인 사항

### ✅ 올바른 파일 구조
```
저장소 루트/
├── index.html          ← dist/index.html의 내용
└── assets/             ← dist/assets/ 폴더 전체
    ├── index-xxx.js
    └── index-xxx.css
```

### ❌ 잘못된 파일 구조
```
저장소 루트/
└── dist/               ← 이렇게 하면 안 됩니다!
    ├── index.html
    └── assets/
```

## 문제 해결 체크리스트

- [ ] `dist` 폴더의 **내용**을 루트에 올렸는가? (dist 폴더 자체가 아님)
- [ ] `assets` 폴더도 함께 올렸는가?
- [ ] GitHub Pages 설정에서 올바른 Source를 선택했는가?
- [ ] 브라우저 콘솔에서 에러가 없는가? (F12 > Console)
- [ ] 네트워크 탭에서 파일들이 404가 아닌가? (F12 > Network)

## 빠른 수정 방법

로컬에서 다음 명령어로 dist 폴더 내용을 확인:

```bash
npm run build
cd dist
dir  # Windows
# 또는
ls   # Mac/Linux
```

이 폴더의 모든 내용을 GitHub 저장소 루트에 올리면 됩니다!

