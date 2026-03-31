npm run dev# 프론트엔드 문서

## 개요

메가시티 대시보드는 Next.js 15와 React 19를 기반으로 구축된 전력 수급 관리 대시보드 애플리케이션입니다. 실시간 전력 수요, 재생에너지 발전량, 수소 생산, 기상 예보 등의 데이터를 시각화하여 제공합니다.

## 기술 스택

- **프레임워크**: Next.js 15.4.4
- **UI 라이브러리**: React 19.1.0
- **스타일링**: Tailwind CSS 4
- **차트 라이브러리**: 
  - Chart.js 4.5.0
  - react-chartjs-2 5.2.0
  - Recharts 3.1.0
- **아이콘**: Lucide React 0.533.0
- **언어**: TypeScript 5

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 대시보드 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   └── globals.css        # 전역 스타일
├── components/            # React 컴포넌트
│   ├── alerts/           # 알림 관련 컴포넌트
│   ├── cards/            # 정보 카드 컴포넌트
│   ├── charts/           # 차트 컴포넌트
│   ├── common/            # 공통 컴포넌트
│   ├── dashboard/        # 대시보드 레이아웃 컴포넌트
│   ├── map/              # 지도 관련 컴포넌트
│   ├── navbar/           # 네비게이션 바
│   └── system/           # 시스템 상태 컴포넌트
└── lib/                  # 유틸리티 및 로직
    ├── api.ts            # API 엔드포인트 정의
    ├── config.ts         # 설정 상수
    ├── constants.ts      # 스타일 상수
    ├── types.ts          # TypeScript 타입 정의
    ├── useDashboardData.ts  # 대시보드 데이터 훅
    ├── hooks/            # 커스텀 훅
    ├── utils/            # 유틸리티 함수
    └── types/            # 추가 타입 정의
