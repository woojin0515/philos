# Azure 한국어 번역 서비스 조사

[문서 목록](../README.md) · [명언 공급자 조사](quote-data.md)

확인일: **2026-11-20 (KST)**.
영어 명언 위에 한국어 해석을 붙이는 기능에 사용할 Azure 서비스를 조사했다.
사용자는 Azure 내 유료 서비스도 허용했다. 이는 리소스 생성·배포나 특정 예산의 승인이 아니다.
이번 작업은 공식 자료 조사와 설계 기록만 수행했다.
Azure 계정의 실제 리전·쿼터·계약 단가, 번역 품질·지연은 아직 확인하지 않았다.

## 추천 결론

**MVP는 Azure Translator의 일반 NMT 텍스트 번역을 우선 검토한다.**
한 문장을 번역하는 데 모델 배포·프롬프트 관리가 필요 없고 문자 기준으로 비용을 추정하기 쉽다.
무료 F0를 사용할 수 있으면 평가에 활용하고, 운영 트래픽·제약에 따라 유료 S1을 검토한다.
유료 사용이 가능하더라도 처음부터 대형 LLM·전용 처리량·커스텀 학습을 선택하지 않는다.

철학적 표현의 자연스러움이 NMT에서 부족하면 Azure OpenAI의 소형 LLM과 같은 문장으로 비교한다.
LLM이 항상 더 정확하거나 저렴하다고 전제하지 않는다.
한국어 해석은 `자동 번역`임을 표시하며 정식 번역본·원전 해설로 표현하지 않는다.
번역 서비스를 이용할 권한과 영어 명언·번역문을 서비스에서 사용할 권한은 별개다.

## 선택지 비교

| 선택지 | 구성·과금 | 장점 | 제약과 판단 |
|---|---|---|---|
| Azure Translator 일반 NMT | Translator 리소스, 원문 문자 수 기반. 한국어 `ko` 지원 | 단순한 번역 API, 비용 산정 용이, 프롬프트 불필요 | 짧은 격언의 중의성·철학 용어·문체는 검수 필요. **MVP 우선안** |
| Azure OpenAI 소형 LLM 직접 호출 | Microsoft Foundry에서 모델 배포, 입력·출력 토큰 과금 | 존댓말·문어체·용어 일관성 등 지침 부여 가능 | 설명 추가·의미 왜곡·거부·비용 변동 가능. NMT와 품질 비교 후 선택 |
| Translator의 LLM 번역 옵션 | Translator `2026-06-06` API와 지원되는 Foundry 모델 구성, 입력·출력 토큰 과금 | 번역 전용 인터페이스에서 LLM·톤·참조 번역 활용 가능 | Foundry 리소스 필요. 지원 모델·리전·버전 호환성 확인 필요. NMT 요금·F0 무료량을 적용하면 안 됨 |

문서 번역, Speech, Custom Translator 학습·모델 호스팅은 짧은 텍스트 한 문장 용도에 불필요하다.
Foundry의 다른 공급자 모델도 선택지는 있으나 이번 MVP를 위해 Marketplace 계약·모델별 정책까지 확대하지 않는다.
Azure OpenAI는 OpenAI 개인 API 계정·ChatGPT 구독과 별도의 Azure 리소스·과금 체계다.

### API·모델 버전

공식 문서는 Translator `2026-06-06`을 GA로 소개하면서 v3.0 대비 breaking change도 명시한다.
요청·응답 구조가 다르므로 v3.0 예제와 최신 API 설정을 섞지 않는다.
실제 구현 시 NMT 지원 SDK·API 버전을 선택하고 요청·인증·응답을 통합 테스트한다.
LLM 옵션에는 별도의 Foundry 리소스와 지원되는 모델 구성이 필요하다.

직접 LLM 호출의 평가 후보는 `gpt-4.1-mini`, `gpt-5-mini` 같은 소형 계열이다.
이는 특정 구독에서 지금 배포 가능하다는 보장이 아니다.
실제 모델 ID·버전·지원 API·배포 유형·TPM/RPM 쿼터·퇴역일을 공식 카탈로그와 Portal에서 확인한다.
구형 모델의 Regional Standard 종료와 Global Standard 지원을 혼동하지 않는다.
Global 배포는 리소스가 한국 리전에 있어도 처리가 한국에만 머문다는 뜻이 아니다.
대화 에이전트, 도구 호출, 검색, RAG, 파인튜닝은 도입하지 않는다.

## 비용과 계산 방법

### 확인된 요금 정보

- Translator 공식 가격표의 **F0는 월 200만 문자 무료**를 안내한다.
  표에는 일반 번역과 커스텀 번역 학습의 조합이라고 명시되어 있다.
  이 앱은 일반 텍스트 번역만 검토한다.
