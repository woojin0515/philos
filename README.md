# Philos

버튼 하나로 철학적인 명언을 만나고 잠깐의 동기부여를 얻는 웹사이트.
`Philos`는 작업명이며 공개 서비스명은 아직 정하지 않았습니다.

## 현재 단계

**첫 화면에서 버튼을 눌러 영어 철학 명언을 만나는 경험을 구현했습니다.**
배포 주소: https://philos.azurewebsites.net
Philos 이름의 기본 주소를 사용하기 위해 유료 Azure App Service로 이전했습니다.

Node.js 24 LTS를 권장합니다. `npm ci` 후 `npm run dev:api`와 `npm run dev`를 각각 실행합니다.
`npm run lint`, `npm run typecheck`, `npm run build`로 검증합니다.

## 만들고자 하는 경험

첫 화면에는 `생각해보기` 문구와 가운데 버튼 하나만 표시합니다.
버튼을 누른 뒤 영어 명언과 저자를 보여 주며, 처음에는 자동 조회하지 않습니다.
LLM 한국어 번역은 후속 단계로 미룹니다.
`aoai-philos-dev`의 `philos-translate`(`gpt-5-mini`)를 배포하고 단발 번역을 확인했습니다.
서버 번역 API는 비활성 상태로 유지하며, Azure 호출 없이 명언만 표시합니다.
로그인, 즐겨찾기, 공유, DB는 초기 MVP에 포함하지 않습니다.

## 추천 기술스택

| 구분 | 추천안 |
|---|---|
| 프런트엔드 | React + TypeScript + Vite |
| 스타일 | 기본 CSS |
| 데이터 요청 | 브라우저 `fetch` → App Service Node API |
| 패키지 관리 | npm |
| 품질 도구 | Oxlint, TypeScript. 기능 구현 시 Vitest + React Testing Library 검토 |
| 배포 | Azure App Service Linux Basic B1 + GitHub Actions OIDC |

현재 설치 버전은 lockfile을 기준으로 관리합니다.
영어 스토아 철학 명언 공급자로 **Stoic Quotes**를 사용하며, 서버가 고정 URL에서 조회합니다.
공개 서비스 적용 전 콘텐츠 권리 확인이 필요하며 DB는 도입하지 않았습니다.

## 문서

| 문서 | 다루는 내용 |
|---|---|
| [제품 기획](docs/product.md) | MVP 범위, 사용자 흐름, 상태별 동작, 접근성 |
| [아키텍처와 파일구조](docs/architecture.md) | 기술 선택, 코드 역할, 현재 구조와 향후 구조 |
| [명언 데이터 조달](docs/quote-data.md) | API 6개 비용·운영·이용 조건 비교, 실측 결과, 추천안 |
| [Azure 번역 서비스 조사](docs/azure-translation.md) | Translator·LLM 비교, 과금·무료 한도, 서버 구조, Portal 준비 |
| [개발 가이드](docs/development.md) | 개발·로컬 실행, 환경변수, 검증, Git 작업 규칙 |
| [Azure 배포 가이드](docs/deployment.md) | App Service 구성, 운영 주의, 비용과 배포 검증 |

## 다음 단계

1. 반응형 UI를 검증하고 `main` 배포 후 실제 사이트에서 확인합니다.
2. LLM 한국어 번역은 별도 작업으로 추가합니다.

LLM 서비스 준비 기록과 도메인 연결 조건은 [배포 가이드](docs/deployment.md)를 참고합니다.
