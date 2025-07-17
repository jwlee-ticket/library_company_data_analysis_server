# 📊 SQL Viewer API 상세 가이드 - 프론트엔드 개발자용

## 🏗️ 시스템 개요
라이브러리컴퍼니 데이터 분석 시스템의 SQL Viewer API 가이드입니다.
데이터베이스에서 안전하게 SELECT 쿼리를 실행하고 결과를 조회할 수 있는 기능을 제공합니다.

## 🌐 서버 정보
- **프로덕션**: `http://35.208.29.100:3001`
- **개발환경**: `http://localhost:3001`
- **Swagger 문서**: `http://localhost:3001/api-docs`

---

## 🔍 1. 테이블 목록 조회 API

### 📌 GET `/sql-execute/tables`
데이터베이스의 모든 테이블과 뷰 목록을 조회합니다.

#### 요청 데이터
없음 (GET 요청)

#### 응답 데이터
```typescript
type TableListResponse = string[]; // 테이블명 배열
```

#### 실제 응답 예시
```json
[
  "user_model",
  "live_model", 
  "play_ticket_sale_model",
  "concert_ticket_sale_model",
  "view_llm_play_daily",
  "view_con_all_overview",
  "view_play_monthly_all"
]
```

#### 사용 예시
```typescript
const fetchTables = async () => {
  const response = await fetch('/sql-execute/tables');
  const tables = await response.json();
  
  // 드롭다운 옵션으로 활용
  const tableOptions = tables.map(table => ({
    value: table,
    label: table.replace(/_/g, ' ').toUpperCase()
  }));
  
  return tableOptions;
};
```

---

## ⚡ 2. SQL 쿼리 실행 API

### 📌 POST `/sql-execute`
SQL SELECT 쿼리를 안전하게 실행합니다.

#### 요청 데이터
```typescript
interface SqlExecuteRequest {
  query: string;  // SQL SELECT 쿼리 (최대 5000자)
}
```

#### 성공 응답 데이터
```typescript
interface SqlSuccessResponse {
  success: true;
  results: any[];           // 쿼리 결과 데이터 배열
  rowCount: number;         // 반환된 행 수
  executionTime: number;    // 실행 시간 (밀리초)
}
```

#### 실패 응답 데이터
```typescript
interface SqlErrorResponse {
  success: false;
  error: string;           // 에러 메시지
  code?: string;          // 에러 코드 (선택적)
}
```

#### 성공 응답 예시
```json
{
  "success": true,
  "results": [
    {
      "id": 1,
      "email": "admin",
      "name": "admin", 
      "role": 1
    },
    {
      "id": 10,
      "email": "test",
      "name": "test",
      "role": 2
    }
  ],
  "rowCount": 2,
  "executionTime": 17
}
```

#### 실패 응답 예시
```json
{
  "success": false,
  "error": "SELECT 문만 실행 가능합니다.",
  "code": "INVALID_QUERY_TYPE"
}
```

---

## 🛡️ 보안 정책

### ✅ **허용되는 쿼리**
- **SELECT 문만 허용**: `SELECT * FROM table_name`
- **JOIN, WHERE, ORDER BY 등 조회 절 사용 가능**
- **집계 함수 사용 가능**: `COUNT()`, `SUM()`, `AVG()` 등

### ❌ **차단되는 쿼리**
- **데이터 수정**: `INSERT`, `UPDATE`, `DELETE`
- **구조 변경**: `DROP`, `CREATE`, `ALTER`, `TRUNCATE`
- **권한 관련**: `GRANT`, `REVOKE`
- **실행 관련**: `EXEC`, `EXECUTE`, `CALL`, `PROCEDURE`
- **다중 쿼리**: 세미콜론으로 구분된 여러 쿼리

### 🔒 **자동 제한사항**
- **최대 행 수**: LIMIT이 없으면 자동으로 `LIMIT 1000` 추가
- **실행 시간**: 30초 타임아웃
- **쿼리 크기**: 최대 5000자 제한

---

## 📝 사용 예시

### **1. 기본 사용자 조회**
```typescript
const basicUserQuery = {
  query: "SELECT id, email, name, role FROM user_model LIMIT 5;"
};

// 응답:
{
  "success": true,
  "results": [
    {"id": 1, "email": "admin", "name": "admin", "role": 1},
    {"id": 5, "email": "cja@librarycompany.co.kr", "name": "채진아", "role": 0}
  ],
  "rowCount": 2,
  "executionTime": 17
}
```

