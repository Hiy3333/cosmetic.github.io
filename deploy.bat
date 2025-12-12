@echo off
REM GitHub 자동 배포 스크립트 (Windows 배치 파일)
REM 이 스크립트는 변경사항을 커밋하고 GitHub에 푸시합니다.

echo === GitHub 배포 스크립트 ===
echo.

REM Git 저장소 초기화 확인
if not exist .git (
    echo Git 저장소를 초기화합니다...
    git init
)

REM 변경사항 확인
git status --porcelain >nul 2>&1
if errorlevel 1 (
    echo 변경사항이 없습니다.
    exit /b 0
)

REM 변경사항 표시
echo 변경된 파일:
git status --short
echo.

REM 커밋 메시지 입력
set /p commitMessage="커밋 메시지를 입력하세요 (Enter: 자동 메시지): "
if "%commitMessage%"=="" (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set commitMessage=Update: %datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%
)

REM 모든 파일 추가
echo.
echo 파일을 스테이징합니다...
git add .

REM 커밋
echo 커밋합니다...
git commit -m "%commitMessage%"

REM 원격 저장소 확인
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo 원격 저장소가 설정되지 않았습니다.
    set /p repoUrl="GitHub 저장소 URL을 입력하세요 (예: https://github.com/username/repo.git): "
    if not "%repoUrl%"=="" (
        git remote add origin %repoUrl%
        echo 원격 저장소가 추가되었습니다.
    ) else (
        echo 원격 저장소 URL이 필요합니다. 수동으로 설정해주세요:
        echo   git remote add origin https://github.com/username/repo.git
        exit /b 1
    )
)

REM 브랜치 확인 및 설정
git branch --show-current >nul 2>&1
if errorlevel 1 (
    git branch -M main
    set currentBranch=main
) else (
    for /f "delims=" %%I in ('git branch --show-current') do set currentBranch=%%I
)

REM 푸시
echo.
echo GitHub에 푸시합니다...
git push -u origin %currentBranch%
if errorlevel 1 (
    echo.
    echo 푸시 실패. 수동으로 푸시해주세요: git push -u origin %currentBranch%
    exit /b 1
) else (
    echo.
    echo 성공적으로 푸시되었습니다!
    echo GitHub Actions가 자동으로 배포를 시작합니다.
)

echo.
echo 완료!
pause

