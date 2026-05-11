# 프론트엔드 문서

## 개요

메가시티 대시보드 프론트엔드는 Next.js 15와 React 19 기반의 전력/재생에너지/수소 전환 모니터링 화면입니다.

위젯별 위치와 크기를 조정할 수 있는 12컬럼 대시보드 그리드 구조를 사용합니다. 사용자가 편집한 레이아웃은 브라우저 `localStorage`에 저장되어 같은 PC와 같은 브라우저에서 다시 접속해도 유지됩니다.

## 기술 스택

- Framework: Next.js 15.5.15
- UI: React 19.1.0
- Language: TypeScript 5
- Styling: Tailwind CSS 4, 전역 CSS
- Charts: Chart.js 4.5.0, react-chartjs-2 5.2.0, Recharts 3.1.0
- Icons: lucide-react 0.533.0

## 프로젝트 구조

```text
src/
  app/
    page.tsx                 # 메인 대시보드 페이지
    layout.tsx               # 루트 레이아웃, Kakao map script, ThemeProvider
    globals.css              # 전역 스타일, 대시보드 그리드/위젯 스타일
    not-found.tsx            # 404 페이지

  components/
    alerts/                  # 알림 버튼/카드/모달
    cards/                   # 정보 카드 컴포넌트
    charts/                  # Chart.js 기반 차트 컴포넌트
    common/                  # 공통 UI
    dashboard/
      DashboardGrid.tsx      # 위젯 그리드, 편집/이동/리사이즈/저장
      DashboardWidgets.tsx   # 대시보드 위젯 구성
    map/
      JejuMapCard.tsx        # 제주 지도 및 지역별 기상 실황
    navbar/                  # 상단 네비게이션
    system/                  # 시스템 상태 카드

  lib/
    api.ts                   # API endpoint 정의
    config.ts                # 환경 설정
    constants.ts             # 스타일/상수
    dashboardLayout.ts       # 기본 위젯 레이아웃과 localStorage 키
    types.ts                 # 공통 타입
    useDashboardData.ts      # 대시보드 데이터 로딩 hook
    hooks/
      useKPICalculations.ts  # KPI 계산 hook
    utils.ts                 # 공통 유틸리티
```

## 대시보드 레이아웃

### 구조

대시보드는 `DashboardGrid`가 관리합니다.

- 12컬럼 CSS Grid
- 기본 row height: `52px`
- grid gap: `12px`
- 위젯별 `x`, `y`, `w`, `h`, `minW`, `minH` 관리
- 데스크톱에서는 위젯별 위치/크기 적용
- 1023px 이하에서는 1열 자동 배치

### 저장 방식

편집된 위젯 배치는 브라우저 `localStorage`에 저장됩니다.

```ts
export const DASHBOARD_LAYOUT_STORAGE_KEY = 'megacity-dashboard-layout-v4';
```

저장 데이터 예시:

```json
[
  { "id": "jeju-map", "x": 0, "y": 0, "w": 4, "h": 10, "minW": 4, "minH": 10 },
  { "id": "kpi", "x": 4, "y": 0, "w": 3, "h": 4, "minW": 3, "minH": 4 }
]
```

동작 방식:

- 최초 진입 시 `localStorage`에 저장된 레이아웃을 읽음
- 저장값이 없거나 파싱 실패 시 `DEFAULT_DASHBOARD_LAYOUT` 사용
- 위젯 이동/크기 변경 시 자동 저장
- `초기화` 버튼 클릭 시 기본 배치로 복원하고 저장값도 갱신

### 편집 기능

`DashboardGrid.tsx`에서 처리합니다.

- 편집 모드 토글
- 드래그 이동
- 크기 조정
- 화살표 버튼으로 미세 이동
- `X`, `Y`, `W`, `H` 직접 입력
- 충돌 시 스왑 우선 처리
- 스왑이 불가능한 경우 아래로 밀고 위쪽으로 자동 압축

## 주요 위젯

현재 `DashboardWidgets.tsx`에서 다음 위젯을 구성합니다.

| ID | 표시명 | 설명 |
| --- | --- | --- |
| `jeju-map` | 제주 지역 | 제주 지역 선택 지도 및 선택 지역 기상 실황 |
| `kpi` | KPI | 현재 수요, 신재생, 재생 비율, 수소 전환 |
| `demand` | 전력 수요 | 현재 수요 및 수요 예측 차트 |
| `system-status` | 시스템 상태 | API, DB, 예측 엔진 상태 |
| `weather` | 수소생산단지 기상 예측 | `REP_DATA_HG_FCST_NWP_DA` 기반 최신 기상 예측 |
| `sukub-info` | 계통 운영 정보 | 제주 계통 운영 정보 |
| `operation` | 전력 운영 | 제주 운영 관련 차트 |
| `demand-regen` | 수요 vs 재생에너지 | 전력 수요와 재생에너지 비교 |
| `curt` | 출력제어 | 제주 전체 예측 출력제어량 |
| `hydrogen-scenario` | 잉여 전력 기반 수소 전환 | 잉여 전력 기반 수소 생산량 추산 |
| `solar` | 태양광 발전 | 태양광 발전 예측 |
| `wind` | 풍력 발전 | 풍력 발전 예측 |
| `forecast-48h` | 최근 48시간 수소단지 기상 예측 | 영역별 기온/일사량/풍속 트렌드 |

