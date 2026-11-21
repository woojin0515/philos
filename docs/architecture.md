# 아키텍처와 파일구조

[문서 목록](../README.md)

## 기술 선택: 초기 배포 구성

| 선택 | 근거 |
|---|---|
| React + TypeScript | 화면 상태와 데이터 형태를 명확히 관리 |
| Vite | 정적 클라이언트 앱의 간단한 개발·빌드 환경 |
| 기본 CSS | 단일 화면에 불필요한 UI 의존성을 추가하지 않음 |
| npm | 단일 앱의 의존성과 lockfile 관리 |
| 기본 `fetch` | 단순한 요청에 별도 데이터 라이브러리를 추가하지 않음 |
| Oxlint + TypeScript | 템플릿 기본 린터와 타입 검사. 당초 ESLint 추천을 대체 |
| Node 내장 테스트 | 서버 API·정적 응답 통합 검증 |
| Azure App Service Linux B1 | Philos 이름의 기본 주소, Node 정적 서버 |

React·TypeScript·Vite와 검사 도구를 구성했고 lockfile로 설치 버전을 관리한다.
CI는 `.nvmrc`의 Node.js 24 LTS를 사용한다.
초기에는 라우터, SSR, 전역 상태 라이브러리, 모노레포, DB를 도입하지 않는다.
App Service Node 서버는 배포된 정적 앱과 명언 API를 제공한다.

## 데이터 흐름

```text
화면 진입
  -> 중앙 `생각해보기` 문구와 글래스형 버튼만 표시 (API 요청 없음)
사용자 스와이프 완료
  -> GET /api/quote
  -> Node 서버가 로컬 100개 명언 코퍼스에서 선택
  -> 화면에 영어 명언·저자 표시
  -> 클라이언트가 정적 번역 사전에서 한국어 번역 조회
```

화면은 공급자 응답 구조를 직접 다루지 않고 `src/services/quotes.ts`에서 API 응답을 검증한다.
`src/services/quote-corpus.json`과 `src/services/quote-translations.js`가 100개 문장과 번역을 관리한다.
명언 선택과 번역 조회는 로컬 데이터로 처리하며 Stoic Quotes·Azure OpenAI·번역 API를 호출하지 않는다.
API별 SDK, 교체 가능한 provider 프레임워크, 범용 저장소 계층은 도입하지 않는다.
화면의 상태 규칙은 [제품 기획](product.md), 데이터 요구사항은
[명언 데이터 조달](quote-data.md)을 따른다.

Stoic Quotes는 초기 데이터 출처이며 런타임 공급자가 아니다.
AI 번역 API와 명언 티켓은 없으며 방문·재시도에 따른 외부 번역 호출도 발생하지 않는다.
Azure 리소스·가격·설정은 [배포 가이드](deployment.md)를 따른다.

## 현재 구조

```text
philos/
├── .env.example
├── .gitignore
├── .github/workflows/deploy.yml
├── .nvmrc
├── .oxlintrc.json
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── server.mjs
├── server.test.mjs
├── server-services/
│   └── quote-api.mjs
├── README.md
├── docs/
│   ├── product.md
│   ├── architecture.md
│   ├── quote-data.md
│   ├── azure-translation.md
│   ├── development.md
│   └── deployment.md
├── public/
│   └── staticwebapp.config.json
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── components/
    │   └── .gitkeep
    ├── services/
    │   └── quotes.ts
    ├── styles/
    │   └── index.css
    └── types/
        └── .gitkeep
```

Git은 빈 디렉터리를 추적하지 않으므로 `.gitkeep`으로 폴더를 보존한다.
실제 파일이 추가된 폴더에서는 해당 `.gitkeep`을 제거한다.

| 위치 | 향후 역할 |
|---|---|
| `public/` | 빌드 시 그대로 복사할 정적 파일 |
| `src/components/` | 명언 표시·버튼 등 재사용이 필요한 화면 요소 |
| `src/services/` | 앱 API 요청과 응답 검증·변환 |
| `src/styles/` | 기본 스타일과 화면 스타일 |
| `src/types/` | 여러 파일에서 공유할 데이터 타입. 지역 타입은 사용하는 파일에 유지 |

## 후속 추가 사항

앱 진입점·패키지·Vite·TypeScript·Oxlint·GitHub Actions 설정은 초기 배포에 포함했다.
`.gitignore`는 공개 저장소 게시 전에 추가했고 개발 세팅 시 필요한 규칙을 보완한다.
테스트는 대상 코드 옆에 두며 별도 빈 테스트 트리는 만들지 않는다.
명언 API와 서버 통합 테스트를 구현했다. 번역 UI·호출은 후속 작업이며 별도 UI 테스트 러너는 아직 추가하지 않았다.
GitHub Actions는 OIDC로 App Service에 배포하며 자세한 구성은 [배포 가이드](deployment.md)를 따른다.

현재 실행 가능한 npm 스크립트는 [개발 가이드](development.md)를 따른다.
