# 라이브러리컴퍼니 공연 데이터 분석 서버

## 프로젝트 개요

라이브러리컴퍼니의 공연 예술 업계(콘서트, 연극/뮤지컬) 데이터를 종합적으로 관리하고 분석하는 백엔드 서버입니다.

### 주요 목적
- 공연 매출 데이터 수집 및 분석
- 좌석 판매 현황 실시간 모니터링
- 마케팅 캘린더 및 공연 일정 관리
- 목표 매출 대비 실적 분석
- 다양한 리포트 및 대시보드 제공

## 백엔드 배포 방법

백엔드 코드를 수정하고 서버에 배포하는 전체 과정을 정리하면 다음과 같습니다:

### 1. 로컬 개발 및 푸시

```bash
# 로컬에서 코드 수정 후
git add .
git commit -m "커밋 메시지"
git push
```

### 2. 서버 접속 및 배포

```bash
# 1. 서버 접속
ssh -i /Users/tikes-seukweeo/.ssh/library_company forifwhile.xyz@35.208.29.100

# 2. 프로젝트 디렉토리로 이동
cd library_company_data_analysis_server

# 3. 최신 코드 가져오기
git pull

# 4. 기존 서비스 중지 (중요: 빌드 전 필수 작업)
docker-compose down
pm2 stop all

# 5. 빌드
npm run build

# 6. 서비스 시작
docker-compose up -d
pm2 start all
```

### 주의사항

- **4번 단계가 중요합니다**: `docker-compose down`과 `pm2 stop all`을 빌드 전에 실행하지 않으면 빌드 과정에서 서버가 다운될 수 있습니다.
- 단계를 순서대로 진행해야 안전한 배포가 가능합니다.

## 기술 스택

### Backend Framework
- **NestJS** - TypeScript 기반 Node.js 프레임워크
- **TypeORM** - TypeScript ORM
- **PostgreSQL** - 메인 데이터베이스

### Infrastructure & Deployment
- **Google Cloud Platform (GCP)** - 클라우드 호스팅
- **Docker** - 컨테이너화
- **PM2** - 프로세스 관리
- **Docker Compose** - 로컬 개발환경

### Additional Libraries
- **AdminJS** - 관리자 패널
- **Puppeteer & Selenium** - 웹 스크래핑
- **OpenAI API** - AI 기능 연동
- **Slack API** - 알림 연동
- **Schedule** - 스케줄링 작업
- **Axios** - HTTP 클라이언트
- **Multer** - 파일 업로드

## 주요 기능

### 데이터 관리
- **공연 관리**: 콘서트, 연극/뮤지컬 정보 관리
- **매출 데이터**: 티켓 판매량, 좌석별 판매 현황
- **파일 업로드**: 엑셀/CSV 데이터 업로드 및 처리
- **사용자 관리**: 접근 권한 및 사용자 계정 관리

### 분석 및 리포팅
- **실시간 대시보드**: 매출 현황 실시간 모니터링
- **목표 대비 실적**: 일별/주별/월별 목표 대비 분석
- **수익성 분석**: BEP(손익분기점) 분석
- **마케팅 분석**: 마케팅 활동 대비 매출 효과 분석

### 자동화 기능
- **스케줄링**: 정기적인 데이터 수집 및 리포트 생성
- **알림 시스템**: Slack을 통한 실시간 알림
- **데이터 동기화**: 외부 시스템과의 데이터 연동

## 시스템 포트 및 서비스

- **API 서버**: `3001` 포트
- **PostgreSQL**: `5432` 포트 (Docker 환경변수로 설정)
- **AdminJS**: NestJS 서버 내 통합 운영

## 개발 환경

- **로컬 개발**: Docker Compose 기반 PostgreSQL + NestJS
- **운영 환경**: GCP 인스턴스 + PM2 클러스터 모드
- **시간대**: Asia/Seoul (KST)

## 시스템 아키텍처

### 1. 프로젝트 전체 구조도

