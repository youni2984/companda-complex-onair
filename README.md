# 컴판다 지상파 ON AIR

갤럭시(Android)와 아이폰(iOS)에서 홈 화면에 추가해 앱처럼 사용할 수 있는 PWA입니다.

## 지원 채널

- KBS 1TV / KBS 2TV — KBS 공식 ON AIR
- MBC — iMBC 공식 온에어
- SBS — SBS 공식 라이브
- EBS 1 / EBS 2 — EBS 공식 온에어

> 방송 스트림을 복제·추출하지 않고 각 방송사의 공식 온에어 페이지로 연결합니다.
> 방송사 정책, 저작권, 로그인/연령 제한에 따라 일부 프로그램은 재생이 제한될 수 있습니다.

## 스마트폰 최적화

반응형 UI는 실제 기기명 하드코딩보다 CSS 뷰포트 폭, 세로/가로 방향, Safe Area를 기준으로 동작합니다.

- iPhone SE급 / 소형 안드로이드
- Galaxy S 계열
- Galaxy Ultra
- Galaxy Z Flip
- Galaxy Z Fold 커버 화면
- Galaxy Z Fold 펼침 화면
- iPhone 일반 / Pro
- iPhone Plus / Max
- 노치, Dynamic Island, 홈 인디케이터 Safe Area
- 가로모드 및 폴더블 펼침 상태

## Device Lab

`devices.html`에서 대표 CSS 뷰포트로 메인 ON AIR 화면을 직접 비교할 수 있습니다.

기능:

- 기종 프로필 선택
- 세로/가로 즉시 전환
- 선택 기기 대형 미리보기
- 8개 대표 기기 한눈에 비교
- 실제 `index.html`을 iframe으로 불러와 같은 반응형 CSS 검증

대표 프로필 값은 UI 테스트용 CSS 픽셀 기준이며 실제 물리 해상도와는 다를 수 있습니다.

## 설치

### 갤럭시
Chrome 또는 Samsung Internet에서 사이트를 연 뒤 **앱 설치** 또는 **홈 화면에 추가**를 선택합니다.

### 아이폰
Safari에서 사이트를 연 뒤 **공유 → 홈 화면에 추가**를 선택합니다.

## GitHub Pages 배포

1. GitHub 저장소 `Settings`
2. `Pages`
3. `Build and deployment` → `Deploy from a branch`
4. Branch를 `main`, 폴더를 `/(root)`로 선택
5. 저장 후 발급되는 Pages 주소로 접속

## 파일

- `index.html` — 모바일 ON AIR 화면
- `devices.html` — 스마트폰 기종별 Device Lab
- `manifest.webmanifest` — PWA 설정
- `sw.js` — 서비스 워커 및 페이지별 캐시
- `icon-180.png` — iPhone 홈 화면 아이콘
- `icon-192.png`, `icon-512.png` — Android/PWA 아이콘
- `.nojekyll` — GitHub Pages 정적 배포 보조

## 프로젝트

컴판다 컴플릭스의 모바일 지상파 ON AIR 모듈.