```

## 주요 기능

### 1. 실시간 대시보드
- 전력 수요 및 재생에너지 발전량 모니터링
- 수소 생산 현황 및 예측
- 기상 예보 데이터 시각화
- 제주 지역 전력 운영 현황

### 2. 자동 새로고침
- 5분 간격 자동 데이터 갱신
- 수동 새로고침 기능
- localStorage를 통한 설정 저장

### 3. 차트 시각화
- 전력 수요 예측 차트
- 재생에너지 발전 예측 차트
- 태양광/풍력 발전 예측
- 수소 생산 예측 차트
- 48시간 기상 예보 차트

### 4. 지역별 정보
- 제주 지역 선택 기능 (제주시, 서귀포, 성산, 고산)
- 지역별 실시간 기상 정보
- 지도 기반 시각화

## 컴포넌트 상세

### 대시보드 레이아웃

#### `page.tsx` (메인 페이지)
메인 대시보드 페이지로, 3단 컬럼 레이아웃을 사용합니다.

**주요 기능:**
- `useDashboardData` 훅을 통한 데이터 관리
- `useKPICalculations` 훅을 통한 KPI 계산
- 지역 선택 및 필터링
- 자동/수동 새로고침 제어

**레이아웃 구조:**
- **LeftColumn**: 전력 수요, 출력제어, 기상 정보, 제주 지도
- **CenterColumn**: 수급 운영 현황, 재생에너지 발전 예측
- **RightColumn**: 수소 생산, 시스템 상태, KPI 지표
- **Forecast48hSection**: 48시간 기상 예보 상세

#### `LeftColumn.tsx`
왼쪽 컬럼 컴포넌트로 다음 정보를 표시합니다:
- 현재 전력 수요 및 재생에너지 비율
- 전력 수요 예측 차트
- 제주 출력제어 예측 차트
- 기상 예보 정보 카드
- 제주 지역 지도

#### `CenterColumn.tsx`
중앙 컬럼 컴포넌트로 다음 정보를 표시합니다:
- 수급 운영 현황 (오늘)
- 전력 수요 vs 재생에너지 비교 차트
- 태양광/풍력 발전 예측 차트

#### `RightColumn.tsx`
오른쪽 컬럼 컴포넌트로 다음 정보를 표시합니다:
- 수소 생산 현황 및 예측
- 수급 운영 정보
- KPI 지표 (전력 수요, 재생에너지, 재생에너지 비율, 수소 활용률)
- 시스템 상태 (API, DB, 예측 서비스)

### 차트 컴포넌트

#### `DemandPredictChart.tsx`
전력 수요 예측 차트를 표시합니다.
- 예측값 (fcstQgen)
- 최대값 (fcstQgmx)
- 최소값 (fcstQgmn)
- 현재값 (currPwrTot) - 실시간 데이터와 병합

#### `SolarPredictChart.tsx`
태양광 발전 예측 차트를 표시합니다.

#### `WindPredictChart.tsx`
풍력 발전 예측 차트를 표시합니다.

#### `HydrogenForecastChart.tsx`
수소 생산 예측 차트를 표시합니다.
- 예측 생산량 (fcstQgen)
- 예측 용량 (fcstCapa)

#### `ForecastLast48hChart.tsx`
48시간 기상 예보 차트를 표시합니다.
- 일사량 (fcstSrad)
- 온도 (fcstTemp)
- 습도 (fcstHumi)
- 풍속 (fcstWspd)
- 기압 (fcstPsfc)

### 카드 컴포넌트

#### `ForecastInfoCard.tsx`
기상 예보 정보 카드를 표시합니다.
- 온도, 풍속, 풍향
- 강수 형태 및 하늘 상태

#### `HydrogenProductionCard.tsx`
수소 생산 현황 카드를 표시합니다.
- 현재 생산량 및 용량
- 활용률

#### `KmaNowCard.tsx`
기상청 실시간 데이터 카드를 표시합니다.

#### `SukubInfoCard.tsx`
수급 운영 정보 카드를 표시합니다.

### 알림 컴포넌트

#### `AlertsButton.tsx`
알림 버튼 컴포넌트입니다.

#### `AlertsCard.tsx`
알림 카드 컴포넌트입니다.

#### `AlertsModal.tsx`
알림 모달 컴포넌트입니다.

## 데이터 관리

### `useDashboardData` 훅

대시보드의 모든 데이터를 관리하는 커스텀 훅입니다.

**주요 상태:**
- `forecastPredict`: 최신 기상 예보
- `sukubOperation`: 최신 수급 운영 데이터
- `sukubOperationToday`: 오늘의 수급 운영 데이터 (24시간)
- `reGenPredictData`: 재생에너지 발전 예측 (태양광)
- `windPredictData`: 풍력 발전 예측
- `demandPredict`: 전력 수요 예측
- `jejuCurtPredictToday`: 제주 출력제어 예측
- `hgGenPredictToday`: 수소 생산 예측
- `hgGenInfoToday`: 수소 생산 정보
- `forecastPredictLast48h`: 최근 48시간 기상 예보
- `essSeries`: ESS 충전/방전 시계열 데이터
- `currentSoc`: 현재 SOC (State of Charge)
- `bestChrgTimes`: 최적 충전 시간대
- `bestDiscTimes`: 최적 방전 시간대
- `hgGenUtilPct`: 수소 생산 활용률
- `hgGenLastItem`: 최신 수소 생산 정보

**시스템 상태:**
- `apiStatus`: API 상태 ('ok' | 'error')
- `dbStatus`: DB 상태 ('ok' | 'error')
- `healthApi`, `healthDb`, `healthPredict`: 서비스 헬스 상태
- `latApi`, `latDb`, `latPredict`: 응답 지연시간 (ms)
- `hgGenLatency`: 수소 생산 데이터 지연시간 (초)

**기상 데이터:**
- `ncstTempC`: 실시간 온도
- `ncstWindMs`: 실시간 풍속
- `ncstWindDir`: 실시간 풍향
- `ncstPty`: 강수 형태 코드
- `ncstPtyText`: 강수 형태 텍스트
- `ncstSky`: 하늘 상태 코드

**주요 함수:**
- `load()`: 모든 데이터를 로드하는 함수
- `loadJejuWeather(region)`: 특정 지역의 날씨 데이터를 로드하는 함수
- `setAutoRefresh(boolean)`: 자동 새로고침 설정

**자동 새로고침:**
- 기본값: 5분 간격
- `autoRefresh` 상태로 제어
- localStorage에 설정 저장

### `useKPICalculations` 훅

KPI 지표를 계산하는 커스텀 훅입니다.

**계산 지표:**
- `currentDemand`: 현재 전력 수요
- `currentRenewable`: 현재 재생에너지 발전량
- `renewableRatio`: 재생에너지 비율 (%)
- `hydrogenUtil`: 수소 활용률 (%)

## API 통신

### 엔드포인트 정의 (`api.ts`)

모든 API 엔드포인트는 `ENDPOINTS` 객체에 정의되어 있습니다.

**기상 예보:**
- `forecastPredictLatest`: 최신 기상 예보
- `forecastPredictLast48h`: 최근 48시간 기상 예보

**수급 운영:**
- `sukubOperationLatest`: 최신 수급 운영 데이터
- `sukubOperationLast24h`: 최근 24시간 수급 운영 데이터

**재생에너지 발전 예측:**
- `reGenPredictLatestCrtn`: 태양광 발전 예측 (최신 CRTN_TM 기준)
- `windPredictLatestCrtn`: 풍력 발전 예측 (최신 CRTN_TM 기준)

**전력 수요 예측:**
- `demandPredictLatestCrtn`: 전력 수요 예측 (최신 CRTN_TM 기준)

**제주 출력제어 예측:**
- `jejuCurtPredictLatestCrtn`: 제주 출력제어 예측 (최신 CRTN_TM 기준)

**수소 생산:**
- `hgGenPredictToday`: 수소 생산 예측 (오늘)
- `hgGenInfoToday`: 수소 생산 정보 (오늘)

**제주 날씨:**
- `jejuWeatherCurrent`: 제주 현재 날씨
- `jejuWeatherRegion(nx, ny)`: 제주 지역별 날씨

### API 설정 (`config.ts`)

**환경 변수:**
- `NEXT_PUBLIC_API_BASE_URL`: API 기본 URL (기본값: `http://210.222.202.14:18080/api`)

