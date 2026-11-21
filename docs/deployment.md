# Azure 초기 배포 가이드

[문서 목록](../README.md)

## 현재 App Service 배포

| 항목 | 현재 설정 |
|---|---|
| URL | https://philos.azurewebsites.net |
| 리소스 그룹 | `rg-philos-dev` (기존 유지) |
| 웹 앱 | `philos`, Korea Central, Linux Node.js 24 LTS |
| App Service Plan | `plan-philos-dev`, Basic B1, 인스턴스 1 |
| 시작 명령 | `node server.mjs` |
| 기능 | 스와이프 완료 후 Stoic Quotes 명언을 조회하고, Azure OpenAI 한국어 AI 번역을 표시 |
| 배포 | GitHub Actions, `development` 환경, Azure OIDC |

사용자가 유료 서비스로 Philos 이름을 포함하도록 요청해 App Service로 이전했다.
**B1은 호출량과 무관하게 플랜 실행 시간에 따라 비용이 발생한다.**
웹 앱을 중지해도 플랜 비용은 계속될 수 있다. Azure OpenAI 사용료와 별도다.
정확한 단가·통화·세금은 계약과 리전에 따라 [가격표](https://azure.microsoft.com/en-us/pricing/details/app-service/linux/)와
로그인한 가격 계산기에서 확인한다. 월 예산·금액 하드 캡을 구성한 상태는 아니다.
전용 도메인 구매 없이 `philos.azurewebsites.net`을 확보했다.

`server.mjs`는 빌드된 `dist`의 정적 파일과 `/api/quote`, `/api/translate`를 제공한다.
SWA 설정 파일의 보안 헤더는 Node 서버가 읽어 동일하게 적용한다.
클라이언트는 명언 공급자를 직접 호출하지 않으며, Azure 키도 서버 설정에서만 읽는다.
배포 산출물에는 `server.mjs`, `server-services/`, `dist/`만 포함한다.
외부 API 응답과 사용자 입력 크기를 제한하고, 프롬프트·모델 입력을 클라이언트에 노출하지 않는다.
App Service는 HTTPS 전용·TLS 1.2 이상·Always On을 설정했고 FTP·SCM 기본 인증을 비활성화했다.

GitHub `development` 환경의 배포 전용 Managed Identity `id-philos-deploy`를 사용한다.
Federation 대상은 실제 OIDC assertion에서 확인한 불변 ID 포함 subject
`repo:woojin0515@142905724/philos@1464304028:environment:development`이며,
웹 앱 리소스에만 Website Contributor 역할을 부여했다.
이 identity는 앱 런타임이나 Azure OpenAI 접근용 identity와 다르다.
로그인에는 `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` 환경 변수를,
배포에는 `AZURE_WEBAPP_NAME`, `AZURE_RESOURCE_GROUP` 변수를 사용한다.
이 값들은 GitHub 환경 Variables에 저장하며 클라이언트 비밀·게시 프로필을 사용하지 않는다.
CI는 린트·타입 검사·빌드 후 정적 산출물과 서버만 zip으로 업로드한다.

기존 SWA의 서버 설정을 비밀 노출 없이 App Service로 복사했다.
사용자 요청에 따라 Azure CLI로 App Service의 `TRANSLATION_ENABLED=true`를 설정해 공개 번역을 활성화했다.
설정값은 문서·로그에 출력하지 않는다. Azure OpenAI 호출은 사용자가 명언을 요청한 경우에만 발생한다.
설정 활성화 후 실제 사이트에서 Stoic Quotes 명언의 영어→한국어 번역 응답을 확인했다.
서버에는 명언별 티켓, 최소 1분 간격, 프로세스당 일일 50회 번역 제한이 있다.
이 메모리 기반 일일 제한은 앱 재시작·다중 인스턴스에서 초기화·분리되므로 비용 하드 캡이 아니다.
모델 배포에서 확인한 처리량은 1 RPM·1,000 TPM이며, 계약 단가·월 예산은 별도 확인이 필요하다.
기존 Free SWA는 롤백용으로 보존했지만 자동 배포 대상에서는 제외했다.
현재 공식 주소는 위 App Service 주소다.
Azure OpenAI 리소스·모델 배포는 변경하지 않았다.

새 주소를 실제 Chromium에서 열어 제목·본문, JS·CSS 200, CSP 헤더,
모바일·데스크톱 레이아웃과 브라우저 실행 오류 없음을 확인했다.
Node 서버의 HTML·자산 제공, 캐시, HEAD, 비공개 경로 404, POST 405 테스트도 통과했다.

## 이전 Static Web Apps 배포 기록

아래 SWA 주소·Functions 계획·토큰 설정은 이전 구성의 기록이다.
현재 배포 대상과 서버 구조는 위 App Service 구성을 따른다.

### 초기 배포 구성

| 항목 | 설정 |
|---|---|
| 리소스 그룹 | `rg-philos-dev`, Korea Central |
| Static Web App | `swa-philos-dev`, East Asia, Free |
| URL | https://wonderful-hill-0d84f8000.6.azurestaticapps.net |
| 범위 | 초기 안내 화면. 명언·LLM 번역 미구현 |
| 배포 | `main` push 또는 workflow_dispatch → GitHub Actions |
| API | 없음. LLM 서버는 후속 단계 |

## Philos 주소 연결 상태

현재 SWA 자동 생성 주소는 원하는 문자열로 이름을 변경할 수 없다.
`swa-philos-dev`라는 리소스 이름과 사이트의 자동 호스트 이름은 별개다.
삭제·재생성해도 `philos.azurestaticapps.net`을 지정할 수 없다.
사용자의 명시적 요청으로 웹 앱만 삭제·재생성했고 현재 표의 새 자동 주소를 받았다.
기존 `brave-sand-036372100.6.azurestaticapps.net` 주소는 더 이상 이 앱의 배포 주소가 아니다.
리소스 그룹·Azure OpenAI·모델 배포는 보존했다.
서버 설정을 메모리에서 복구하고 GitHub 환경의 배포 Secret을 새 토큰으로 교체했다.

Philos 이름의 주소는 소유·관리 권한이 있는 도메인(예: `philos.example.com`)을 연결해야 한다.
현재 연결된 커스텀 도메인은 없고 사용할 도메인·DNS 관리 위치를 받지 못해 **Philos 이름 연결은 보류**했다.
도메인 구매, DNS 영역 생성, 다른 호스팅으로 이전은 진행하지 않았다.
공식 안내: [SWA 커스텀 도메인](https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain).

도메인이 정해지면 해당 이름의 CNAME을 현재 SWA 호스트로 설정하고,
Portal의 Custom domains에서 소유권 검증과 TLS 인증서 발급을 완료한다.
루트 도메인은 레코드 방식이 다를 수 있으므로 등록 업체별 공식 안내를 따른다.
등록·갱신 비용은 별도이며 Azure는 연결된 도메인에 관리형 TLS 인증서를 제공한다.
이름 연결 후 HTTPS·앱 렌더링·필요한 리디렉션을 다시 검증해야 한다.
도메인 없이 `philos`가 포함된 플랫폼 기본 주소를 원하면 다른 호스팅의
이름 가용성·비용·배포 구조를 먼저 비교하며 임의로 이전하지 않는다.

## 추가된 LLM 서비스와 서버 준비

| 항목 | 현재 설정 |
|---|---|
| Azure OpenAI | `aoai-philos-dev`, East US 2, S0 |
| 모델 배포 | `philos-translate`, `gpt-5-mini`, 버전 `2025-08-07` |
| 배포 유형 | GlobalStandard, 용량 1, 사용량 기반 과금. PTU 예약 아님 |
| 확인된 처리 한도 | 배포 응답 기준 분당 요청 1회·토큰 1,000개. 금액 상한 아님 |
| 버전 정책 | NoAutoUpgrade. 조회한 카탈로그의 퇴역일 `2027-07-13` 이전 재검토 필요 |
| 번역 서버 | App Service의 Node API (`/api/translate`) |
| 공개 번역 상태 | App Service의 `TRANSLATION_ENABLED=true`로 활성화 |

기본 구독의 East US 2 모델 가용성·잔여 할당량을 조회한 뒤 생성했다.
GlobalStandard는 전역 처리일 수 있으며 한국 내 처리만을 보장하지 않는다.
작은 개발 한도는 공개 서비스 트래픽에 부족하므로 사용자별·전체 호출 제한과 월 예산을 정한 후 확대한다.
구독·계약 단가와 월 예산은 아직 확정하지 않았다. 비용 알림·하드 캡도 구성하지 않았다.
단발 번역 검증은 과금되는 실제 호출이며 입력 29·완료 81 토큰(추론 64 포함), 합계 110 토큰을 반환했다.
추가로 운영 웹앱에서 명언을 발급해 Azure OpenAI 번역 결과를 확인했다.
자체 작성한 테스트 문장과 사용자가 요청한 명언 번역 검증 외에 대량 수집·번역은 수행하지 않았다.

App Service 설정에 `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`,
`AZURE_OPENAI_DEPLOYMENT`, `TRANSLATION_ENABLED`를 사용한다.
기존 설정은 병합해 보존했으며 키는 메모리에서 전달해 로컬 파일·명령 인수·저장소에 기록하지 않았다.
별도 Function App은 사용하지 않는다. 이 구성을 위해 추가 DB, Storage Account,
Key Vault, Application Insights는 만들지 않았다.
인증 방식·영속 저장·관측 요구가 생기면 각각 필요성을 재검토한다.

Azure CLI로 리소스를 생성했으며 같은 리소스를 Azure Portal에서 관리할 수 있다.
이번 최소 배포는 azd/IaC 대신 CLI + GitHub Actions로 구성했다.
전체 인프라 자동화는 서버·LLM 구성이 결정된 뒤 검토한다.
새 작업은 준비 브랜치에서 검증하고 `main`에 반영해야 배포된다.

워크플로는 린트·타입 검사·빌드 후 산출물만 업로드한다.
PR에서는 검증만 수행하고 배포하지 않는다.
GitHub `development` 환경의 `AZURE_STATIC_WEB_APPS_API_TOKEN`에
공식 SWA 업로드 액션용 배포 토큰을 저장했다. 토큰은 저장소·로그·명령 인수에 기록하지 않는다.
현재 환경에 수동 승인 게이트는 설정하지 않았다.
배포 토큰은 리소스 단위 자격 증명이므로 필요 시 Portal에서 교체하고 GitHub Secret도 갱신한다.
범용 Azure 관리 권한을 가진 서비스 주체·클라이언트 비밀을 CI에 부여하지 않는다.

아래 내용은 후속 변경·재배포 및 서버 확장 시 참고하는 절차다.

### 초기 검증 결과

로컬 및 GitHub Actions에서 린트·타입 검사·프로덕션 빌드가 통과했다.
[최초 배포 실행](https://github.com/woojin0515/philos/actions/runs/44556457732)이 성공했고,
실제 배포 주소를 Chromium으로 열어 한국어 제목·본문 렌더링, JS·CSS 200 응답,
375px·1280px 화면의 가로 넘침 없음, CSP 헤더, 브라우저 실행 오류 없음을 확인했다.
이는 첫 Static Web Apps 배포 당시의 범위 기록이다. 이후 명언 API와 현재 화면은 후속 배포에서 추가한다.

Azure MCP의 Static Web Apps 가이드를 참고했다.
플랜 가격·한도·리전 지원·조직 정책은 배포 시 공식 문서와 Portal에서 다시 확인한다.
무료 이용 가능 여부나 비용이 발생하지 않는다는 점을 보장하지 않는다.

## 사전 조건

- [API 선정](quote-data.md)과 [개발 세팅](development.md)이 완료되어 있어야 한다.
- 최소 앱이 로컬에서 실행되고 타입 검사·린트·테스트·빌드가 통과해야 한다.
- `dist`에 실제 정적 산출물이 생성되는지 확인해야 한다.
- GitHub 저장소와 배포할 브랜치가 정해지고 코드가 푸시되어 있어야 한다.
- Azure 구독·리소스 그룹·리전·플랜·리소스 이름과 생성 권한을 확인해야 한다.
- GitHub 연동 권한, 조직의 Actions 정책과 배포 자격 증명 관리 방식을 확인해야 한다.
- 서버 호출이 필요한 API라면 정적 프런트엔드만의 배포 계획을 먼저 수정해야 한다.
- Azure 번역은 App Service 서버 API를 사용하며 공개 활성화 전 비용·상한을 검토한다.

## Portal 초기 배포 절차

다음은 실행 시 확인할 순서다. Portal 화면과 지원 옵션은 변경될 수 있다.

1. Azure Portal에서 사용할 구독을 확인하고 Static Web App 생성 화면으로 이동한다.
2. 리소스 그룹·이름·플랜·리전을 선택한다. 기존 리소스 재사용 여부와 비용 조건을 확인한다.
3. GitHub 배포 원본을 연결하고 승인된 조직·저장소·배포 브랜치를 선택한다.
4. 실제 앱 설정에 맞춰 아래 빌드 경로를 확인한다.
5. 생성될 GitHub Actions 워크플로와 필요한 배포 자격 증명 구성을 확인한다.
6. 승인된 범위에서 리소스를 생성하고 Actions 빌드·배포 성공 여부를 확인한다.
7. Portal에서 발급된 사이트 URL을 열어 아래 완료 기준을 검증한다.

| 설정 | 프런트엔드만 사용하는 현재 추천 구조의 예상 값 |
|---|---|
| 앱 위치 | `/` |
| API 위치 | 비움. Functions를 선택하면 재설계 |
| 빌드 산출물 위치 | `dist` |
| 빌드 명령 | 향후 정의할 `npm run build` |
| 배포 브랜치 | 실행 시 확정 |

이 값들은 아직 존재하지 않는 빌드 설정을 전제로 한 예상 값이다.
실제 프로젝트의 파일 위치·스크립트·워크플로와 대조한 뒤 사용한다.
Portal이 추가한 워크플로도 검토하고 버전 관리한다.

## 설정과 자격 증명

환경변수·비밀 관리 원칙은 [개발 가이드](development.md)를 따른다.
프런트엔드 `VITE_*` 값은 빌드 시 포함되므로 변경 후 재빌드가 필요하다.
Portal의 서버용 앱 설정에 값을 추가하는 것만으로 정적 번들의 값이 바뀌지는 않는다.
선택한 배포 인증 방식에 필요한 비밀은 승인된 GitHub Secrets 등에 저장하고 기록에 출력하지 않는다.

초기 단일 화면에는 불필요한 SPA 라우팅 설정을 추가하지 않는다.
추후 클라이언트 라우팅을 도입하면 fallback과 API·정적 자산 예외를 함께 검증한다.
보안 헤더·CSP가 필요하면 선택한 API의 연결 Origin 등 실제 의존성을 확인해 설정한다.

## 배포 완료 기준

- Actions 실행이 성공하고 배포 URL이 HTTPS로 응답한다.
- 실제 브라우저에서 앱이 렌더링되고 JS·CSS 자산이 정상 로드된다.
- 배포 Origin에서 첫 명언 요청·버튼·번역·오류 UX를 확인한다.
- API에 임의 번역 입력이 불가능하고 키·프롬프트가 응답·번들에 노출되지 않는지 확인한다.
- 번들·저장소·브라우저 요청에 비밀 키가 노출되지 않는다.
- 구독·리소스 그룹·사이트 이름·URL·배포 브랜치·배포 커밋을 비밀 없이 기록한다.

HTTP 응답 성공만으로 빈 화면이나 CORS 문제가 없다고 판단하지 않는다.

## 실패와 복구

빌드 실패는 lockfile, Node.js 버전, 앱 위치와 실제 스크립트를 먼저 대조한다.
빈 화면은 산출물 경로와 JS·CSS 로드 실패를 확인한다.
명언 요청 실패는 Stoic Quotes 가용성·응답 형식을 확인한다.
번역 오류는 Azure 응답·쿼터와 서버의 안전한 오류 변환을 확인한다.
메모리 기반 사용량 제한은 앱 재시작 시 초기화되므로 하드 캡으로 간주하지 않는다.

배포 이후 문제가 생기면 이전에 검증한 커밋으로 되돌리는 변경을 만들어 재배포한다.
최초 배포에는 이전 정상 버전이 없으므로 원인 수정 후 다시 배포한다.
리소스 삭제는 복구의 기본 수단으로 사용하지 않으며 별도 승인 없이 삭제하지 않는다.
반복 가능한 인프라 구성이 필요해지면 Azure Developer CLI(azd)와 IaC 도입을 검토한다.

## 후속 확인용 공식 자료

- [Azure Static Web Apps 개요](https://learn.microsoft.com/azure/static-web-apps/overview)
- [첫 정적 웹 앱 배포](https://learn.microsoft.com/azure/static-web-apps/get-started-portal)
- [빌드 구성](https://learn.microsoft.com/azure/static-web-apps/build-configuration)

위 링크는 후속 실행 시 확인할 공식 자료이며, 이번 단계에서 모든 최신 조건을 검증한 것은 아니다.