### **2. 복잡한 뷰 조회**
```typescript
const complexViewQuery = {
  query: `SELECT "liveName", "티켓판매일매출", "latestRecordDate" 
          FROM view_llm_play_daily 
          WHERE "티켓판매일매출" > 5000000 
          ORDER BY "티켓판매일매출" DESC 
          LIMIT 10;`
};

// 응답:
{
  "success": true,
  "results": [
    {
      "liveName": "뮤지컬〈오늘 밤, 세계에서 이 사랑이 사라진다 해도〉",
      "티켓판매일매출": 9169500,
      "latestRecordDate": "2025-07-06T15:00:00.000Z"
    }
  ],
  "rowCount": 1,
  "executionTime": 27
}
```

### **3. 집계 쿼리**
```typescript
const aggregateQuery = {
  query: `SELECT 
            COUNT(*) as total_users,
            COUNT(CASE WHEN role = 0 THEN 1 END) as masters,
            COUNT(CASE WHEN role = 1 THEN 1 END) as admins,
            COUNT(CASE WHEN role = 2 THEN 1 END) as normal_users
          FROM user_model;`
};

// 응답:
{
  "success": true,
  "results": [
    {
      "total_users": 5,
      "masters": 1,
      "admins": 2, 
      "normal_users": 2
    }
  ],
  "rowCount": 1,
  "executionTime": 12
}
```

---

## 💻 프론트엔드 구현 가이드