```mermaid
graph TD
    %% 클라이언트 및 사용자
    A[클라이언트<br/>Frontend] --> B[NestJS API 서버<br/>Port 3001]
    A1[관리자] --> A2[AdminJS<br/>관리 패널]
    A2 --> B
    
    %% API 서버 모듈들
    B --> C[데이터 관리 모듈]
    B --> D[분석 및 리포트 모듈]
    B --> E[연동 모듈]
    
    %% 데이터 관리 모듈
    C --> C1[UploadModule<br/>파일 업로드]
    C --> C2[LiveModule<br/>공연 관리]
    C --> C3[PlayModule<br/>연극 데이터]
    C --> C4[ConcertModule<br/>콘서트 데이터]
    C --> C5[UsersModule<br/>사용자 관리]
    
    %% 분석 및 리포트 모듈
    D --> D1[ReportModule<br/>리포트 생성]
    D --> D2[ViewModule<br/>데이터 뷰]
    D --> D3[TargetModule<br/>목표 관리]
    D --> D4[MarketingModule<br/>마케팅 캘린더]
    
    %% 연동 모듈
    E --> E1[SlackModule<br/>알림 연동]
    E --> E2[LocalScheduleModule<br/>스케줄링]
    E --> E3[CalendarModule<br/>캘린더]
    
    %% 데이터베이스
    C1 --> F[PostgreSQL<br/>Port 1377]
    C2 --> F
    C3 --> F
    C4 --> F
    C5 --> F
    D1 --> F
    D2 --> F
    D3 --> F
    D4 --> F
    
    %% 외부 서비스
    E1 --> G[Slack<br/>Webhook]
    B --> H[OpenAI API<br/>AI 기능]
    
    %% 파일 시스템
    C1 --> I[uploads/<br/>엑셀 파일 저장<br/>85개+ 파일]
    
    %% 데이터 플로우
    J[엑셀/CSV 업로드] --> C1
    C1 --> K[파일 파싱]
    K --> F
    F --> L[데이터베이스 뷰]
    L --> D1
    D1 --> M[리포트 API]
    
    %% 스타일링
    classDef client fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef module fill:#e8f5e8
    classDef database fill:#fff3e0
    classDef external fill:#fce4ec
    classDef files fill:#f1f8e9
    
    class A,A1,A2 client
    class B api
    class C,D,E,C1,C2,C3,C4,C5,D1,D2,D3,D4,E1,E2,E3 module
    class F database
    class G,H external
    class I,J,K,L,M files
```

### 2. 인프라 시스템 구조도

