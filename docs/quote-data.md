# 명언 데이터 조달

[문서 목록](../README.md)

## 조사 결론

확인일: **2026-11-20 (KST)**. 무료·공개 API를 우선해 공식 문서·라이선스와 실제 응답을 비교했다.
**영어 명언을 허용한다면 Stoic Quotes를 MVP 1순위로 추천한다.**
스토아 철학에 특화되어 있고 인증·구독 없이 호출되며 CORS를 허용한다.
단, 최종 채택은 명언 언어와 콘텐츠 권리 확인 후 결정한다.
한국어 명언 제공을 확정하지 않으며 로컬 데이터나 DB도 아직 도입하지 않는다.

무료 접근, 오픈소스 코드, 콘텐츠 사용 권한은 서로 다르다.
무료 API도 장애·차단·정책 변경이 가능하며 무제한 호출이나 SLA를 의미하지 않는다.
공개 GitHub 저장소에 코드를 올리는 것 역시 제3자 명언·번역문을 자유롭게 재배포할 권한을 주지 않는다.

## 비용·적합성 비교

| 후보 | 비용·인증·호출 제한 | 언어와 콘텐츠 | 판단 |
|---|---|---|---|
| [Stoic Quotes][stoic-readme] | 공식 README가 무료 공개 API로 안내. 키 없이 호출 성공. 수치형 호출 한도·SLA는 확인한 문서에 없음 | 영어 스토아 철학 명언. 세네카·마르쿠스 아우렐리우스·에픽테토스 중심 | **조건부 1순위**. 목적에 가장 적합하지만 번역·원전 정보 미제공 |
| [DummyJSON][dummy-docs] | 무료·무인증. 공개 소스의 limiter는 IP당 10초에 100회, 개발 모드 제외. 운영 서비스의 보장 한도로 해석하지 않음 | 영어 일반 명언, 테스트·프로토타입용 데이터. 철학 전용 필터는 확인하지 못함 | 개발·초기 연결 확인용 차선책. 운영 콘텐츠 품질을 보장하지 않음 |
| [ZenQuotes][zen-docs] | 무료는 IP당 30초에 5회·출처 링크 필수. CORS 활성화에 키 또는 등록 IP 필요 | 영어 동기부여·일반 명언, 일부 작가·키워드 조회는 키 필요 | 무료 브라우저 직접 호출 구조에 부적합 |
| [Quotable][quotable-readme] | 공식 README상 무료·오픈소스, IP당 분당 180회 | 영어, 작가·태그 필터 지원 | 이번 환경에서 HTTPS 인증서 만료 오류. 복구 확인 전 제외 |
| [한국어 명언 API][korean-readme] | 키 없는 공개 엔드포인트. 비상업 무료·귀속 표기, 상업적 사용은 사전 허가. 수치형 한도 미확인 | 한국어, `message`·`author`·`authorProfile` | 배포 비활성화 응답으로 현재 제외. 수정·파생 버전도 라이선스상 금지 |
| [한글명언 OPEN API][aleph-readme] | README상 키·인증 불필요. 가격·수치형 한도·콘텐츠 이용 조건 미확인 | 한국어 번역 명언 | 엔드포인트 502, GitHub 라이선스 정보 없음. 현재 채택 근거 부족 |

ZenQuotes 구독 페이지에는 1개월 `7.99`, 3개월 `23.97`, 1년 `95.88`이 표시되어 있었다.
확인한 페이지 텍스트에는 통화가 명확하지 않았으므로 원화 환산·세금·결제 조건은 확정하지 않는다.
결제 화면은 이번 도구에서 연결 실패해 검증하지 못했다.
구독 시 무제한 요청·CORS를 안내하지만 월 100만 회 이상은 별도 문의 대상이다.
무료 우선 요구에서는 유료 가입이나 서버 프록시를 도입할 이유가 부족하다.

### 전체 비용 관점

Stoic Quotes 또는 DummyJSON 직접 호출안은 현재 별도 API 구독·API 키·자체 서버·DB가 필요 없다.
따라서 API 구독료는 현재 무료이나 웹 호스팅, 도메인, 향후 트래픽·정책 변경 비용은 별개다.
호스팅 비용은 [배포 가이드](deployment.md)의 사전 확인 대상으로 유지한다.
브라우저 직접 호출 시 사용자 IP 등 요청 메타데이터는 외부 공급자에게 전달된다.