현재 사용하지 않는 수소 생산/수소 예측 전용 위젯은 대시보드에서 제외되어 있습니다. 대신 수소 관련 표시는 `잉여 전력 기반 수소 전환` 위젯과 KPI의 `수소 전환` 항목으로 정리되어 있습니다.

## 데이터 의미

### 수소생산단지 기상 예측

프론트의 `ForecastPredict`는 DB 설계서 기준 다음 테이블을 의미합니다.

```text
REP_DATA_HG_FCST_NWP_DA
수소생산단지 기상 예측 자료(일간)
```

주요 컬럼:

| 프론트 필드 | DB 컬럼 | 의미 |
| --- | --- | --- |
| `pwrExcTpCd` | `PWR_EXC_TP_CD` | 전력거래구분 |
| `areaGrpCd` | `AREA_GRP_CD` | 영역그룹구분 |
| `areaGrpId` | `AREA_GRP_ID` | 영역그룹아이디 |
| `crtnTm` | `CRTN_TM` | 생성시간 |
| `fcstTm` | `FCST_TM` | 예측시간 |
| `leadTm` | `LEAD_TM` | 선행시간 |
| `fcstProdCd` | `FCST_PROD_CD` | 예측생산구분 |
| `fcstSrad` | `FCST_SRAD` | 최종일사량예측 |
| `fcstTemp` | `FCST_TEMP` | 최종기온예측 |
| `fcstHumi` | `FCST_HUMI` | 최종습도예측 |
| `fcstWspd` | `FCST_WSPD` | 최종풍속예측 |
| `fcstWdir` | `FCST_WDIR` | 최종풍향예측 |
| `fcstWsl2` | `FCST_WSL2` | L2 최종풍속예측 |
| `fcstWdl2` | `FCST_WDL2` | L2 최종풍향예측 |
| `fcstPsfc` | `FCST_PSFC` | 최종기압예측 |

DB 설계서 참고자료 기준 `L2`는 Level2이며, 본 테이블에서는 풍력터빈 높이인 약 80~100m를 의미합니다.

### 제주 지역 기상 실황

`JejuMapCard`는 수소생산단지 예측 자료와 별개로 기상청 지역 격자 기반 실황 정보를 표시합니다.

표시 항목:

- 기온
- 풍속
- 풍향
- 강수형태
- 하늘상태

제주 지역 선택은 다음 지역을 기준으로 합니다.

- 제주시
- 서귀포시
- 성산
- 고산

지도 마커는 Kakao 기본 마커 대신 투명 Marker와 `CustomOverlay`를 조합해 대시보드 스타일의 커스텀 마커로 표시합니다.

### 수소 전환 KPI

KPI의 `수소 전환`과 `잉여 전력 기반 수소 전환` 위젯은 같은 계산식을 사용합니다.

```text
잉여 전력(MW) = 현재 신재생 발전량 - 현재 수요
잉여 전력(kW) = 잉여 전력(MW) * 1000
수소 전환량(kg/h) = 잉여 전력(kW) * 0.115
```

수소 저장량 최대치는 현재 화면 계산에서 `1,000kg`으로 제한합니다.

```ts
const H2_PRODUCTION_KG_PER_KWH = 0.115;
const H2_STORAGE_MAX_KG = 1000;
```

잉여 전력이 없거나 현재 수요/신재생 데이터가 없으면 수소 전환 값은 표시하지 않습니다.

## 데이터 로딩

`useDashboardData.ts`에서 대시보드 데이터를 관리합니다.

주요 상태:

- `forecastPredict`: 최신 수소생산단지 기상 예측
- `forecastPredictLast48h`: 최근 48시간 수소생산단지 기상 예측
- `sukubOperation`: 최신 계통 운영 정보
- `sukubOperationToday`: 최근 24시간 계통 운영 정보
- `reGenPredictData`: 태양광 발전 예측
- `windPredictData`: 풍력 발전 예측
- `demandPredict`: 전력 수요 예측
- `jejuCurtPredictToday`: 제주 예측 출력제어량
- `hgGenPredictToday`: 수소 예측 생산량
- `hgGenInfoToday`: 수소 생산량 정보
- `essSeries`: ESS 충방전 시계열
- `currentSoc`: 현재 SOC
- `bestChrgTimes`: 충전 추천 시간대
- `bestDiscTimes`: 방전 추천 시간대
- `selectedJejuRegion`: 제주 지도 선택 지역
- `ncstTempC`, `ncstWindMs`, `ncstWindDir`, `ncstPty`, `ncstPtyText`, `ncstSky`: 선택 지역 실황 기상