```mermaid
graph TB
    subgraph "Internet"
        U["사용자<br/>API 클라이언트"]
        DEV["개발자<br/>SSH 접속"]
    end
    
    subgraph "GCP Project"
        subgraph "Network Security"
            FW1["방화벽 규칙<br/>allow-ssh<br/>TCP: 22<br/>Source: 0.0.0.0/0"]
            FW2["방화벽 규칙<br/>allow-api<br/>TCP: 3001<br/>Source: 0.0.0.0/0"]
            FW3["내부 전용<br/>PostgreSQL<br/>TCP: 1377<br/>Local only"]
        end
        
        subgraph "us-central1-a Zone"
            VM["VM Instance<br/>instance-20250211-224503<br/>e2-micro (1GB RAM, 1 vCPU)<br/>External: 35.208.29.100<br/>Internal: 10.128.0.2<br/>Ubuntu 22.04.5 LTS"]
            
            subgraph "Runtime Environment"
                NODE["Node.js v20.18.3<br/>npm v10.8.2<br/>PM2 v5.4.3"]
                DOCKER["Docker v27.5.1<br/>Docker Compose v2.32.4"]
            end
            
            subgraph "Process Management"
                PM2["PM2 Process Manager<br/>클러스터 모드<br/>24일 무중단 운영<br/>자동 재시작 활성화"]
                
                subgraph "Application"
                    API["NestJS API 서버<br/>Port: 3001<br/>Process ID: 63357<br/>Memory: 111.4MB<br/>Heap Usage: 85.84%"]
                    ADMIN["AdminJS<br/>관리자 패널<br/>통합 운영"]
                end
                
                LOG_ROTATE["pm2-logrotate<br/>로그 자동 관리<br/>Max: 10MB<br/>Retain: 7일"]
            end
            
            subgraph "Container Services"
                POSTGRES_CONTAINER["Docker Container<br/>libraryPostgres<br/>postgres:15<br/>Port: 1377:5432<br/>3주간 안정 운영"]
                
                subgraph "Database"
                    PG_DB["PostgreSQL 15<br/>Database: libraryPostgres<br/>User: libraryPostgres<br/>Timezone: Asia/Seoul"]
                    PG_VIEWS["Database Views<br/>연극/콘서트 분석 뷰<br/>30+ 분석 뷰 운영"]
                end
            end
            
            subgraph "File System"
                UPLOADS["uploads/<br/>85개+ 엑셀 파일<br/>약 80MB<br/>최신: 158.xlsx"]
                PG_DATA["postgres-data/<br/>영속 볼륨<br/>데이터베이스 저장소"]
                BACKUP["backup_20250615_024839.sql<br/>정기 백업 파일<br/>자동 백업 스크립트"]
                LOGS["~/.pm2/logs/<br/>app-out-1.log<br/>app-error-1.log<br/>자동 로테이션"]
            end
        end
        
        subgraph "Resource Monitoring"
            DISK["디스크 사용량<br/>29GB 총 용량<br/>16GB 사용 (53%)<br/>14GB 여유공간"]
            MEMORY["메모리 사용량<br/>958MB 총 메모리<br/>494MB 사용<br/>296MB 사용가능"]
            CPU["CPU 사용률<br/>1 vCPU<br/>평균 0% (유휴)"]
        end
    end
    
    subgraph "External Services"
        SLACK["Slack<br/>Webhook API<br/>알림 서비스<br/>실시간 알림"]
        OPENAI["OpenAI API<br/>GPT Integration<br/>AI 기능 제공"]
    end
    
    subgraph "Development Workflow"
        GIT["Git Repository<br/>develop branch<br/>코드 버전 관리"]
        SSH_KEY["SSH Key<br/>/Users/tikes-seukweeo/.ssh/library_company<br/>키 기반 인증"]
    end
    
    %% Network Connections
    U --> FW2
    FW2 --> VM
    VM --> API
    
    DEV --> SSH_KEY
    SSH_KEY --> FW1
    FW1 --> VM
    
    %% Internal Services
    VM --> NODE
    VM --> DOCKER
    NODE --> PM2
    PM2 --> API
    PM2 --> LOG_ROTATE
    DOCKER --> POSTGRES_CONTAINER
    POSTGRES_CONTAINER --> PG_DB
    PG_DB --> PG_VIEWS
    
    %% File System Access
    API --> UPLOADS
    POSTGRES_CONTAINER --> PG_DATA
    PG_DB --> BACKUP
    PM2 --> LOGS
    
    %% External Service Connections
    API --> SLACK
    API --> OPENAI
    
    %% Development Workflow
    DEV --> GIT
    GIT -.-> VM
    
    %% Internal Database Connection
    API --> FW3
    FW3 --> POSTGRES_CONTAINER
    
    %% Monitoring
    VM --> DISK
    VM --> MEMORY
    VM --> CPU
    
    %% Styling
    classDef gcp fill:#4285f4,stroke:#333,stroke-width:2px,color:#fff
    classDef vm fill:#34a853,stroke:#333,stroke-width:2px,color:#fff
    classDef app fill:#ea4335,stroke:#333,stroke-width:2px,color:#fff
    classDef database fill:#0f9d58,stroke:#333,stroke-width:2px,color:#fff
    classDef security fill:#ff6b35,stroke:#333,stroke-width:2px,color:#fff
    classDef external fill:#fbbc04,stroke:#333,stroke-width:2px,color:#000
    classDef monitoring fill:#9c27b0,stroke:#333,stroke-width:2px,color:#fff
    
    class VM gcp
    class NODE,DOCKER,PM2,API,ADMIN vm
    class POSTGRES_CONTAINER,PG_DB,PG_VIEWS,BACKUP app
    class UPLOADS,PG_DATA,LOGS database
    class FW1,FW2,FW3,SSH_KEY security
    class U,DEV,SLACK,OPENAI,GIT external
    class DISK,MEMORY,CPU,LOG_ROTATE monitoring
```

### 3. 데이터베이스 ERD

