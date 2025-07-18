# 🤖 AI Chat API 프론트엔드 연동 가이드

## 📋 개요
Library Company 데이터 분석 시스템의 AI Chat API는 사용자의 자연어 질문을 SQL 쿼리로 변환하여 데이터베이스를 조회하는 기능을 제공합니다.

## 🌐 서버 정보
- **개발환경**: `http://localhost:3001`
- **프로덕션**: `http://35.208.29.100:3001`
- **Swagger 문서**: `http://localhost:3001/api-docs`

---

## 🔍 1. 메인 채팅 API

### 📌 POST `/ai-chat`
사용자의 자연어 질문을 AI가 SQL 쿼리로 변환하여 응답합니다.

#### 요청 데이터
```typescript
interface ChatRequest {
  message: string;           // 사용자 질문 (최대 1000자)
  sessionId?: string;        // 채팅 세션 ID (선택사항)
  previousMessages?: {       // 이전 메시지 (선택사항)
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    sqlQuery?: string;
  }[];
}
```

#### 성공 응답 데이터
```typescript
interface ChatResponse {
  success: true;
  message: {
    id: string;                // 메시지 ID
    role: 'assistant';         // 응답자
    content: string;           // AI 응답 (SQL + 설명)
    timestamp: Date;           // 응답 시간
    sqlQuery?: string;         // 추출된 SQL 쿼리
  };
  sessionId: string;           // 세션 ID
  sqlAnalysis: {
    isValidSql: boolean;       // SQL 유효성
    query?: string;            // 검증된 쿼리
    explanation: string;       // 분석 설명
    confidence: number;        // 신뢰도 (0-1)
  };
  tokensUsed?: number;         // 사용된 토큰 수
  responseTime?: number;       // 응답 시간 (ms)
}
```

#### 실제 테스트 결과 예시

**요청:**
```json
{
  "message": "최근 1주일간 매출이 가장 높은 공연 3개를 보여주세요"
}
```

**응답:**
```json
{
  "success": true,
  "message": {
    "id": "c5e71447-1542-4168-b9c0-65f420a40c5a",
    "role": "assistant",
    "content": "```sql\n-- 쿼리 설명\nSELECT liveId, SUM(sales) AS total_sales\nFROM (\n    SELECT liveId, sales\n    FROM play_ticket_sale_model\n    WHERE recordDate >= (CURRENT_DATE - INTERVAL '7 days')\n    UNION ALL\n    SELECT liveId, sales\n    FROM concert_ticket_sale_model\n    WHERE recordDate >= (CURRENT_DATE - INTERVAL '7 days')\n) AS combined_sales\nGROUP BY liveId\nORDER BY total_sales DESC \nLIMIT 3;\n```\n\n설명: 이 쿼리는 최근 일주일 동안의 콘서트와 연극의 티켓 판매 데이터를 결합한 후 그룹별로 매출을 합산합니다.",
    "timestamp": "2025-07-18T02:17:29.780Z",
    "sqlQuery": "SELECT liveId, SUM(sales) AS total_sales FROM ( SELECT liveId, sales FROM play_ticket_sale_model WHERE recordDate >= (CURRENT_DATE - INTERVAL '7 days') UNION ALL SELECT liveId, sales FROM concert_ticket_sale_model WHERE recordDate >= (CURRENT_DATE - INTERVAL '7 days') ) AS combined_sales GROUP BY liveId ORDER BY total_sales DESC LIMIT 3;"
  },
  "sessionId": "session_1752805035126_gi5m5wsfj",
  "sqlAnalysis": {
    "isValidSql": true,
    "query": "SELECT liveId, SUM(sales) AS total_sales FROM ( SELECT liveId, sales FROM play_ticket_sale_model WHERE recordDate >= (CURRENT_DATE - INTERVAL '7 days') UNION ALL SELECT liveId, sales FROM concert_ticket_sale_model WHERE recordDate >= (CURRENT_DATE - INTERVAL '7 days') ) AS combined_sales GROUP BY liveId ORDER BY total_sales DESC LIMIT 3;",
    "explanation": "유효한 SELECT 쿼리입니다.",
    "confidence": 0.9
  },
  "tokensUsed": 830,
  "responseTime": 14655
}
```

---

## ⚡ 2. SQL 실행 API

### 📌 POST `/ai-chat/execute-sql`
AI가 생성한 SQL 쿼리를 안전하게 실행합니다.

