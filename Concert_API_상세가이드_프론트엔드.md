# Concert API 상세 가이드 (프론트엔드용)

## Base URL
`http://localhost:3001/concert`

---

## 1. 📅 /concert/daily (콘서트 일일 매출 데이터)

### 용도
- 일별 티켓 판매 수량과 매출 금액 추적
- 일일 매출 트렌드 분석
- 시계열 차트 데이터 제공
- 월별/주별 그룹핑을 통한 집계 분석

### 응답 필드
```typescript
interface ConAllDaily {
  liveId: string;              // 콘서트 라이브 ID
  liveName: string;            // 콘서트명
  recordDate: Date;            // 기록 날짜 (일일 매출 집계 기준일)
  recordMonth: string;         // 기록 월 (YYYY-MM 형태)
  recordWeek: Date;            // 기록 주 시작일 (해당 날짜가 속한 주의 시작일)
  dailySalesTicketNo: number;  // 일일 판매 티켓 수량
  dailySalesAmount: number;    // 일일 매출 금액 (원)
}
```

### 프론트엔드 활용법
- 일별 매출 라인 차트: `recordDate` (x축) vs `dailySalesAmount` (y축)
- 티켓 판매량 트렌드: `dailySalesTicketNo` 추이
- 월별 필터링: `recordMonth` 활용
- 주별 집계: `recordWeek`로 그룹핑

---

## 2. 📊 /concert/overview (콘서트 전체 개요)

### 용도
- 주요 KPI 대시보드 요약
- 어제 매출, 누적 매출, 주간 매출 한눈에 보기
- 일평균 매출 성과 측정
- 메인 대시보드 요약 카드

### 응답 필드
```typescript
interface ConAllOverview {
  yesterdaySales: number;    // 어제 매출 (전일 기준 매출 금액)
  accumulatedSales: number;  // 누적 매출 (전체 기간 총 매출 금액)
  weeklySales: number;       // 주간 매출 (이번 주 매출 금액)
  dailyAvgSales: number;     // 일평균 매출 (누적 매출 / 영업일수)
}
```

### 프론트엔드 활용법
- KPI 카드 형태로 표시
- 전일 대비 성장률 계산 가능
- 목표 대비 진행률 표시
- 평균 대비 성과 비교

---

## 3. 📈 /concert/bep (콘서트 BEP 손익분기점 분석)

### 용도
- 좌석 등급별 판매 현황 상세 분석
- 손익분기점 달성률 추적
- 예상 판매량 및 수익성 예측
- 좌석별 판매 전략 수립

### 응답 필드
```typescript
interface ConBep {
  liveId: string;              // 콘서트 라이브 ID
  liveName: string;            // 콘서트명
  latestRecordDate: Date;      // 최근 기록 날짜 (가장 최신 데이터 기준일)
  salesStartDate: Date;        // 판매 시작일
  salesEndDate: Date;          // 판매 종료일
  seatClass: string;           // 좌석 등급 (A석, R석, S석, B석 등)
  seatOrder: number;           // 좌석 등급 순서 (정렬용)
  totalSeats: number;          // 총 좌석 수 (해당 등급의 전체 좌석)
  soldSeats: number;           // 판매된 좌석 수 (현재까지 판매 완료)
  remainingSeats: number;      // 남은 좌석 수 (총 좌석 - 판매 좌석)
  estAdditionalSales: number;  // 예상 추가 판매 좌석 수 (트렌드 기반 예상)
  estFinalRemaining: number;   // 최종 예상 남은 좌석 수 (남은 좌석 - 예상 추가 판매)
  bepSeats: number;            // BEP 달성 필요 좌석 수 (손익분기점 달성에 필요한 최소 판매 좌석)
  estSalesRatio: number;       // 예상 판매율 (현재 판매 + 예상 추가 판매 / 총 좌석)
  bepRatio: number;            // BEP 달성률 (현재 판매 좌석 / BEP 필요 좌석, 1.0 이상이면 BEP 달성)
}
```

### 프론트엔드 활용법
- 좌석등급별 판매 현황 테이블
- BEP 달성률 프로그레스 바: `bepRatio`
- 판매율 도넛 차트: `soldSeats / totalSeats`
- 예상 완판율 예측 차트: `estSalesRatio`
- 좌석등급별 비교 바 차트

---

## 4. 💰 /concert/estimated-profit (콘서트 예상 수익)

### 용도
- 손익분기점 대비 예상 수익 계산
- 최종 수익성 예측
- 투자 대비 수익률 분석
- 콘서트별 수익성 비교

### 응답 필드
```typescript
interface ConEstProfit {
  liveName: string;    // 콘서트명
  bep: number;         // BEP (손익분기점) - 수익이 0이 되는 매출 금액
  estSales: number;    // 예상 매출 (현재 트렌드 기반 최종 예상 매출)
  finalProfit: number; // 최종 예상 수익 (예상 매출 - BEP)
}
```

### 프론트엔드 활용법
- 수익성 순위 테이블
- BEP vs 예상매출 비교 차트
- 수익 마진율 계산: `finalProfit / estSales * 100`
- 손익분기점 달성 여부 표시
- 콘서트별 수익성 스캐터 차트

---

## 5. 🎯 /concert/target-sales (콘서트 목표 매출)

### 용도
- 목표 매출 대비 달성률 추적
- 목표 달성 진행률 모니터링
- 매출 목표 관리 및 성과 측정
- 실시간 목표 달성 현황

### 응답 필드
```typescript
interface ConTargetSales {
  liveName: string;      // 콘서트명
  targetSales: number;   // 목표 매출 (설정된 매출 목표 금액)
  salesAcc: number;      // 누적 매출 (현재까지 달성한 매출 금액)
  targetRatio: number;   // 목표 달성률 (누적 매출 / 목표 매출, 0.0~1.0)
}
```