```mermaid
erDiagram
    %% 핵심 엔터티
    LiveModel {
        int id PK
        string liveId UK "고유 공연 ID"
        string category "콘서트/뮤지컬"
        boolean isLive "활성 상태"
        string liveName "공연명"
        string location "장소"
        date showStartDate "공연 시작일"
        date showEndDate "공연 종료일"
        date saleStartDate "판매 시작일"
        date saleEndDate "판매 종료일"
        int runningTime "러닝타임"
        decimal targetShare "목표 점유율"
        bigint bep "손익분기점"
        int showTotalSeatNumber "총 좌석수"
        date latestRecordDate "최신 기록일"
        date createdAt
    }
    
    FileUploadModel {
        int id PK
        string fileName "파일명"
        date recordDate "기록일"
        string liveId FK "공연 ID"
        string uploadBy "업로드자"
        boolean isSavedFile "저장 여부"
        date uploadDate "업로드일"
        date deleteDate "삭제일"
    }
    
    %% 사용자 관리
    UserModel {
        int id PK
        string email UK "이메일"
        string password "비밀번호"
        string name UK "사용자명"
        int role "권한(0:마스터,1:관리자,2:일반)"
        boolean isFileUploader "파일업로드 권한"
        boolean isLiveManager "공연관리 권한"
        text[] liveNameList "접근가능 공연목록"
        boolean status "활성상태"
        date createdAt
        date updatedAt
    }
    
    %% 연극 매출 데이터
    PlayTicketSaleModel {
        int id PK
        int playUploadId FK "업로드 파일 ID"
        string liveId "공연 ID"
        date recordDate "기록일"
        date salesDate "판매일"
        bigint sales "매출액"
        int paidSeatTot "유료 총 좌석"
        int inviteSeatTot "초대 총 좌석"
    }
    
    PlayShowSaleModel {
        int id PK
        int playUploadId FK "업로드 파일 ID"
        string liveId "공연 ID"
        date recordDate "기록일"
        datetime showDateTime "공연일시"
        text[] cast "출연진"
        int paidSeatSales "유료매출"
        int paidSeatTot "유료 총 좌석"
        int paidSeatVip "유료 VIP"
        int paidSeatA "유료 A석"
        int paidSeatS "유료 S석"
        int paidSeatR "유료 R석"
        int inviteSeatTot "초대 총 좌석"
        decimal depositShare "예약금 점유율"
        decimal paidShare "완납 점유율"
        decimal freeShare "무료 점유율"
    }
    
    %% 콘서트 매출 데이터
    ConcertTicketSaleModel {
        int id PK
        int concertUploadId FK "업로드 파일 ID"
        string liveId "공연 ID"
        date recordDate "기록일"
        date salesDate "판매일"
        bigint sales "매출액"
        int paidSeatTot "유료 총 좌석"
    }
    
    ConcertSeatSaleModel {
        int id PK
        int concertUploadId FK "업로드 파일 ID"
        string liveId "공연 ID"
        date recordDate "기록일"
        datetime showDateTime "공연일시"
        int paidSeatR "유료 R석"
        int paidSeatS "유료 S석"
        int paidSeatA "유료 A석"
        int paidSeatB "유료 B석"
        int paidSeatVip "유료 VIP"
        int paidSeatTot "유료 총 좌석"
        int inviteSeatTot "초대 총 좌석"
    }
    
    %% 목표 및 계획
    DailyTargetModel {
        int id PK
        string liveId FK "공연 ID"
        date date "날짜"
        int target "목표값"
        date createdAt
    }
    
    WeeklyMarketingCalendarModel {
        int id PK
        string liveId FK "공연 ID"
        int weekNumber "주차"
        date weekStartDate "주 시작일"
        date weekEndDate "주 종료일"
        text salesMarketing "영업마케팅"
        text promotion "프로모션"
        text etc "기타사항"
        date createdAt
    }
    
    CalendarModel {
        int id PK
        date date "날짜"
        string noteSales "영업 메모"
        string noteMarketing "마케팅 메모"
        string noteOthers "기타 메모"
        date createdAt
    }
    
    MonthlyEtcModel {
        int id PK
        int year "연도"
        int month "월"
        text etc "기타사항"
        date updatedAt
    }
    
    %% 리포트 뷰 (예시)
    ViewLlmPlayDaily {
        string liveId "공연 ID"
        string liveName "공연명"
        date recordDate "기록일"
        int dailySales "일별매출"
        int paidSeatTot "유료좌석"
        decimal paidShare "완납점유율"
    }
    
    ViewConAllDaily {
        string live_id "공연 ID"
        string live_name "공연명"
        date record_date "기록일"
        int daily_sales_ticket_no "일별판매티켓수"
        bigint daily_sales_amount "일별매출액"
    }
    
    %% 관계 정의
    LiveModel ||--o{ FileUploadModel : "업로드 파일"
    LiveModel ||--o{ DailyTargetModel : "일별 목표"
    LiveModel ||--o{ WeeklyMarketingCalendarModel : "마케팅 계획"
    
    FileUploadModel ||--o{ PlayTicketSaleModel : "연극 일별 매출"
    FileUploadModel ||--o{ PlayShowSaleModel : "연극 회차별 매출"
    FileUploadModel ||--o{ ConcertTicketSaleModel : "콘서트 일별 매출"
    FileUploadModel ||--o{ ConcertSeatSaleModel : "콘서트 좌석별 매출"
    
    %% 뷰는 실제 테이블에서 데이터를 가져옴 (참조 관계)
    LiveModel ||--o{ ViewLlmPlayDaily : "연극 일별 분석"
    LiveModel ||--o{ ViewConAllDaily : "콘서트 일별 분석"
```