한국어를 필수로 정한다면 무료 영어 API에 유료 번역을 붙이는 방식을 기본안으로 삼지 않는다.
번역 비용·저작권·품질 검수까지 늘어나기 때문이다.
적합한 한국어 API의 운영 복구·허가를 확인하거나 사용 권한이 명확한 소량의 자체 검수 데이터와 비교해야 한다.
광고 없는 서비스라고 반드시 비상업 이용인 것은 아니므로 서비스 목적에 맞춰 허가 조건을 확인한다.

## 실제 요청 결과

키·쿠키 없이 HTTPS GET으로 소수 요청만 수행했다. 부하·한도 초과 테스트는 하지 않았다.
`http://localhost:5173`과 `https://philos-probe.azurestaticapps.net`을 Origin 헤더로 사용했다.
두 번째 주소는 **테스트용 가상 Origin**이며 실제 배포 URL이 아니다.
실제 브라우저 실행·실제 배포 Origin 검증은 아직 수행하지 않았다.

| 엔드포인트 | 응답·스키마 | CORS 확인 |
|---|---|---|
| `https://stoic-quotes.com/api/quote` | 두 Origin 모두 200, 비어 있지 않은 문자열 `text`·`author` | 두 응답 모두 `Access-Control-Allow-Origin: *` |
| `https://dummyjson.com/quotes/random` | 두 Origin 모두 200, 정수 `id`, 문자열 `quote`·`author` | 각각 요청한 Origin을 허용 헤더로 반환 |
| `https://zenquotes.io/api/random` | 200, `q`·`a`·`h`를 가진 배열 | localhost Origin 요청에 허용 헤더 없음 |
| `https://api.quotable.io/quotes/random` | curl 오류 60, 인증서 만료로 HTTP 응답 확인 불가 | 검증 불가. TLS 검증을 우회하지 않음 |
| `https://korean-advice-open-api.vercel.app/api/advice` | 두 Origin 모두 402. 추가 확인에서 `x-vercel-error: DEPLOYMENT_DISABLED` | 정상 API 응답이 아니므로 사용 가능 판단 불가 |
| `https://quote.aleph.kr/quote/random` | 502 | 정상 응답의 CORS 검증 불가 |

한국어 API의 402는 호스팅 플랫폼의 배포 비활성화 응답이다.
API 자체가 유료로 전환되었다거나 결제하면 해결된다는 근거로 해석하지 않는다.
공개 소스의 CORS 설정과 실제 운영 응답은 다를 수 있다.
위 결과는 이 환경·확인 시점의 관측이며 지속 가용성이나 모든 지역의 장애를 보장·단정하지 않는다.

재확인 시 다음과 같이 응답 헤더와 상태를 볼 수 있다.
응답 본문을 문서나 공개 로그에 저장할 필요는 없다.

```bash
curl --silent --show-error --connect-timeout 10 --max-time 20 \
  --header 'Origin: http://localhost:5173' \
  --dump-header - --output /dev/null \
  https://stoic-quotes.com/api/quote
```

실제 앱에서는 인증 헤더나 쿠키를 붙이지 않는 단순 GET을 우선한다.
헤더 확인은 CORS의 사전 근거일 뿐이며 최종적으로 로컬·배포 브라우저에서 응답을 읽을 수 있어야 한다.

## 1순위 후보의 제약과 채택 조건

Stoic Quotes의 공식 데이터 파일을 확인한 결과 1,774개 항목 모두 `text`와 `author`만 있었다.
한국어 본문이나 원전·번역자·출처·안정적인 ID 필드는 없었다.
필드 검증은 수행했지만 전체 문장의 정확성·귀속·번역 권리를 검수한 것은 아니다.
본문을 복사하거나 데이터 파일을 이 저장소에 포함하지 않았다.

- 코드 저장소는 MIT 라이선스이나 라이선스의 저작권 표기는 미기입 템플릿 상태다.
  이를 현대 영어 번역의 사용·재배포 권리가 모두 해결되었다는 증거로 해석하지 않는다.
- 공개 서비스 적용 전 대표 문장의 원전·번역 출처와 필요한 허가·표기 조건을 확인한다.
  현재 응답만으로 원문 출처를 사용자에게 제공할 수 있다고 약속하지 않는다.
- 공급자 링크와 저자를 화면에 표시하는 방향을 권장한다.
  코드 복제 시 MIT 고지 의무와 API 데이터 귀속 조건은 구분한다.