#### 요청 데이터
```typescript
interface SqlExecuteRequest {
  query: string;      // 실행할 SQL 쿼리
  sessionId: string;  // 채팅 세션 ID
  messageId: string;  // 메시지 ID
}
```

#### 응답 데이터
```typescript
interface SqlExecuteResponse {
  success: boolean;
  results?: any[];           // 쿼리 결과 데이터
  executionTime?: number;    // 실행 시간 (ms)
  rowCount?: number;         // 반환된 행 수
  error?: string;            // 에러 메시지
  code?: string;             // 에러 코드
}
```

---

## 📝 3. 세션 관리 API

### 📌 GET `/ai-chat/sessions`
저장된 채팅 세션 목록을 조회합니다.

#### 응답 데이터
```typescript
interface SessionListResponse {
  success: boolean;
  sessions: {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
    lastMessage?: string;
  }[];
}
```

### 📌 GET `/ai-chat/sessions/{sessionId}`
특정 채팅 세션의 상세 정보를 조회합니다.

### 📌 DELETE `/ai-chat/sessions/{sessionId}`
채팅 세션을 삭제합니다.

---

## 💻 프론트엔드 구현 예시

### **1. API 클라이언트 헬퍼 클래스**

```typescript
class AiChatApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'http://35.208.29.100:3001' 
      : 'http://localhost:3001';
  }

  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/ai-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async executeSql(query: string, sessionId: string, messageId: string) {
    const response = await fetch(`${this.baseUrl}/ai-chat/execute-sql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, sessionId, messageId })
    });

    return response.json();
  }

  async getSessions() {
    const response = await fetch(`${this.baseUrl}/ai-chat/sessions`);
    return response.json();
  }

  async deleteSession(sessionId: string) {
    const response = await fetch(`${this.baseUrl}/ai-chat/sessions/${sessionId}`, {
      method: 'DELETE'
    });
    return response.json();
  }
}
```

### **2. React 채팅 컴포넌트**

```typescript
import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sqlQuery?: string;
}

const AiChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sqlResults, setSqlResults] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const aiChatApi = new AiChatApi();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await aiChatApi.sendMessage(inputMessage, sessionId || undefined);
      
      if (!sessionId) {
        setSessionId(response.sessionId);
      }

      const aiMessage: Message = {
        id: response.message.id,
        role: 'assistant',
        content: response.message.content,
        timestamp: new Date(response.message.timestamp),
        sqlQuery: response.sqlAnalysis?.query
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('AI Chat 오류:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const executeSQL = async (query: string, messageId: string) => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const result = await aiChatApi.executeSql(query, sessionId, messageId);
      setSqlResults(result);
    } catch (error) {
      console.error('SQL 실행 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (message: Message) => (
    <div key={message.id} className={`message ${message.role}`}>
      <div className="message-content">
        {message.role === 'assistant' ? (
          <div>
            <div className="ai-response" dangerouslySetInnerHTML={{ 
              __html: message.content.replace(/```sql([\s\S]*?)```/g, 
                '<pre class="sql-code"><code>$1</code></pre>'
              )
            }} />
            
            {message.sqlQuery && (
              <div className="sql-actions">
                <button 
                  onClick={() => executeSQL(message.sqlQuery!, message.id)}
                  className="execute-button"
                  disabled={loading}
                >
                  🚀 SQL 실행
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(message.sqlQuery!)}
                  className="copy-button"
                >
                  📋 복사
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="user-message">{message.content}</div>
        )}
      </div>
      <div className="message-time">
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );

  return (
    <div className="ai-chat-container">
      <div className="chat-header">
        <h2>🤖 AI SQL Assistant</h2>
        {sessionId && (
          <span className="session-id">세션: {sessionId}</span>
        )}
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h3>안녕하세요! 🎭</h3>
            <p>Library Company 데이터에 대해 자연어로 질문해주세요.</p>
            <div className="example-questions">
              <h4>예시 질문:</h4>
              <ul>
                <li>"최근 일주일간 매출이 높은 공연 5개를 보여주세요"</li>
                <li>"오늘 공연 현황을 알려주세요"</li>
                <li>"사용자 수를 확인해주세요"</li>
                <li>"캐스트별 매출 통계를 보여주세요"</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map(renderMessage)}
        
        {loading && (
          <div className="loading-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            AI가 답변을 생성하고 있습니다...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {sqlResults && (
        <div className="sql-results">
          <h3>📊 SQL 실행 결과</h3>
          {sqlResults.success ? (
            <div>
              <p>✅ {sqlResults.rowCount}행, {sqlResults.executionTime}ms</p>
              <pre>{JSON.stringify(sqlResults.results, null, 2)}</pre>
            </div>
          ) : (
            <div>
              <p>❌ 오류: {sqlResults.error}</p>
            </div>
          )}
        </div>
      )}

      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="데이터에 대해 질문해주세요..."
            disabled={loading}
            className="message-input"
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !inputMessage.trim()}
            className="send-button"
          >
            {loading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChatComponent;
```

### **3. CSS 스타일링**

```css
.ai-chat-container {
  max-width: 800px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-id {
  font-size: 12px;
  opacity: 0.8;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
}

.welcome-message {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.example-questions {
  text-align: left;
  margin-top: 20px;
}

.example-questions ul {
  list-style: none;
  padding: 0;
}

.example-questions li {
  background: #e3f2fd;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.message {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  max-width: 85%;
}

.message.user {
  background: #e3f2fd;
  margin-left: auto;
  text-align: right;
}

.message.assistant {
  background: white;
  border: 1px solid #e0e0e0;
}

.sql-code {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 12px 0;
  font-family: 'Monaco', 'Consolas', monospace;
}

.sql-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.execute-button, .copy-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.execute-button {
  background: #4caf50;
  color: white;
}

.execute-button:hover {
  background: #45a049;
}

.copy-button {
  background: #2196f3;
  color: white;
}

.copy-button:hover {
  background: #1976d2;
}

.loading-message {
  text-align: center;
  color: #666;
  font-style: italic;
}

.typing-indicator {
  display: inline-block;
  margin-right: 8px;
}

.typing-indicator span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #007bff;
  margin: 0 2px;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.sql-results {
  background: #f8f9fa;
  border-top: 1px solid #ddd;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.sql-results pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}

.input-container {
  border-top: 1px solid #ddd;
  padding: 16px;
  background: white;
}

.input-wrapper {
  display: flex;
  gap: 8px;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.message-input:focus {
  outline: none;
  border-color: #007bff;
}

.send-button {
  padding: 12px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.message-time {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
}
```

---

## 🎯 사용 시나리오

### **1. 기본 데이터 조회**
- "사용자 수를 알려주세요"
- "현재 진행 중인 공연 목록을 보여주세요"
- "오늘 공연 현황을 확인해주세요"

### **2. 복잡한 분석 쿼리**
- "최근 1주일간 매출이 가장 높은 공연 3개를 보여주세요"
- "캐스트별 매출 통계를 보여주세요"
- "월별 매출 추이를 분석해주세요"

### **3. 날짜 기반 필터링**
- "어제 티켓 판매 현황을 알려주세요"
- "이번 달 신규 등록된 공연을 보여주세요"
- "지난주 대비 이번주 매출 변화를 분석해주세요"

---

## ⚠️ 주의사항

### **보안**
- AI는 **SELECT 문만** 생성합니다
- **위험한 키워드** (DROP, DELETE, UPDATE 등) 차단
- 모든 쿼리에 **자동 LIMIT 1000** 적용

### **성능**
- **응답 시간**: 평균 5-15초
- **토큰 사용량**: 쿼리당 500-1000 토큰
- **동시 연결**: 세션별 독립 처리

### **에러 처리**
```typescript
// API 에러 처리 예시
try {
  const response = await aiChatApi.sendMessage(message);
  // 성공 처리
} catch (error) {
  if (error.message.includes('timeout')) {
    // 타임아웃 처리
  } else if (error.message.includes('invalid')) {
    // 유효하지 않은 요청 처리
  } else {
    // 일반 오류 처리
  }
}
```

---

## 🚀 고급 기능

### **1. 메시지 히스토리 활용**
```typescript
// 이전 대화 컨텍스트 유지
const previousMessages = messages.slice(-5); // 최근 5개 메시지
const response = await aiChatApi.sendMessage(newMessage, sessionId, previousMessages);
```

### **2. SQL 결과 시각화**
```typescript
// 차트 라이브러리와 연동
const chartData = sqlResults.results.map(row => ({
  x: row.date,
  y: row.sales
}));
```

### **3. 북마크 기능**
```typescript
// 유용한 쿼리 저장
const bookmarks = [
  { name: "일간 매출", query: "SELECT ...", sessionId: "..." },
  { name: "공연 현황", query: "SELECT ...", sessionId: "..." }
];
```

---

이 가이드를 통해 **완전한 AI Chat 기능**을 프론트엔드에 연동할 수 있습니다! 🎉 