**차트 설정:**
- `DEFAULT_HEIGHT`: 기본 차트 높이 (260px)
- `MAX_XAXIS_TICKS`: X축 최대 틱 수 (8)
- `MARGIN`: 차트 여백 설정

**지도 설정:**
- `MAX_RETRIES`: 최대 재시도 횟수 (50)
- `RETRY_INTERVAL_MS`: 재시도 간격 (100ms)
- `DEFAULT_LEVEL`: 기본 지도 레벨 (11)

### `fetchWithTiming` 함수

API 요청의 응답 시간을 측정하는 함수입니다.

```typescript
const { res, ms } = await fetchWithTiming(url);
// res: Response 객체
// ms: 응답 시간 (밀리초)
```

## 타입 정의

### 주요 타입 (`types.ts`)

#### `ForecastPredict`
기상 예보 데이터 타입:
```typescript
{
    crtnTm: string;      // 생성 시간
    fcstTm: string;      // 예보 시간
    areaGrpId: string;   // 지역 그룹 ID
    fcstSrad: number;    // 일사량 예측
    fcstTemp: number;    // 온도 예측
    fcstHumi: number;    // 습도 예측
    fcstWspd: number;    // 풍속 예측
    fcstPsfc: number;    // 기압 예측
}
```

#### `SukubOperation`
수급 운영 데이터 타입:
```typescript
{
    tm: string;              // 시간
    suppAbility: number;     // 공급 능력
    currPwrTot: number;      // 현재 전력 총량
    renewPwrTot: number;     // 재생에너지 전력 총량
    renewPwrSolar: number;   // 태양광 전력
    renewPwrWind: number;    // 풍력 전력
}
```

#### `DemandPredict`
전력 수요 예측 타입:
```typescript
{
    crtnTm: string;          // 생성 시간
    fcstTm: string;          // 예측 시간
    fcstQgen: number;        // 예측 발전량
    fcstQgmx: number;        // 예측 최대 발전량
    fcstQgmn: number;        // 예측 최소 발전량
    currPwrTot?: number | null; // 현재 전력 총량 (병합 데이터)
}
```

#### `ReGenPredict`
재생에너지 발전 예측 타입:
```typescript
{
    fcstTm: string;      // 예측 시간
    fcstQgen: number;    // 예측 발전량
    fcstQgmx: number;    // 예측 최대 발전량
    fcstQgmn: number;    // 예측 최소 발전량
    essChrg: number;     // ESS 충전량
    essDisc: number;     // ESS 방전량
    essCapa: number;     // ESS 용량
}
```