### **1. API 호출 헬퍼 함수**
```typescript
class SqlViewerApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'http://35.208.29.100:3001' 
      : 'http://localhost:3001';
  }

  // 테이블 목록 조회
  async getTables(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/sql-execute/tables`);
    
    if (!response.ok) {
      throw new Error('테이블 목록 조회 실패');
    }
    
    return response.json();
  }

  // SQL 쿼리 실행
  async executeQuery(query: string): Promise<SqlSuccessResponse> {
    const response = await fetch(`${this.baseUrl}/sql-execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();

    if (!result.success) {
      throw new SqlError(result.error, result.code);
    }

    return result;
  }
}

// 커스텀 에러 클래스
class SqlError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SqlError';
  }
}
```

### **2. React 컴포넌트 예시**
```typescript
import React, { useState, useEffect } from 'react';

const SqlViewer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  
  const sqlApi = new SqlViewerApi();

  // 컴포넌트 마운트 시 테이블 목록 로드
  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const tableList = await sqlApi.getTables();
      setTables(tableList);
    } catch (err) {
      console.error('테이블 목록 로드 실패:', err);
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('쿼리를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await sqlApi.executeQuery(query);
      setResults(result.results);
      console.log(`${result.rowCount}행 조회됨 (${result.executionTime}ms)`);
    } catch (err) {
      if (err instanceof SqlError) {
        setError(err.message);
      } else {
        setError('쿼리 실행 중 오류가 발생했습니다.');
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const insertTableName = (tableName: string) => {
    setQuery(prev => prev + tableName);
  };

  return (
    <div className="sql-viewer">
      {/* 테이블 목록 */}
      <div className="tables-section">
        <h3>📋 사용 가능한 테이블</h3>
        <div className="table-buttons">
          {tables.map(table => (
            <button
              key={table}
              onClick={() => insertTableName(table)}
              className="table-button"
            >
              {table}
            </button>
          ))}
        </div>
      </div>

      {/* 쿼리 입력 */}
      <div className="query-section">
        <h3>💻 SQL 쿼리</h3>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SELECT * FROM user_model LIMIT 10;"
          rows={8}
          className="query-input"
        />
        <button 
          onClick={executeQuery} 
          disabled={loading}
          className="execute-button"
        >
          {loading ? '실행 중...' : '🚀 쿼리 실행'}
        </button>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="error-section">
          <h3>❌ 오류</h3>
          <p className="error-message">{error}</p>
        </div>
      )}

      {/* 결과 표시 */}
      {results.length > 0 && (
        <div className="results-section">
          <h3>📊 쿼리 결과 ({results.length}행)</h3>
          <div className="results-table">
            <table>
              <thead>
                <tr>
                  {Object.keys(results[0]).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, idx) => (
                      <td key={idx}>
                        {typeof value === 'object' 
                          ? JSON.stringify(value) 
                          : String(value)
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
```

### **3. 유용한 쿼리 예제 제공**
```typescript
const EXAMPLE_QUERIES = [
  {
    name: '사용자 목록',
    query: 'SELECT id, email, name, role FROM user_model LIMIT 10;'
  },
  {
    name: '공연 목록', 
    query: 'SELECT "liveId", "liveName", category, "isLive" FROM live_model WHERE "isLive" = true;'
  },
  {
    name: '최근 업로드 파일',
    query: 'SELECT "fileName", "recordDate", "uploadDate" FROM file_upload_model ORDER BY "uploadDate" DESC LIMIT 10;'
  },
  {
    name: '일일 매출 집계',
    query: 'SELECT "liveName", SUM("티켓판매일매출") as total_sales FROM view_llm_play_daily GROUP BY "liveName" ORDER BY total_sales DESC;'
  }
];

// 예제 쿼리 버튼 컴포넌트
const ExampleQueries: React.FC<{ onSelectQuery: (query: string) => void }> = ({ onSelectQuery }) => (
  <div className="example-queries">
    <h3>📝 예제 쿼리</h3>
    {EXAMPLE_QUERIES.map((example, index) => (
      <button
        key={index}
        onClick={() => onSelectQuery(example.query)}
        className="example-button"
      >
        {example.name}
      </button>
    ))}
  </div>
);
```

---

## 🎨 CSS 스타일 가이드

```css
.sql-viewer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.table-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.table-button {
  padding: 6px 12px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.table-button:hover {
  background: #e0e0e0;
}

.query-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  resize: vertical;
}

.execute-button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}

.execute-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  padding: 12px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.results-table {
  overflow-x: auto;
  margin-top: 16px;
}

.results-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.results-table th,
.results-table td {
  padding: 8px 12px;
  border: 1px solid #ddd;
  text-align: left;
}

.results-table th {
  background: #f8f9fa;
  font-weight: bold;
}

.results-table tr:nth-child(even) {
  background: #f8f9fa;
}
```

---

## 🚨 에러 코드 및 처리

### **주요 에러 코드**
| **에러 코드** | **설명** | **해결 방법** |
|---|---|---|
| `INVALID_QUERY_TYPE` | SELECT 문 이외의 쿼리 | SELECT 문만 사용 |
| `DANGEROUS_KEYWORD` | 위험한 키워드 포함 | 데이터 조회 쿼리만 작성 |
| `EXECUTION_TIMEOUT` | 실행 시간 초과 (30초) | 쿼리 최적화 또는 범위 축소 |
| `SYNTAX_ERROR` | SQL 문법 오류 | 쿼리 문법 확인 |
| `OBJECT_NOT_FOUND` | 존재하지 않는 테이블/컬럼 | 테이블명과 컬럼명 확인 |
| `PERMISSION_DENIED` | 권한 없음 | 접근 가능한 테이블만 조회 |

### **에러 처리 예시**
```typescript
const handleSqlError = (error: SqlError) => {
  switch (error.code) {
    case 'INVALID_QUERY_TYPE':
      return '⚠️ SELECT 문만 사용할 수 있습니다.';
    case 'EXECUTION_TIMEOUT':
      return '⏱️ 쿼리 실행 시간이 초과되었습니다. 조건을 추가하여 범위를 줄여보세요.';
    case 'SYNTAX_ERROR':
      return '❌ SQL 문법에 오류가 있습니다. 쿼리를 다시 확인해주세요.';
    case 'OBJECT_NOT_FOUND':
      return '🔍 존재하지 않는 테이블 또는 컬럼입니다.';
    default:
      return `❌ ${error.message}`;
  }
};
```

---

## ⚠️ 주의사항

### **1. 데이터베이스 부하 방지**
- 대용량 테이블 조회 시 반드시 `LIMIT` 사용
- `JOIN` 쿼리 최소화
- 인덱스가 있는 컬럼으로 `WHERE` 조건 작성

### **2. 민감 정보 처리**
- 패스워드 등 민감한 컬럼 조회 주의
- 결과 데이터를 로그에 저장하지 않기
- 개인정보 관련 쿼리 실행 시 주의

### **3. 사용자 경험 개선**
- 쿼리 실행 중 로딩 상태 표시
- 에러 메시지를 사용자 친화적으로 변환
- 쿼리 히스토리 기능 제공 권장

### **4. 성능 최적화**
- 테이블 목록은 컴포넌트 마운트 시 1회만 로드
- 쿼리 결과가 큰 경우 가상화 테이블 사용
- 자주 사용하는 쿼리는 북마크 기능 제공

---

## 🎯 활용 시나리오

### **1. 데이터 탐색 및 분석**
```sql
-- 최근 7일간 매출 추이
SELECT DATE("recordDate") as date, SUM("티켓판매일매출") as daily_sales 
FROM view_llm_play_daily 
WHERE "recordDate" >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE("recordDate") 
ORDER BY date;
```

### **2. 관리자 대시보드 데이터**
```sql
-- 사용자 통계
SELECT 
  role,
  COUNT(*) as user_count,
  COUNT(CASE WHEN status = true THEN 1 END) as active_users
FROM user_model 
GROUP BY role 
ORDER BY role;
```

### **3. 공연 현황 모니터링**
```sql
-- 현재 진행 중인 공연 목록
SELECT "liveName", "showStartDate", "showEndDate", category
FROM live_model 
WHERE "isLive" = true 
  AND "showStartDate" <= CURRENT_DATE 
  AND "showEndDate" >= CURRENT_DATE
ORDER BY "showStartDate";
```

---

이 가이드를 참고하여 안전하고 효율적인 SQL Viewer 기능을 구현해주세요! 🚀 