### 아키텍처 특징

#### 데이터 플로우
1. **파일 업로드**: 엑셀/CSV → FileUploadModel 메타데이터 저장
2. **데이터 파싱**: 매출 데이터 파싱 → 각 엔터티별 저장
3. **뷰 생성**: 복잡한 집계 쿼리를 뷰로 최적화
4. **API 제공**: ReportModule을 통한 분석 데이터 제공

#### 보안 및 권한
- **역할 기반 접근 제어**: 마스터(0), 관리자(1), 일반사용자(2)
- **공연별 권한**: 사용자별 접근 가능한 공연 리스트 관리
- **기능별 권한**: 파일 업로드, 공연 관리 권한 분리

#### 확장성 고려사항
- **모듈 분리**: 각 기능별 독립적인 모듈 구조
- **데이터베이스 뷰**: 복잡한 분석 쿼리의 성능 최적화
- **외부 연동**: Slack, OpenAI 등 확장 가능한 API 연동

## 개발 환경 설정

### 필수 소프트웨어

#### 로컬 개발환경
- **Node.js**: v20.x 이상 (운영서버: v20.18.3)
- **npm**: v10.x 이상 (운영서버: v10.8.2)
- **Docker**: 최신 버전 (운영서버: v27.5.1)
- **Docker Compose**: v2.x 이상 (운영서버: v2.32.4)

#### 개발 도구 (선택사항)
- **PostgreSQL**: 로컬 직접 설치시 (Docker 사용 권장)
- **DBeaver** 또는 **pgAdmin**: 데이터베이스 관리 도구
- **Postman**: API 테스트 도구

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음과 같이 설정하세요:

#### 데이터베이스 설정 (실제 운영 기준)
```bash
# PostgreSQL 연결 정보
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=1377                    # ⚠️ 주의: 기본 5432가 아님!
POSTGRES_USER=libraryPostgres
POSTGRES_PASSWORD=your_password       # 보안을 위해 변경하세요
POSTGRES_DB=libraryPostgres
POSTGRES_CONTAINER=libraryPostgres
```

#### 외부 서비스 연동
```bash
# OpenAI API (AI 기능용)
OPENAI_API_KEY=sk-proj-your-api-key

# Slack Webhook (알림용)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# 환경 설정
MODE=DEV                              # 로컬: DEV, 운영: PROD
TZ=Asia/Seoul
NODE_ENV=development
```

### Docker Compose 로컬 환경 구축

#### 1. PostgreSQL 컨테이너 실행

⚠️ **중요**: 운영 서버와 동일한 포트(1377) 사용을 위해 `docker-compose.yaml` 수정:

```yaml
version: '3.3'

services:
  postgres:
    image: postgres:15
    container_name: libraryPostgres
    restart: always
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    ports:
      - "1377:5432"                   # 운영과 동일한 포트
    environment:
      POSTGRES_USER: libraryPostgres
      POSTGRES_PASSWORD: libraryPostgres777
      POSTGRES_DB: libraryPostgres
      TZ: Asia/Seoul
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

#### 2. 컨테이너 실행 및 확인
```bash
# PostgreSQL 컨테이너 시작
docker-compose up -d

# 컨테이너 상태 확인 (운영과 동일한 이름)
docker ps | grep libraryPostgres

# 연결 테스트 (운영서버와 동일한 방식)
docker exec libraryPostgres pg_isready -U libraryPostgres