### 프론트엔드 활용법
- 목표 달성률 프로그레스 바: `targetRatio * 100`
- 목표 vs 실적 비교 차트
- 남은 목표 금액: `targetSales - salesAcc`
- 달성률별 색상 구분 (빨강: <50%, 노랑: 50-80%, 초록: >80%)
- 콘서트별 목표 달성 순위

---

## 6. 📅 /concert/marketing-calendar (콘서트 주간 마케팅 캘린더)

### 용도
- 주간별 마케팅 활동 계획 관리
- 프로모션 일정 추적
- 마케팅 효과 분석을 위한 기준 데이터
- 팀 협업을 위한 마케팅 캘린더

### 응답 필드
```typescript
interface ConWeeklyMarketingCalendar {
  liveName: string;         // 콘서트명
  weekStartDate: Date;      // 주간 시작일 (월요일)
  weekEndDate: Date;        // 주간 종료일 (일요일)
  salesMarketing: string;   // 영업/마케팅 활동 내용 (영업팀 마케팅 계획)
  promotion: string;        // 프로모션 활동 내용 (할인, 이벤트 등)
  etc: string;              // 기타 특이사항 (공지사항, 메모 등)
}
```

### 프론트엔드 활용법
- 주간 캘린더 뷰: `weekStartDate ~ weekEndDate`
- 마케팅 활동 타임라인
- 프로모션 일정 관리
- 특이사항 알림 표시
- 콘서트별 마케팅 계획 비교

---

## 7. 📈 /concert/monthly (콘서트 월간 매출 데이터)

### 용도
- 월별 매출 트렌드 분석
- 콘서트별 월간 성과 비교
- 시즌별 매출 패턴 파악
- 월간 매출 그래프 데이터

### 응답 필드
```typescript
interface ConMonthly {
  liveId: string;             // 콘서트 라이브 ID
  liveName: string;           // 콘서트명
  recordMonth: string;        // 기록 월 (YYYY-MM 형태)
  monthlySalesAmount: number; // 월간 매출 금액 (해당 월 일일 매출 합계)
}
```

### 프론트엔드 활용법
- 월별 매출 바 차트: `recordMonth` (x축) vs `monthlySalesAmount` (y축)
- 콘서트별 월간 성과 비교 라인 차트
- 전월 대비 성장률 계산
- 시즌별 매출 패턴 히트맵
- 월간 매출 순위 테이블

---

## 8. 📊 /concert/weekly (콘서트 주간 매출 데이터)

### 용도
- 주간별 매출 및 판매량 추적
- 마케팅 활동과 매출의 상관관계 분석
- 주간 성과 모니터링
- 프로모션 효과 측정

### 응답 필드
```typescript
interface ConAllWeekly {
  liveId: string;                // 콘서트 라이브 ID
  liveName: string;              // 콘서트명
  recordWeek: Date;              // 기록 주 시작일 (해당 주의 시작일)
  weeklySalesTicketNo: number;   // 주간 판매 티켓 수량
  weeklySalesAmount: number;     // 주간 매출 금액 (원)
  noteSalesMarketing: string;    // 영업/마케팅 활동 내용
  notePromotion: string;         // 프로모션 활동 내용
  noteEtc: string;               // 기타 특이사항
}
```

### 프론트엔드 활용법
- 주간 매출 트렌드 라인 차트
- 마케팅 활동 효과 분석 (주석과 매출 연관성)
- 주간 판매량 vs 매출 스캐터 차트
- 프로모션 기간 매출 증가율 분석
- 특이사항 타임라인 표시

---

## API 조합 사용 예시

### 메인 대시보드
```typescript
const [overview, targetSales, estProfit] = await Promise.all([
  fetch('/concert/overview').then(res => res.json()),
  fetch('/concert/target-sales').then(res => res.json()),
  fetch('/concert/estimated-profit').then(res => res.json())
]);
```

### 상세 분석 페이지
```typescript
const [daily, bep, weekly] = await Promise.all([
  fetch('/concert/daily').then(res => res.json()),
  fetch('/concert/bep').then(res => res.json()),
  fetch('/concert/weekly').then(res => res.json())
]);
```

### 마케팅 분석
```typescript
const [marketing, weekly, monthly] = await Promise.all([
  fetch('/concert/marketing-calendar').then(res => res.json()),
  fetch('/concert/weekly').then(res => res.json()),
  fetch('/concert/monthly').then(res => res.json())
]);
```

## 에러 처리
```typescript
const fetchConcertData = async (endpoint: string) => {
  try {
    const response = await fetch(`/concert/${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Concert API 호출 실패 (${endpoint}):`, error);
    throw error;
  }
};
```

## 사용 권장사항

### 1. 초기 로딩 최적화
```typescript
// 필수 데이터만 먼저 로딩
const overview = await fetch('/concert/overview').then(res => res.json());
// 상세 데이터는 필요시 추가 로딩
```

### 2. 실시간 업데이트
```typescript
// 10분마다 주요 지표 업데이트
setInterval(async () => {
  const [overview, targetSales] = await Promise.all([
    fetch('/concert/overview').then(res => res.json()),
    fetch('/concert/target-sales').then(res => res.json())
  ]);
}, 10 * 60 * 1000);
```

### 3. 콘서트별 필터링
```typescript
// 특정 콘서트 데이터만 필터링
const filteredData = dailyData.filter(item => item.liveId === selectedConcertId);
```

---

**Base URL**: `http://localhost:3001/concert`  
**문서 버전**: v1.0  
**최종 업데이트**: 2025.01.15 