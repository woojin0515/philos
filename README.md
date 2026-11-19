# Philos

버튼 하나로 철학적인 명언을 만나고 잠깐의 동기부여를 얻는 웹사이트.
`Philos`는 작업명이며 공개 서비스명은 아직 정하지 않았습니다.

## 현재 단계

**React + TypeScript + Vite 최소 앱과 초기 배포 구성을 준비했습니다.**
초기 화면만 제공하며 명언 조회·한국어 번역 기능은 아직 구현하지 않았습니다.
배포 주소: https://brave-sand-036372100.6.azurestaticapps.net

Node.js 24 LTS를 권장합니다. `npm ci` 후 `npm run dev`로 개발 서버를 실행합니다.
`npm run lint`, `npm run typecheck`, `npm run build`로 검증합니다.

## 만들고자 하는 경험

첫 방문에 명언과 저자를 보여 주고, 버튼을 누르면 다른 명언을 요청합니다.
UI는 한국어를 사용하며 위에 영어 명언, 아래에 한국어 해석을 표시할 예정입니다.
한국어 번역은 Azure LLM 대안으로 진행합니다. 직접 Azure OpenAI 호출과 Translator LLM 옵션 중
구체 경로·모델·플랜은 초기 배포 후 확정합니다.
로그인, 즐겨찾기, 공유, DB는 초기 MVP에 포함하지 않습니다.

## 추천 기술스택

| 구분 | 추천안 |
|---|---|
| 프런트엔드 | React + TypeScript + Vite |
| 스타일 | 기본 CSS |
| 데이터 요청 | 브라우저 `fetch`, 외부 API 우선 검토 |
| 패키지 관리 | npm |
| 품질 도구 | Oxlint, TypeScript. 기능 구현 시 Vitest + React Testing Library 검토 |
| 배포 | Azure Static Web Apps Free + GitHub Actions |

현재 설치 버전은 lockfile을 기준으로 관리합니다.
개발용 공급자로 영어 스토아 철학 명언을 제공하는 **Stoic Quotes를 선택했습니다.**
가입·키·결제가 필요 없으며 공개 주소를 `.env.example`에 기록했습니다.
아직 앱 호출 코드와 한국어 번역 연결은 없고, 공개 서비스 적용 전 콘텐츠 권리 확인이 필요합니다.
서버·DB 도입은 확정하지 않았습니다.

## 문서

| 문서 | 다루는 내용 |
|---|---|
| [제품 기획](docs/product.md) | MVP 범위, 사용자 흐름, 상태별 동작, 접근성 |
| [아키텍처와 파일구조](docs/architecture.md) | 기술 선택, 코드 역할, 현재 구조와 향후 구조 |
| [명언 데이터 조달](docs/quote-data.md) | API 6개 비용·운영·이용 조건 비교, 실측 결과, 추천안 |
| [Azure 번역 서비스 조사](docs/azure-translation.md) | Translator·LLM 비교, 과금·무료 한도, 서버 구조, Portal 준비 |
| [개발 가이드](docs/development.md) | 후속 개발 세팅, 환경변수, 검증, Git 작업 규칙 |
| [Azure 초기 배포 가이드](docs/deployment.md) | 후속 Portal 배포의 사전 조건, 절차, 검증과 복구 |

## 다음 단계

1. Azure LLM의 호출 경로·모델·리전·예산을 확정하고 서버 구성을 준비합니다.
2. 별도 Web/UI 브랜치에서 명언과 한국어 해석 기능을 구현합니다.

초기 배포 작업은 `setup/initial-deployment` 브랜치에서 준비합니다.
LLM 리소스·모델 배포와 번역 호출은 아직 하지 않았습니다.