- S1 일반 텍스트 번역은 **100만 원문 문자당 단가**를 사용한다.
  공백·문장부호 등도 문자 수에 포함되며 같은 문장을 다시 번역하면 다시 사용량이 발생한다.
- F0 월 무료량과 서비스 제한 문서의 시간당 처리량은 서로 다른 제한이다.
  유료 S1에도 F0 무료량이 자동 차감된다고 가정하지 않는다.
- Azure OpenAI 및 Translator LLM은 **입력·출력 토큰**으로 계산한다.
  지침·문맥·요청 오버헤드와 해당 모델의 과금되는 추론 토큰도 고려한다.
- 이번에 읽은 Translator·Azure OpenAI 가격 페이지에서 유료 단가는 `$-`로 표시됐다.
  **현재 계약의 실제 숫자 단가·통화·세금을 확인하지 못했으므로 금액을 확정하지 않는다.**
  리전·배포 유형·모델 버전을 선택하고 로그인한 가격 계산기·Portal에서 확인해야 한다.

### 트래픽 가정 예시

다음은 요금 견적이 아니라 용량 계산이다. 원문 평균을 150자로 가정한다.
캐시 적중을 제외하고 **실제로 번역한 횟수**를 기준으로 계산한다.

| 월 번역 횟수 | 원문 문자 합계 | 해석 |
|---|---|---|
| 1,000회 | 150,000자 | F0 월 문자량 이내라는 계산. 처리량·구독 제약은 별도 |
| 10,000회 | 1,500,000자 | F0 월 문자량 이내라는 계산. 다른 사용량과 재시도도 합산 |
| 100,000회 | 15,000,000자 | F0 월 문자량 초과. 유료 플랜 또는 호출 제한 검토 |

S1 번역 비용 = `청구 문자 수 / 1,000,000 × 선택 리전의 100만 문자당 단가`.
LLM 비용 = `청구 입력 토큰 / 1,000,000 × 입력 단가 + 청구 출력 토큰 / 1,000,000 × 출력 단가`.
LLM의 한국어 출력 토큰 수는 영어 글자 수와 같지 않으므로 실제 사용량으로 측정한다.
평가 시 캐시 할인·Batch 할인은 기본 견적에 가정하지 않는다.
사용자가 기다리는 버튼 응답에는 비동기 Batch가 적합하지 않다.

전체 비용에는 Functions 실행·호스팅 플랜, 로그 수집, 네트워크, 필요 시 저장소·Key Vault가 추가될 수 있다.
대량 일괄 번역·사전 수집은 현재 범위가 아니다.
명언·번역 캐시는 권리·약관과 저장 기간을 확인한 후 도입하며 DB를 미리 추가하지 않는다.

### 비용 통제

- Cost Management 예산과 실제·예측 비용 알림을 설정한다.
  **예산 알림은 소비를 중단시키는 하드 캡이 아니며 비용 집계에도 지연이 있다.**
- 서버에서 요청당 길이, 호출 빈도, 전역 사용량 상한과 번역 중단 스위치를 설계한다.
  다중 인스턴스에서 일관된 한도 집계 방법도 구현 시 결정한다.
- 429·일시 오류 재시도는 제한하고 할당량 소진·인증 실패를 무한 재시도하지 않는다.
- LLM은 출력 길이·시간 제한을 두고 대화 이력을 누적하지 않는다.
  거부·빈 응답·잘린 출력을 정상 번역으로 표시하지 않는다.
- F0가 소진되면 자동 유료 업그레이드를 하지 않는다.
  S1 사용 여부와 월 운영 예산은 배포 전에 정한다.

## 권장 서버 경유 구조

```text
브라우저
  -> 자체 /api/quote (향후 Azure Functions)
     -> Stoic Quotes에서 영어 명언 조회·검증
     -> 선택한 Azure 번역 서비스 호출
  <- 영어 명언 + 저자 + 해당 한국어 번역 / 번역 실패 상태
```

명언 조회를 서버가 수행하면 임의 문자열을 번역하는 공개 프록시가 되는 위험을 줄일 수 있다.
그렇더라도 익명 방문자의 반복 호출로 과금이 발생할 수 있어 서버 한도가 필요하다.
CORS나 Origin 검사만으로 남용을 방지할 수 있다고 보지 않는다.
자유 입력·사용자 제공 URL·모델 선택·프롬프트를 받는 범용 번역 API는 노출하지 않는다.
기존 `VITE_QUOTES_API_URL`은 공개 주소 예시이며 이 서버 경유안에서는 브라우저 직접 호출에 사용하지 않는다.
구현 단계에서 공급자 주소를 서버 설정으로 이동하고 예시도 갱신한다.

