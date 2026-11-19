# 아키텍처와 파일구조

[문서 목록](../README.md)

## 기술 선택: 개발 세팅 시 적용할 추천안

| 선택 | 근거 |
|---|---|
| React + TypeScript | 화면 상태와 데이터 형태를 명확히 관리 |
| Vite | 정적 클라이언트 앱의 간단한 개발·빌드 환경 |
| 기본 CSS | 단일 화면에 불필요한 UI 의존성을 추가하지 않음 |
| npm | 단일 앱의 의존성과 lockfile 관리 |
| 기본 `fetch` | 단순한 요청에 별도 데이터 라이브러리를 추가하지 않음 |
| ESLint + TypeScript | 정적 오류와 코드 규칙 검사 |
| Vitest + React Testing Library | 데이터 처리와 사용자 관점의 상태 전환 검증 |
| Azure Static Web Apps | 정적 빌드 결과 호스팅 후보 |

현재 설치되거나 설정된 도구는 없다.
버전은 개발 세팅 시 호환되는 안정 버전과 지원 중인 Node.js LTS를 확인해 고정한다.
초기에는 라우터, SSR, 전역 상태 라이브러리, 모노레포, 서버, DB를 도입하지 않는다.

## 예상 데이터 흐름

```text
화면 진입 / 버튼 클릭
  -> 화면의 요청·상태 관리
  -> services의 API 요청 및 응답 검증·변환
  -> 선정할 외부 명언 API
  -> 화면 상태 갱신
```

화면은 공급자 응답 구조를 직접 다루지 않는다.
API 선정 후 `services/`의 작은 함수에서 실제 필드를 화면에 필요한 형태로 변환한다.
지금은 API별 SDK, 교체 가능한 provider 프레임워크, 범용 저장소 계층을 만들지 않는다.
화면의 상태 규칙은 [제품 기획](product.md), 데이터 요구사항은
[명언 데이터 조달](quote-data.md)을 따른다.

브라우저 직접 호출은 CORS와 키 노출 문제가 없는 API를 선정했을 때의 기본안이다.
무료 API 조사에서는 Stoic Quotes가 조건부 1순위이며 인증 없는 직접 호출과 CORS 응답을 확인했다.
영어 명언 허용 여부·콘텐츠 권리와 실제 브라우저 동작 확인 전에는 최종 공급자로 확정하지 않는다.
비밀 키나 서버 요청이 필요한 경우 Azure Functions 등 얇은 서버 경유 구조를 재검토하고,
배포 구조를 함께 갱신한다. 이 대안은 현재 확정되거나 구현된 구조가 아니다.

## 현재 생성하는 구조

```text
philos/
├── .gitignore
├── README.md
├── docs/
│   ├── product.md
│   ├── architecture.md
│   ├── quote-data.md
│   ├── development.md
│   └── deployment.md
├── public/
│   └── .gitkeep
└── src/
    ├── components/
    │   └── .gitkeep
    ├── services/
    │   └── .gitkeep
    ├── styles/
    │   └── .gitkeep
    └── types/
        └── .gitkeep
```

Git은 빈 디렉터리를 추적하지 않으므로 `.gitkeep`으로 폴더를 보존한다.
실제 파일이 추가된 폴더에서는 해당 `.gitkeep`을 제거한다.

| 위치 | 향후 역할 |
|---|---|
| `public/` | 빌드 시 그대로 복사할 정적 파일 |
| `src/components/` | 명언 표시·버튼 등 재사용이 필요한 화면 요소 |
| `src/services/` | 명언 요청, 응답 검증·변환 |
| `src/styles/` | 기본 스타일과 화면 스타일 |
| `src/types/` | 여러 파일에서 공유할 데이터 타입. 지역 타입은 사용하는 파일에 유지 |

## 개발 세팅 이후 추가할 파일

앱 진입점 `src/main.tsx`, `src/App.tsx`, 루트 `index.html`과 `package.json`,
lockfile, Vite·TypeScript·ESLint·테스트 설정은 후속 단계에서 생성한다.
`.gitignore`는 공개 저장소 게시 전에 추가하며 개발 세팅 시 필요한 규칙을 보완한다.
테스트는 대상 코드 옆에 두며 별도 빈 테스트 트리는 만들지 않는다.
GitHub Actions 및 Azure 설정은 실제 배포 경로가 정해진 뒤 추가한다.

예상 검증 명령은 [개발 가이드](development.md)에 정리하며
지금은 어떤 npm 스크립트도 존재하지 않는다.
