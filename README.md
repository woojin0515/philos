# Philos

버튼 하나로 철학적인 명언을 만나고 잠깐의 동기부여를 얻는 웹사이트.
`Philos`는 작업명이며 공개 서비스명은 아직 정하지 않았습니다.

## 현재 단계

**첫 화면의 스와이프로 영어 철학 명언과 한국어 번역을 만납니다.**
배포 주소: https://philos.azurewebsites.net
Philos 이름의 기본 주소를 사용하기 위해 유료 Azure App Service로 이전했습니다.

Node.js 24 LTS를 권장합니다. `npm ci` 후 `npm run dev:api`와 `npm run dev`를 각각 실행합니다.
`npm run lint`, `npm run typecheck`, `npm run build`로 검증합니다.

## 만들고자 하는 경험

첫 화면에는 `생각해보기` 문구와 가운데 스와이프 조작부 하나만 표시합니다.
스와이프 후 정적 코퍼스에서 영어 명언과 저자, 한국어 번역을 함께 보여 줍니다.
현재 100개 문장을 포함하며, 명언 선택과 번역 조회 모두 런타임 외부 API를 호출하지 않습니다.
명언 요청 외에 번역을 다시 누르거나 기다리는 동작은 없습니다.
로그인, 즐겨찾기, 공유, DB는 초기 MVP에 포함하지 않습니다.

## 추천 기술스택

| 구분 | 추천안 |
|---|---|
| 프런트엔드 | React + TypeScript + Vite |
| 스타일 | 기본 CSS |
| 데이터 요청 | 브라우저 `fetch` → App Service Node API; 정적 번역 사전 조회 |
| 패키지 관리 | npm |
| 품질 도구 | Oxlint, TypeScript. 기능 구현 시 Vitest + React Testing Library 검토 |
| 배포 | Azure App Service Linux Basic B1 + GitHub Actions OIDC |

현재 설치 버전은 lockfile을 기준으로 관리합니다.
초기 코퍼스 100개는 **Stoic Quotes** 공개 API에서 가져왔고 화면에 출처를 표시합니다.
전체 공급자 데이터는 1,774개로 확인했으며 나머지 문장은 아직 앱에 포함하지 않았습니다.
공개 재배포·번역 권리와 원전 표기는 별도 확인 대상으로 남아 있으며 DB는 도입하지 않았습니다.

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

1. 초기 100개 번역의 표현과 원문·저자 귀속을 검수합니다.
2. 사용 권한과 품질을 확인한 뒤 정적 번역 범위를 넓힐지 결정합니다.

Azure 번역 서비스의 과거 조사·시험 기록은 [배포 가이드](docs/deployment.md)를 참고합니다.