#### `JejuRegion`
제주 지역 정보 타입:
```typescript
{
    name: string;                    // 지역명
    direction: 'north' | 'south' | 'east' | 'west';
    nx: number;                      // 기상청 격자 X 좌표
    ny: number;                      // 기상청 격자 Y 좌표
    lat: number;                     // 위도
    lng: number;                     // 경도
}
```

**제주 지역 목록:**
- 제주시 (nx: 53, ny: 38)
- 서귀포 (nx: 52, ny: 33)
- 성산 (nx: 60, ny: 37)
- 고산 (nx: 46, ny: 35)

#### `ServiceHealth`
서비스 헬스 상태 타입:
```typescript
'ok' | 'slow' | 'down'
```

#### `AlertItem`
알림 아이템 타입:
```typescript
{
    id: string;
    icon: 'warn' | 'bell';
    title: string;
    desc: string;
    ago: string;
}
```

## 스타일링

### 그라데이션 상수 (`constants.ts`)

각 카드 타입별 그라데이션 배경색이 정의되어 있습니다:

- `demand`: 전력 수요 카드
- `curt`: 출력제어 카드
- `weather`: 기상 정보 카드
- `operation`: 수급 운영 카드
- `demandReGen`: 전력 수요 vs 재생에너지 카드
- `solar`: 태양광 카드
- `wind`: 풍력 카드
- `hydrogen`: 수소 생산 카드
- `hydrogenForecast`: 수소 생산 예측 카드
- `jejuOperation`: 제주 운영 카드
- `systemStatus`: 시스템 상태 카드
- `forecast48h`: 48시간 예보 카드
- `mainBackground`: 메인 배경

### 그림자 색상

각 카드 타입별 그림자 색상이 정의되어 있습니다 (`SHADOW_COLORS`).

## 유틸리티 함수

### `calculations.ts`

계산 관련 유틸리티 함수들이 정의되어 있습니다.

**주요 함수:**
- `calculateRenewableRatio(demand, renewable)`: 재생에너지 비율 계산

### `utils.ts`

기타 유틸리티 함수들이 정의되어 있습니다.

**주요 함수:**
- `buildEssSeriesFromData(data)`: ESS 시계열 데이터 생성
- `topHours(data, field, count)`: 상위 시간대 추출
- `msToHealth(isOk, ms)`: 응답 시간을 헬스 상태로 변환

## 실행 방법

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
# 또는
bun dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
npm start
```

### 린트 실행

```bash
npm run lint
```

## 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하여 다음 환경 변수를 설정할 수 있습니다:

```env
NEXT_PUBLIC_API_BASE_URL=http://210.222.202.14:18080/api
```

## 주요 특징

1. **실시간 데이터 업데이트**: 5분 간격 자동 새로고침
2. **반응형 디자인**: Tailwind CSS를 사용한 반응형 레이아웃
3. **타입 안정성**: TypeScript를 통한 타입 안정성 보장
4. **성능 최적화**: React 19의 최신 기능 활용
5. **차트 시각화**: Chart.js와 Recharts를 활용한 다양한 차트
6. **지역별 정보**: 제주 지역별 상세 정보 제공

## 데이터 흐름

1. **초기 로드**: 페이지 로드 시 `useDashboardData` 훅이 모든 API를 병렬로 호출
2. **데이터 처리**: API 응답을 파싱하고 필터링/정렬하여 상태에 저장
3. **KPI 계산**: `useKPICalculations` 훅이 실시간으로 KPI 계산
4. **컴포넌트 렌더링**: 각 컴포넌트가 필요한 데이터를 props로 받아 렌더링
5. **자동 갱신**: 5분마다 자동으로 데이터 재로드 (autoRefresh가 true일 때)

## 알려진 제한사항

1. API 서버가 다운되면 전체 대시보드가 에러 상태로 표시됩니다.
2. 48시간 예보 데이터는 실패해도 대시보드 렌더링은 계속됩니다.
3. 제주 날씨 데이터는 선택된 지역에 따라 별도로 로드됩니다.

## 향후 개선 사항

- 에러 바운더리 추가
- 로딩 스켈레톤 UI
- 데이터 캐싱 최적화
- 오프라인 모드 지원
- 다크 모드 지원