# 로그 확인
docker-compose logs postgres
```

#### 3. 데이터베이스 뷰 생성
```bash
# 뷰 정의 스크립트 실행 (운영과 동일)
docker exec -i libraryPostgres psql -U libraryPostgres -d libraryPostgres < view-definitions.sql
```

### 로컬 개발 서버 설정

#### TypeORM 설정 확인

운영 서버 기준 설정으로 `src/app.module.ts` 확인:

```typescript
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),           // 127.0.0.1
    port: parseInt(configService.get('POSTGRES_PORT')), // 1377
    username: configService.get('POSTGRES_USER'),       // libraryPostgres
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),         // libraryPostgres
    entities: [...],
    synchronize: process.env.NODE_ENV === 'development', // 환경별 설정
    logging: process.env.NODE_ENV === 'development',
    timezone: 'Asia/Seoul',
  }),
})
```

#### uploads 디렉토리 생성
```bash
# 파일 업로드를 위한 디렉토리 생성 (운영서버에 존재)
mkdir -p uploads
chmod 755 uploads
```

### 개발/운영 환경 분리

#### 개발 환경 (로컬)
```bash
# 로컬 개발 환경
NODE_ENV=development
MODE=DEV
POSTGRES_HOST=localhost
POSTGRES_PORT=1377
TYPEORM_SYNCHRONIZE=true
TYPEORM_LOGGING=true
```

#### 운영 환경 (GCP 실제 설정)
```bash
# 실제 운영 서버 설정
NODE_ENV=development      # ⚠️ 현재 운영서버 설정 (변경 권장)
MODE=PROD
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=1377
TYPEORM_SYNCHRONIZE=true  # ⚠️ 운영에서 false 권장
TYPEORM_LOGGING=true
```

### 실제 운영 서버 스펙 (참고용)

#### GCP 인스턴스 정보
- **인스턴스**: instance-20250211-224503
- **머신 타입**: e2-micro (1GB RAM, 1 vCPU)
- **운영체제**: Ubuntu 22.04.5 LTS
- **리전**: us-central1-a
- **디스크**: 29GB (16GB 사용 중, 53% 사용률)

#### 실행 중인 서비스
- **NestJS API**: 3001 포트, PM2로 관리
- **PostgreSQL**: 1377 포트, Docker 컨테이너
- **업타임**: 24일간 무중단 운영 (안정성 검증됨)

### 보안 고려사항

#### 로컬 개발환경
- `.env` 파일을 `.gitignore`에 추가
- 개발용 약한 패스워드 사용 가능
- 포트 1377이 다른 서비스와 충돌하지 않는지 확인

#### 운영 환경 보안 설정
- 강력한 데이터베이스 패스워드 설정
- NODE_ENV를 production으로 변경 권장
- synchronize를 false로 설정 권장
- API 키 및 Webhook URL 보안 관리

### 포트 설정 주의사항

⚠️ **중요**: 이 프로젝트는 **비표준 포트**를 사용합니다:
- **PostgreSQL**: 5432 → **1377** 사용
- **API 서버**: **3001** 사용

로컬 개발시 이 포트들이 충돌하지 않도록 주의하세요!

## 설치 및 실행

### 프로젝트 클론 및 의존성 설치

#### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd library_company_data_analysis_server
```

#### 2. 의존성 설치
```bash
# npm 사용시
npm install

# yarn 사용시
yarn install
```

#### 3. 환경 변수 설정
```bash
# 환경 변수 파일 생성
cp .env.example .env

# .env 파일 편집 (환경에 맞게 수정)
nano .env
```

### 로컬 개발 환경 실행

#### 1. 데이터베이스 실행
```bash
# Docker Compose로 PostgreSQL 실행
docker-compose up -d

# 데이터베이스 연결 확인
docker-compose logs postgres
```

#### 2. 데이터베이스 뷰 생성 (선택사항)
```bash
# 컨테이너에서 뷰 생성 스크립트 실행
docker exec -i library_company_postgres psql -U postgres -d library_company_db < view-definitions.sql
```

#### 3. NestJS 서버 실행
```bash
# 개발 모드로 서버 실행 (파일 변경 감지)
npm run start:dev

# 또는 일반 실행
npm run start

# 디버그 모드 (선택사항)
npm run start:debug
```

#### 4. 서버 접속 확인
```bash
# API 서버 접속 확인
curl http://localhost:3001

# 브라우저에서 확인
open http://localhost:3001
```

### 데이터베이스 설정

#### PostgreSQL 직접 접속
```bash
# Docker 컨테이너를 통한 접속
docker exec -it library_company_postgres psql -U postgres -d library_company_db

# 로컬 PostgreSQL 직접 접속
psql -h localhost -p 5432 -U postgres -d library_company_db
```

#### 기본 테이블 확인
```sql
-- 테이블 목록 확인
\dt

-- 특정 테이블 구조 확인
\d live_model

-- 뷰 목록 확인
\dv
```

#### 초기 데이터 설정 (선택사항)
```sql
-- 관리자 사용자 생성 예시
INSERT INTO user_model (email, password, name, role, status) 
VALUES ('admin@example.com', 'hashed_password', 'Administrator', 0, true);

-- 테스트 공연 데이터 생성 예시  
INSERT INTO live_model (liveId, liveName, category, isLive, location)
VALUES ('TEST001', '테스트 뮤지컬', '뮤지컬', true, '테스트 극장');
```

### 개발 도구 설정

#### AdminJS 관리자 패널 접속
```bash
# 서버 실행 후 브라우저에서 접속
# URL: http://localhost:3001/admin
# (구체적인 경로는 코드 확인 필요)
```

