# 📋 Library AI Data Chat 요구사항명세서

## 1. 프로젝트 개요

### 1.1 목적
- SQL Viewer와 연동되는 AI 기반 SQL 쿼리 생성 채팅 시스템
- 사용자의 자연어 요구사항을 SQL문으로 자동 변환
- 직관적인 데이터 조회 경험 제공

### 1.2 범위
- 채팅 인터페이스를 통한 SQL 쿼리 생성
- 채팅 이력 관리 (저장, 조회, 수정, 삭제)
- DB 스키마 기반 컨텍스트 제공
- SQL Viewer와의 원클릭 연동

## 2. 기능 요구사항

### 2.1 핵심 기능

#### 2.1.1 AI 채팅 시스템
- **ChatGPT API 통합**
  - OpenAI API를 통한 실시간 대화
  - 스트리밍 응답 지원
  - 에러 처리 및 재시도 로직

#### 2.1.2 스키마 컨텍스트 제공
- **자동 스키마 로드**
  - 페이지 로드 시 전체 DB 스키마 정보 수집
  - 테이블 구조, 컬럼 정보, 관계 정보 포함
  - ChatGPT에게 시스템 프롬프트로 제공

#### 2.1.3 SQL 쿼리 생성
- **자연어 → SQL 변환**
  - 사용자 요구사항 분석
  - 적절한 테이블 및 컬럼 선택
  - JOIN, WHERE, GROUP BY 등 최적화된 쿼리 생성
  - 쿼리 설명 및 주석 제공

#### 2.1.4 채팅 이력 관리 (CRUD)
- **Create**: 새로운 채팅 세션 생성
- **Read**: 채팅 이력 조회 및 검색
- **Update**: 채팅 제목/태그 수정
- **Delete**: 채팅 세션 삭제

### 2.2 사용자 인터페이스

#### 2.2.1 채팅 인터페이스
- **실시간 채팅 UI**
  - 메시지 입력창 (텍스트 영역)
  - 전송 버튼 및 키보드 단축키 (Enter)
  - 사용자/AI 메시지 구분 표시
  - 타이핑 인디케이터

#### 2.2.2 SQL 코드 표시
- **SQL 하이라이팅**
  - Syntax highlighting
  - 복사 버튼
  - SQL Viewer로 직접 전송 버튼
  - 쿼리 실행 결과 미리보기

#### 2.2.3 채팅 관리
- **사이드바 또는 드롭다운**
  - 채팅 이력 목록
  - 검색 기능
  - 새 채팅 시작 버튼
  - 채팅 삭제/이름 변경

### 2.3 연동 기능

#### 2.3.1 SQL Viewer 연동
- **원클릭 쿼리 전송**
  - 생성된 SQL을 SQL Viewer로 직접 전송
  - 새 탭 또는 같은 페이지에서 실행
  - 실행 결과 피드백

## 3. 기술 요구사항

### 3.1 프론트엔드
```typescript
// 기술 스택
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (애니메이션)
- React Hooks (상태 관리)
```

### 3.2 API 통합
```typescript
// OpenAI API
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.3 데이터 저장
```typescript
// 로컬 스토리지 기반 (확장 가능)
interface StorageManager {
  saveChatSession(session: ChatSession): void;
  getChatSessions(): ChatSession[];
  updateChatSession(id: string, updates: Partial<ChatSession>): void;
  deleteChatSession(id: string): void;
}
```

## 4. 구현 단계

### 4.1 Phase 1: 기본 채팅 인터페이스
- [ ] ChatGPT API 연동
- [ ] 기본 채팅 UI 구현
- [ ] 메시지 전송/수신 기능

### 4.2 Phase 2: 스키마 통합
- [ ] DB 스키마 정보 로드
- [ ] 시스템 프롬프트 구성
- [ ] SQL 쿼리 생성 테스트

### 4.3 Phase 3: 채팅 이력 관리
- [ ] 로컬 스토리지 구현
- [ ] 채팅 세션 CRUD
- [ ] 검색 및 필터링

### 4.4 Phase 4: SQL Viewer 연동
- [ ] 쿼리 전송 기능
- [ ] UI/UX 최적화
- [ ] 에러 처리 개선

### 4.5 Phase 5: 고급 기능
- [ ] 쿼리 실행 결과 피드백
- [ ] 쿼리 최적화 제안
- [ ] 북마크 및 태그 기능

## 5. 시스템 프롬프트 예시

```typescript
const SYSTEM_PROMPT = `
당신은 Library Company의 데이터베이스 SQL 전문가입니다.

데이터베이스 스키마:
${schemaInfo}

역할:
1. 사용자의 자연어 요청을 정확한 SQL 쿼리로 변환
2. 쿼리 설명과 주의사항 제공
3. SELECT 문만 생성 (데이터 조회만 허용)
4. 최대 1000행 제한 (LIMIT 자동 추가)

응답 형식:
\`\`\`sql
-- 쿼리 설명
SELECT ...
\`\`\`

설명: 이 쿼리는 ...을 조회합니다.
`;
```

## 6. API 명세

### 6.1 OpenAI API 호출
```typescript
// POST /api/ai-chat
interface ChatRequest {
  messages: ChatMessage[];
  sessionId?: string;
}

interface ChatResponse {
  message: ChatMessage;
  sessionId: string;
}
```

### 6.2 채팅 세션 관리
```typescript
// GET /api/chat-sessions
interface GetSessionsResponse {
  sessions: ChatSession[];
}

// POST /api/chat-sessions
interface CreateSessionRequest {
  title?: string;
}

// PUT /api/chat-sessions/:id
interface UpdateSessionRequest {
  title?: string;
  messages?: ChatMessage[];
}

// DELETE /api/chat-sessions/:id
```

## 7. 보안 고려사항

### 7.1 API 키 관리
- OpenAI API 키를 환경 변수로 관리
- 클라이언트에 노출되지 않도록 서버사이드에서만 사용

### 7.2 데이터 보호
- 민감한 데이터 필터링
- 쿼리 결과 크기 제한
- 로컬 스토리지 데이터 암호화 (선택사항)

### 7.3 사용량 제한
- API 호출 횟수 제한
- 토큰 사용량 모니터링
- 타임아웃 설정

## 8. 성능 최적화

### 8.1 응답 속도
- 스트리밍 응답으로 즉시 표시
- 로딩 상태 및 진행률 표시
- 캐싱 전략 적용

### 8.2 사용자 경험
- 오프라인 모드 지원 (저장된 채팅 조회)
- 반응형 디자인
- 키보드 단축키 지원

## 9. 테스트 계획

### 9.1 단위 테스트
- ChatGPT API 통신 함수
- 스키마 파싱 로직
- 로컬 스토리지 CRUD 함수

### 9.2 통합 테스트
- 전체 채팅 플로우
- SQL Viewer 연동
- 에러 처리 시나리오

### 9.3 사용자 테스트
- 자연어 쿼리 정확도
- UI/UX 사용성
- 성능 및 안정성

## 10. 배포 및 운영

### 10.1 환경 설정
```bash
# 환경 변수
OPENAI_API_KEY=sk-...
NODE_ENV=production
```

### 10.2 모니터링
- API 호출 로그
- 에러 발생률
- 사용자 피드백 수집

---

**작성일**: 2025-07-17  
**버전**: 1.0  
**담당자**: AI Chat 개발팀 