Azure 키는 서버 환경에만 두고 `VITE_*`, 번들, 공개 저장소에 넣지 않는다.
지원되는 호스팅·인증 조합에서는 Managed Identity + 최소 RBAC 권한을 우선 검토한다.
SWA 관리형 Functions는 공식 기능표상 Managed Identity·Key Vault 참조를 지원하지 않는다.
단순 MVP는 관리형 API의 서버 앱 설정으로 키를 관리할 수 있다.
Managed Identity·Key Vault 참조가 필요하면 별도 Function App 등의 구성을 검토하고 추가 비용·플랜을 비교한다.

NMT는 공식 문서상 번역 텍스트를 보존하지 않는 no-trace 정책을 안내한다.
이를 모든 LLM 경로에 그대로 적용하지 않는다.
Azure OpenAI는 무단 기반 모델 학습에 사용하지 않는 정책과 별도로
남용 모니터링·상태 저장 기능·배포 유형에 따른 데이터 처리를 확인해야 한다.
명언만 전송하고 사용자 식별 정보나 비밀은 번역 요청·로그에 포함하지 않는다.

## 품질 검증과 화면 정책

서비스 생성 후 사용 권한을 확인한 대표 문장으로 NMT와 필요 시 소형 LLM을 비교한다.
부정문, 은유, 짧은 격언, 긴 문장, 철학 용어에 대해 의미 보존·한국어 자연스러움·문체·추가 설명 유무를 평가한다.
함께 응답 시간, 청구 문자·토큰, 거부·오류율을 기록한다. 현재 실제 번역 테스트 결과는 없다.

LLM을 쓰면 입력 문장을 명령이 아닌 번역 대상 데이터로 취급하고 한국어 번역만 반환하도록 제한한다.
출처·저자·의미를 임의로 만들어 내거나 원문을 긍정적으로 재작성하도록 요청하지 않는다.
번역 실패 시 영어와 저자를 유지하고 실패 안내를 제공한다.
이전 영어 문장의 번역을 새 문장 아래에 붙이지 않는다.
상세 화면 상태는 [제품 기획](product.md)을 따른다.

## Portal에서 진행할 후속 작업

1. [Azure Portal](https://portal.azure.com/)에서 구독·리소스 그룹·정책·생성 권한을 확인한다.
2. NMT는 [Translator 생성 화면](https://portal.azure.com/#create/Microsoft.CognitiveServicesTextTranslation)에서
   리전·F0 또는 S1·실제 단가·제약을 확인한다. 아직 생성하지 않았다.
3. LLM은 [Microsoft Foundry](https://ai.azure.com/)에서 리소스와 지원 모델·배포 유형·버전·쿼터를 확인한다.
   Azure Portal에서 시작해 Foundry 화면으로 이동할 수 있으며 별도 모델 배포가 필요할 수 있다.
4. 선택한 서비스의 엔드포인트·인증을 서버에 연결하고 호출 제한·비용 알림을 구성한다.
5. 개발 환경에서 실제 번역·오류·지연·비용을 검증한 뒤 배포한다.

사용자가 해야 할 수 있는 작업은 Azure 로그인, 조직 정책상 권한 부여, 모델 이용 조건 동의와 예산 결정이다.
리소스 생성 권한이 있으면 설정·연결 작업을 도구로 진행할 수 있지만 이번에는 계정 접근이나 생성을 시도하지 않았다.
키를 채팅으로 전달할 필요는 없다. 서버 비밀 설정에 직접 저장한다.

## 공식 근거

- [Translator 가격표: F0·S1](https://azure.microsoft.com/en-us/pricing/details/translator/)
- [Azure OpenAI 가격표: 토큰·배포 유형](https://azure.microsoft.com/en-us/pricing/details/azure-openai/)
- [Azure 가격 계산기](https://azure.microsoft.com/en-us/pricing/calculator/)
- [Translator 언어 지원](https://learn.microsoft.com/en-us/azure/ai-services/translator/language-support)
- [Translator 2026-06-06: NMT·LLM·API 변경](https://learn.microsoft.com/en-us/azure/ai-services/translator/text-translation/2026-06-06/overview)
- [Translator 리소스 구성](https://learn.microsoft.com/en-us/azure/ai-services/translator/how-to/create-translator-resource)
- [Translator 서비스 제한](https://learn.microsoft.com/en-us/azure/ai-services/translator/service-limits)
- [Azure 모델 카탈로그](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure)
- [모델 퇴역 일정](https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule)
- [Cost Management 예산의 동작](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets)
- [SWA Functions 기능 차이](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-functions)
- [Translator 데이터 처리](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/translator/data-privacy-security)
- [Azure OpenAI 데이터 처리](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/openai/data-privacy)
