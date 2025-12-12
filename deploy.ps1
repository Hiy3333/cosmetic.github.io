# GitHub 자동 배포 스크립트 (PowerShell)
# 이 스크립트는 변경사항을 커밋하고 GitHub에 푸시합니다.

Write-Host "=== GitHub 배포 스크립트 ===" -ForegroundColor Cyan
Write-Host ""

# Git 저장소 초기화 확인
if (-not (Test-Path .git)) {
    Write-Host "Git 저장소를 초기화합니다..." -ForegroundColor Yellow
    git init
}

# 변경사항 확인
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "변경사항이 없습니다." -ForegroundColor Green
    exit 0
}

# 변경사항 표시
Write-Host "변경된 파일:" -ForegroundColor Yellow
git status --short
Write-Host ""

# 커밋 메시지 입력
$commitMessage = Read-Host "커밋 메시지를 입력하세요 (Enter: 자동 메시지)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# 모든 파일 추가
Write-Host "`n파일을 스테이징합니다..." -ForegroundColor Yellow
git add .

# 커밋
Write-Host "커밋합니다..." -ForegroundColor Yellow
git commit -m $commitMessage

# 원격 저장소 확인
$remote = git remote get-url origin 2>$null
if ($null -eq $remote) {
    Write-Host "`n원격 저장소가 설정되지 않았습니다." -ForegroundColor Red
    $repoUrl = Read-Host "GitHub 저장소 URL을 입력하세요 (예: https://github.com/username/repo.git)"
    if (-not [string]::IsNullOrWhiteSpace($repoUrl)) {
        git remote add origin $repoUrl
        Write-Host "원격 저장소가 추가되었습니다." -ForegroundColor Green
    } else {
        Write-Host "원격 저장소 URL이 필요합니다. 수동으로 설정해주세요:" -ForegroundColor Yellow
        Write-Host "  git remote add origin https://github.com/username/repo.git" -ForegroundColor Cyan
        exit 1
    }
}

# 브랜치 확인 및 설정
$currentBranch = git branch --show-current
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    git branch -M main
    $currentBranch = "main"
}

# 푸시
Write-Host "`nGitHub에 푸시합니다..." -ForegroundColor Yellow
try {
    git push -u origin $currentBranch
    Write-Host "`n✅ 성공적으로 푸시되었습니다!" -ForegroundColor Green
    Write-Host "GitHub Actions가 자동으로 배포를 시작합니다." -ForegroundColor Cyan
} catch {
    Write-Host "`n❌ 푸시 실패: $_" -ForegroundColor Red
    Write-Host "수동으로 푸시해주세요: git push -u origin $currentBranch" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n완료!" -ForegroundColor Green