#### API 테스트
```bash
# Postman 또는 curl을 사용한 API 테스트

# 공연 목록 조회
curl -X GET http://localhost:3001/live

# 사용자 목록 조회
curl -X GET http://localhost:3001/users

# 파일 업로드 테스트
curl -X POST http://localhost:3001/upload \
  -F "file=@test-data.xlsx" \
  -F "liveId=TEST001"
```

### 빌드 및 프로덕션 준비

#### 1. 프로덕션 빌드
```bash
# TypeScript 컴파일 및 빌드
npm run build

# 빌드 결과 확인
ls -la dist/
```

#### 2. 프로덕션 실행 테스트
```bash
# 빌드된 파일로 실행
npm run start:prod

# PM2로 실행 (프로덕션 권장)
pm2 start ecosystem.config.js
```

### 트러블슈팅

#### 자주 발생하는 문제 및 해결법

**1. 데이터베이스 연결 실패**
```bash
# PostgreSQL 컨테이너 재시작
docker-compose down && docker-compose up -d

# 환경변수 확인
cat .env | grep POSTGRES

# 포트 충돌 확인
lsof -i :5432
```

**2. 포트 충돌 (3001 포트 사용 중)**
```bash
# 포트 사용 프로세스 확인
lsof -i :3001

# 프로세스 종료
kill -9 <PID>

# 다른 포트 사용 (main.ts 수정)
```

**3. 뷰 생성 실패**
```bash
# 수동으로 뷰 생성
docker exec -it library_company_postgres psql -U postgres -d library_company_db

# SQL 파일 직접 실행
\i /path/to/view-definitions.sql
```

**4. TypeORM 동기화 문제**
```bash
# 캐시 정리
rm -rf dist/
npm run build

# synchronize 옵션 확인 (app.module.ts)
# 개발환경: true, 운영환경: false
```

### 유용한 개발 명령어