- 수치형 한도와 SLA가 확인되지 않았으므로 자동 폴링·일괄 수집·무제한 재시도를 하지 않는다.
- 한국어 UI + 영어 명언 및 스토아 철학 중심 범위를 수용할 때만 채택한다.
  한국어 명언이나 철학 전반을 필수 요구로 정하면 후보를 재평가한다.
- 장애 시 기존 명언 유지·재시도 UX를 사용한다.
  다른 API로 자동 전환하면 콘텐츠·라이선스가 바뀌므로 자동 fallback은 이번 추천안에 넣지 않는다.

최종 선정 후에만 응답 매핑과 요청 시간 제한·429 처리·반복 명언 정책을 확정한다.
이번 조사만으로 앱 코드, 번역 기능, DB 또는 서버를 추가하지 않는다.

## 화면에 필요한 데이터

| 항목 | 요구사항과 확인할 점 |
|---|---|
| 본문 | 비어 있지 않은 텍스트. HTML 렌더링이 필요하지 않아야 함 |
| 저자 | 본문과 함께 표시. 누락 시 제외할지 `작자 미상`으로 표시할지는 선정 후 결정 |
| 출처 | 제공되는 작품명·출처 링크·귀속 정보를 보존하고 표기 의무 확인 |
| 언어 | 실제 응답 언어를 확인. 한국어 UI와 한국어 명언 제공을 혼동하지 않음 |
| ID | 안정적인 식별자가 제공되면 보존하고 반복 응답 구분에 활용 가능 |

정확한 TypeScript 타입과 공급자 응답 매핑은 API 선정 후 정의한다.
누락된 저자·출처를 추측하거나 임의로 만들어 내지 않는다.

## 조사 기준과 후속 검증

| 조사 항목 | 비교·확인 기준 |
|---|---|
| 운영 상태 | 공식 문서와 실제 요청으로 운영 여부, HTTPS, 응답 성공 확인 |
| 브라우저 호출 | 로컬 및 배포 Origin에서 CORS 허용 여부 확인. 단순 curl 성공으로 판단하지 않음 |
| 인증 | API 키 필요 여부, 클라이언트 공개 가능 여부, 서버 경유 필요 여부 |
| 랜덤 명언 | 랜덤 엔드포인트 또는 허용된 데이터 범위 내 무작위 선택 가능 여부 |
| 명언의 성격 | 철학적 성찰에 맞는 내용인지, 일반 명언만 제공하는지, 분류 기능 유무 |
| 언어 | 한국어·영어 지원 범위와 저자·출처 언어, 언어 필터 제공 여부 |
| 응답 품질 | 본문·저자·출처 누락, 빈 응답, 긴 문장, 안정적인 ID와 응답 스키마 |
| 이용 조건 | 상업적 사용, 재배포·캐시·번역 허용, 필수 출처 표기, 서비스 종료 시 처리 |
| 비용·제한 | 무료 범위, 요청 한도, 초과 응답, 유료 전환 조건, 호출 제한 헤더 |
| 신뢰도 | 원문 추적 가능성, 오인용·저자 오표기 사례와 대응 |

후보별로 공식 문서·약관 링크, 확인일, 테스트 결과와 제한을 기록한다.
비밀 값은 조사 결과나 요청 예시에 포함하지 않는다.
공개 API라는 이유만으로 명언과 번역본의 저작권·사용 권한이 해결되었다고 판단하지 않는다.
철학자의 원전과 현대 번역본의 권리는 다를 수 있으므로 필요한 범위에서 별도로 확인한다.

## 공급 방식 선택 기준

| 방식 | 검토 조건 | 부담 |
|---|---|---|
| 브라우저에서 외부 API 직접 호출 | 이용 조건에 맞고 CORS 허용, 비밀 키 불필요 | 외부 장애·한도·콘텐츠 품질에 의존 |
| 서버를 경유해 API 호출 | 서버 전용 키 또는 서버 호출 필요 | Functions 등의 운영·비용·배포 구조 추가 |
| 검증된 로컬 데이터 | 적합한 API가 없고 사용 권한을 확인할 수 있음 | 명언 수집·출처 검증·업데이트를 직접 관리 |
| DB | 운영 중 편집·확장 등 영속 저장 요구가 생김 | 저장소, 접근 제어, 운영·비용 추가 |