자동 새로고침:

- 기본값: 켜짐
- 주기: 5분
- `dashboard-auto-refresh` 키로 localStorage 저장

## API 엔드포인트

`src/lib/api.ts`의 `ENDPOINTS`에서 관리합니다.

| 키 | 경로 | 설명 |
| --- | --- | --- |
| `forecastPredictLatest` | `/forecast-predict/latest` | 최신 수소생산단지 기상 예측 |
| `forecastPredictLast48h` | `/forecast-predict/last-48h` | 최근 48시간 수소생산단지 기상 예측 |
| `sukubOperationLatest` | `/sukub-operation/latest` | 최신 계통 운영 정보 |
| `sukubOperationLast24h` | `/sukub-operation/last-24h` | 최근 24시간 계통 운영 정보 |
| `reGenPredictLatestCrtn` | `/re-gen-predict/latest-crtn` | 태양광 발전 예측 |
| `windPredictLatestCrtn` | `/re-gen-predict/wind/latest-crtn` | 풍력 발전 예측 |
| `demandPredictLatestCrtn` | `/demand-predict/latest-crtn` | 전력 수요 예측 |
| `jejuCurtPredictLatestCrtn` | `/jeju-curt-predict/latest-crtn` | 제주 출력제어 예측 |
| `hgGenPredictToday` | `/hg-gen-predict/today` | 수소 예측 생산량 |
| `hgGenInfoToday` | `/hg-gen-info/today` | 수소 생산량 정보 |
| `jejuWeatherRegion` | `/jeju-weather/region?nx=&ny=` | 제주 선택 지역 실황 기상 |

API 기본 URL은 환경 변수로 설정합니다.

```env
NEXT_PUBLIC_API_BASE_URL=http://210.222.202.14:18080/api
```

## 백엔드 연계 참고

백엔드 프로젝트:

```text
megacity_back
```

현재 프론트의 `forecast-predict` 계열 API는 백엔드의 `ForecastPredict` 컨트롤러와 `ForecastPredictService`, 엔티티 `RepDataHgFcstNwpDa`와 연계됩니다.

DB 설계서 기준으로는 백엔드 DTO가 다음 필드를 내려주면 프론트 타입과 가장 잘 맞습니다.

- `pwrExcTpCd`
- `areaGrpCd`
- `areaGrpId`
- `crtnTm`
- `fcstTm`
- `leadTm`
- `fcstProdCd`
- `fcstSrad`
- `fcstTemp`
- `fcstHumi`
- `fcstWspd`
- `fcstWdir`
- `fcstWsl2`
- `fcstWdl2`
- `fcstPsfc`

현재 프론트에서는 일부 확장 필드를 optional로 열어두었으므로 백엔드가 아직 해당 필드를 내려주지 않아도 화면은 깨지지 않습니다.

## 실행 방법

개발 서버:

```bash
npm run dev
```

프로덕션 빌드:

```bash
npm run build
```

프로덕션 실행:

```bash
npm start
```

## 검증 기준

프론트 변경 후 기본적으로 확인할 항목:

- `npm run build` 성공 여부
- 대시보드 첫 화면에서 주요 위젯이 잘리지 않는지 확인
- 편집 모드에서 위젯 이동/크기 조정/초기화가 정상 동작하는지 확인
- localStorage에 저장된 레이아웃이 새로고침 후 복원되는지 확인
- Kakao 지도 스크립트 로드 및 커스텀 마커 클릭 동작 확인
- API 응답이 없을 때 빈 상태/장애 상태가 깨지지 않는지 확인

## 알려진 주의사항

- 레이아웃은 브라우저 localStorage 기반이므로 브라우저/PC별로 따로 저장됩니다.
- 브라우저 사이트 데이터 삭제, 시크릿 모드, 다른 브라우저 사용 시 레이아웃 저장값은 유지되지 않습니다.
- 모바일/태블릿 폭에서는 위젯 위치/크기 커스텀 값보다 1열 반응형 배치가 우선됩니다.
- `forecast-predict/latest`는 백엔드 조회 기준에 따라 특정 `AREA_GRP_ID`의 최신 row가 내려올 수 있으므로, 영역별 최신값이 필요하면 백엔드에 `areaGrpId` 필터 엔드포인트를 추가하는 것이 좋습니다.