```bash
# 코드 포매팅
npm run format

# 린트 검사
npm run lint

# 테스트 실행
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## 배포 정보

### 실제 GCP 운영 환경

#### 1. GCP 인스턴스 현황 (실제 운영 중)
```bash
# 인스턴스 정보
- 인스턴스명: instance-20250211-224503
- 머신 타입: e2-micro (1GB RAM, 1 vCPU)
- 운영체제: Ubuntu 22.04.5 LTS  
- 리전: us-central1-a (미국 중부)
- 디스크: 29GB SSD (16GB 사용 중, 53% 사용률)
- 외부IP: 35.208.29.100
```

#### 2. 실행 중인 서비스 현황
```bash
# 24일간 무중단 운영 중 (안정성 검증됨)
- NestJS API: 3001 포트 (PM2 클러스터 모드)
- PostgreSQL: 1377 포트 (Docker 컨테이너)
- PM2 로그 로테이션: 활성화
- 업로드 파일: 85개+ 엑셀 파일 관리 중
```

#### 3. 네트워크 설정
```bash
# 열린 포트 (실제 확인됨)
- 3001: NestJS API 서버
- 1377: PostgreSQL (외부 접근 차단)
- 22: SSH 접속
```

### PM2 프로덕션 설정 (현재 운영 중)

#### ecosystem.config.js 실제 설정
```javascript
module.exports = {
  apps: [
    {
      name: 'app',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: true,
      ignore_watch: ['node_modules', 'uploads', 'logs'],
      autorestart: true,
      max_restarts: 10,
      min_uptime: '60s',
      env: {
        NODE_ENV: 'development',  // ⚠️ 현재 설정 (production 권장)
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

#### PM2 운영 명령어
```bash
# 현재 상태 확인
pm2 list                              # 실행 중인 앱 목록
pm2 show app                          # 상세 정보 (24일 업타임)
pm2 logs app --lines 100              # 로그 확인

# 서비스 관리
pm2 restart app                       # 앱 재시작
pm2 stop app                          # 앱 중지
pm2 start ecosystem.config.js --env production

# 로그 관리 (로그 로테이션 활성화됨)
pm2 logs                              # 실시간 로그
pm2 flush                             # 로그 초기화
```

### 실제 운영 배포 프로세스

#### 현재 사용 중인 배포 절차

**1. 서버 접속**
```bash
# SSH 키 기반 접속 (실제 사용 중)
ssh -i /Users/tikes-seukweeo/.ssh/library_company forifwhile.xyz@35.208.29.100
```

**2. 안전한 배포 절차 (검증된 방법)**
```bash
# 프로젝트 디렉토리로 이동
cd library_company_data_analysis_server

# 현재 실행 중인 서비스 상태 확인
pm2 list
docker ps | grep libraryPostgres

# ⚠️ 중요: 빌드 전 서비스 중지 (서버 다운 방지)
pm2 stop app
docker-compose down

# 최신 코드 가져오기  
git pull origin develop

# 의존성 업데이트 (필요시)
npm install --production

# 프로덕션 빌드
npm run build

# 서비스 재시작
docker-compose up -d
pm2 start ecosystem.config.js

# 서비스 정상 작동 확인
pm2 list
curl -I http://localhost:3001
docker exec libraryPostgres pg_isready -U libraryPostgres
```

### 데이터베이스 운영 (실제 구성)

#### PostgreSQL 실제 설정
```bash
# 현재 운영 중인 설정
- 컨테이너명: libraryPostgres
- 이미지: postgres:15
- 포트: 1377 (외부) → 5432 (컨테이너 내부)
- 사용자: libraryPostgres
- 데이터베이스: libraryPostgres
- 데이터 볼륨: ./postgres-data (영속성 보장)
```

#### 백업 및 복구 (현재 운영 중)
```bash
# 정기 백업 (실제 백업 파일 존재: backup_20250615_024839.sql)
DATE=$(date +%Y%m%d_%H%M%S)
docker exec libraryPostgres pg_dump -U libraryPostgres libraryPostgres > backup_$DATE.sql

# 백업 복구
docker exec -i libraryPostgres psql -U libraryPostgres -d libraryPostgres < backup_file.sql

# 뷰 정의 업데이트 (운영 중 검증됨)
docker exec -i libraryPostgres psql -U libraryPostgres -d libraryPostgres < view-definitions.sql
```

### 모니터링 및 로깅 (현재 운영 상태)

#### PM2 모니터링 (실제 메트릭)
```bash
# 현재 리소스 사용량
- Used Heap Size: 56.63 MiB
- Heap Usage: 85.84%
- Event Loop Latency: 0.62ms
- HTTP Mean Latency: 1ms
- 재시작 횟수: 1회 (24일간)
```

#### 로그 관리 (실제 구성)
```bash
# PM2 로그 위치 (실제 경로)
~/.pm2/logs/app-out-1.log            # 일반 로그
~/.pm2/logs/app-error-1.log          # 에러 로그

# 로그 로테이션 설정 (현재 활성화)
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 업로드 파일 관리 (실제 운영 데이터)

#### uploads 디렉토리 현황
```bash
# 실제 운영 중인 파일들 (85개+)
- 파일 형식: Excel (.xlsx)
- 총 용량: 약 80MB
- 최신 파일: 158.xlsx (2025-07-09)
- 파일 명명: 숫자 기반 (32.xlsx ~ 158.xlsx)
```

### 보안 설정 (현재 적용 상태)

#### 네트워크 보안
```bash
# 방화벽 상태 (실제 확인)
- 22번 포트: SSH 접속만 허용
- 3001번 포트: API 서버 (외부 접근 가능)
- 1377번 포트: PostgreSQL (로컬만 접근)
- 기타 포트: 차단됨
```

#### 접근 제어
```bash
# SSH 키 기반 인증 사용
- 키 파일: /Users/tikes-seukweeo/.ssh/library_company
- 사용자: forifwhile.xyz
- 비밀번호 로그인: 비활성화
```

### 운영 최적화 권장사항

#### 현재 개선 필요 사항
```bash
# 1. 환경 설정 최적화
NODE_ENV=development → production      # 성능 향상
TYPEORM_SYNCHRONIZE=true → false      # 데이터 안전성

# 2. 메모리 최적화 (현재 1GB 제한)
- PM2 클러스터 인스턴스 수 조정
- 가비지 컬렉션 최적화 고려

# 3. 디스크 관리 (현재 53% 사용)
- 로그 로테이션 주기 점검
- 불필요한 파일 정리
```

### 문제 해결 (실제 운영 경험 기반)

#### 자주 발생하는 이슈 해결법

**1. 메모리 부족 (e2-micro 제한)**
```bash
# 메모리 사용량 확인
free -h                               # 958Mi 총 메모리
pm2 monit                            # 힙 사용량 85%+ 주의

# 해결방법
pm2 restart app                      # 메모리 해제
```

**2. 포트 충돌 (1377, 3001)**
```bash
# PostgreSQL 컨테이너 확인
docker-compose ps
docker-compose logs postgres

# 연결 테스트
docker exec -it library_company_postgres psql -U postgres -l
```