서버 경유가 이용약관상 허용되는지도 확인한다.
로컬 데이터나 DB로 전환하는 경우 결정 이유와 제품 범위를 먼저 갱신한다.
작은 정적 앱이라는 이유만으로 DB를 도입하거나 API 실패 시 무단 수집한 명언을 제공하지 않는다.

## 선정 이후 확정할 정책

- 제공할 명언 언어와 저자·출처 누락 처리.
- 요청 시간 제한, 요청 한도 초과 시 안내, 허용되는 캐시 범위.
- 동일 명언이 연속 반환될 때의 동작과 추가 호출의 상한.
- 철학적 명언 필터 가능 여부와 필터가 없을 때 제품 범위 조정.
- 외부 공급 중단 시 처리와 승인된 대체 데이터 필요 여부.

기본 오류 UX는 [제품 기획](product.md)을 따른다.
타임아웃이나 실패에 대해 무한 자동 재시도를 추가하지 않는다.
선정 결과는 이 문서에 기록하고 아키텍처·개발·배포 문서의 의존 사항도 함께 갱신한다.

## 공식 근거

문서는 확인일 기준이며 변경될 수 있다. 소스 링크는 조사 시 커밋으로 고정했다.

- Stoic Quotes: [공식 README][stoic-readme], [라이선스][stoic-license], [단건 API 구현][stoic-api], [데이터 파일][stoic-data].
- DummyJSON: [명언 API 문서][dummy-docs], [무료·무인증 안내][dummy-readme], [MIT 라이선스][dummy-license], [공개 limiter 구현][dummy-limit], [CORS 구현][dummy-cors].
- ZenQuotes: [사용 제한·귀속 문서][zen-docs], [무료 응답 캐시 안내][zen-home], [구독 가격·CORS 안내][zen-pricing].
- Quotable: [엔드포인트·호출 제한 README][quotable-readme].
- 한국어 명언 API: [README][korean-readme], [사용자 정의 라이선스][korean-license], [CORS 구현][korean-api].
- 한글명언 OPEN API: [공식 저장소와 README][aleph-readme].

[stoic-readme]: https://github.com/benhoneywill/stoic-quotes/blob/9c2c49b1efffed401b02106c10f1d5e85047f91e/README.md
[stoic-license]: https://github.com/benhoneywill/stoic-quotes/blob/9c2c49b1efffed401b02106c10f1d5e85047f91e/LICENCE
[stoic-api]: https://github.com/benhoneywill/stoic-quotes/blob/9c2c49b1efffed401b02106c10f1d5e85047f91e/pages/api/quote.js
[stoic-data]: https://github.com/benhoneywill/stoic-quotes/blob/9c2c49b1efffed401b02106c10f1d5e85047f91e/data/quotes.json
[dummy-docs]: https://dummyjson.com/docs/quotes
[dummy-readme]: https://github.com/Ovi/DummyJSON/blob/3d78fed5f35b7f1087db1c162edc412f2a736722/README.md
[dummy-license]: https://github.com/Ovi/DummyJSON/blob/3d78fed5f35b7f1087db1c162edc412f2a736722/LICENSE
[dummy-limit]: https://github.com/Ovi/DummyJSON/blob/3d78fed5f35b7f1087db1c162edc412f2a736722/src/middleware/rate-limiter.js
[dummy-cors]: https://github.com/Ovi/DummyJSON/blob/3d78fed5f35b7f1087db1c162edc412f2a736722/src/middleware/index.js
[zen-docs]: https://docs.zenquotes.io/zenquotes-documentation/
[zen-home]: https://zenquotes.io/
[zen-pricing]: https://my.zenquotes.io/
[quotable-readme]: https://github.com/lukePeavey/quotable/blob/bb2ff420b07c85d700c2293cfb9b5372a27fd160/README.md
[korean-readme]: https://github.com/gwongibeom/korean-advice-open-api/blob/639a2dd391d9d22a09e6d17ad1443516f8be1443/README.md
[korean-license]: https://github.com/gwongibeom/korean-advice-open-api/blob/639a2dd391d9d22a09e6d17ad1443516f8be1443/LICENSE
[korean-api]: https://github.com/gwongibeom/korean-advice-open-api/blob/639a2dd391d9d22a09e6d17ad1443516f8be1443/api/advice.ts
[aleph-readme]: https://github.com/Aleph-Kim/korean-quote
