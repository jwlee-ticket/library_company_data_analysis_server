# LibraryCompany Data Analysis API

## 🌐 환경별 Base URL

### Development 환경 (로컬)
```
http://localhost:3001
```

### Production 환경
```
http://35.208.29.100:3001
```

✅ **현재 외부 접근 가능**

### Next.js 환경변수 설정
```javascript
// .env.local (개발환경)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

// .env.production (운영환경)  
NEXT_PUBLIC_API_BASE_URL=http://35.208.29.100:3001
```

## 📋 API 문서
- **개발환경 Swagger**: http://localhost:3001/api-docs
- **운영환경 Swagger**: http://35.208.29.100:3001/api-docs

## 🎵 Concert API (콘서트 데이터)

### 1. 일일 매출 데이터
```http
GET /concert/daily
```
**응답 예시:**
```json
[
  {
    "liveId": "25006678",
    "liveName": "히사이시조 영화음악 콘서트_2025_서울(예술의전당)",
    "recordDate": "2025-08-30T15:00:00.000Z",
    "recordMonth": "2025-08",
    "recordWeek": "2025-08-24T15:00:00.000Z",
    "dailySalesTicketNo": 0,
    "dailySalesAmount": 0
  }
]
```

### 2. 전체 개요 (대시보드용)
```http
GET /concert/overview
```
**응답 예시:**
```json
[
  {
    "yesterdaySales": "0",
    "accumulatedSales": "29912500", 
    "weeklySales": "0",
    "dailyAvgSales": "0"
  }
]
```

### 3. BEP 분석 (손익분기점)
```http
GET /concert/bep
```
**응답 예시:**
```json
[
  {
    "liveId": "25006678",
    "liveName": "히사이시조 영화음악 콘서트_2025_서울(예술의전당)",
    "seatClass": "R",
    "totalSeats": 795,
    "soldSeats": 127,
    "remainingSeats": 668,
    "bepSeats": "556.500",
    "bepRatio": "0.700"
  }
]
```

### 4. 예상 수익
```http
GET /concert/estimated-profit
```
**응답 예시:**
```json
[
  {
    "liveName": "히사이시조 영화음악 콘서트_2025_서울(예술의전당)",
    "bep": "50000000",
    "estSales": "32911215", 
    "finalProfit": "17088785"
  }
]
```

### 5. 목표 달성률
```http
GET /concert/target-sales
```
**응답 예시:**
```json
[
  {
    "liveName": "히사이시조 영화음악 콘서트_2025_서울(예술의전당)",
    "targetSales": "50000000",
    "salesAcc": "22144000",
    "targetRatio": "0.44"
  }
]
```

### 6. 마케팅 캘린더
```http
GET /concert/marketing-calendar
```
**응답 예시:**
```json
[
  {
    "liveName": "히사이시조 영화음악 콘서트_2025_서울(예술의전당)",
    "weekStartDate": "2025-07-07T00:00:00.000Z",
    "weekEndDate": "2025-07-13T00:00:00.000Z",
    "salesMarketing": null,
    "promotion": null,
    "etc": null
  }
]