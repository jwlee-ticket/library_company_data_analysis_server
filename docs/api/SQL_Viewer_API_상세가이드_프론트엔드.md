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

## 🏗️ 2. 전체 스키마 정보 조회 API

### 📌 GET `/sql-execute/schema`
모든 테이블의 컬럼 정보와 제약조건을 한 번에 조회합니다.

#### 요청 데이터
없음 (GET 요청)

#### 응답 데이터
```typescript
interface TableSchema {
  tableName: string;
  columns: {
    column_name: string;
    data_type: string;
    is_nullable: string;        // "YES" | "NO" 
    column_default: string | null;
    key_type: string | null;    // "PK" | "FK" | null
    references_table: string | null;
    references_column: string | null;
  }[];
}

type SchemaResponse = TableSchema[];
```

#### 실제 응답 예시
```json
[
  {
    "tableName": "user_model",
    "columns": [
      {
        "column_name": "id",
        "data_type": "integer", 
        "is_nullable": "NO",
        "column_default": "nextval('user_model_id_seq'::regclass)",
        "key_type": "PK",
        "references_table": null,
        "references_column": null
      },
      {
        "column_name": "email",
        "data_type": "character varying",
        "is_nullable": "NO", 
        "column_default": null,
        "key_type": null,
        "references_table": null,
        "references_column": null
      }
    ]
  }
]
```

#### 사용 예시
```typescript
const fetchSchema = async () => {
  const response = await fetch('/sql-execute/schema');
  const schema = await response.json();
  
  // 테이블별 컬럼 맵 생성
  const tableColumnsMap = new Map();
  schema.forEach(table => {
    tableColumnsMap.set(table.tableName, table.columns);
  });
  
  return tableColumnsMap;
};
```

---

## 🔗 3. 특정 테이블 상세 정보 조회 API

### 📌 GET `/sql-execute/table/{tableName}`
지정된 테이블의 상세한 컬럼 정보와 제약조건을 조회합니다.

#### 요청 데이터
- **Path Parameter**: `tableName` (string) - 조회할 테이블명

#### 응답 데이터
```typescript
interface TableDetailResponse {
  tableName: string;
  columns: {
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
    character_maximum_length: number | null;
    numeric_precision: number | null;
    numeric_scale: number | null;
  }[];
  constraints: {
    constraint_name: string;
    constraint_type: string;      // "PRIMARY KEY" | "FOREIGN KEY" | "UNIQUE"
    column_name: string;
    foreign_table_name: string | null;
    foreign_column_name: string | null;
  }[];
}
```

#### 실제 응답 예시 (user_model)
```json
{
  "tableName": "user_model",
  "columns": [
    {
      "column_name": "id",
      "data_type": "integer",
      "is_nullable": "NO", 
      "column_default": "nextval('user_model_id_seq'::regclass)",
      "character_maximum_length": null,
      "numeric_precision": 32,
      "numeric_scale": 0
    },
    {
      "column_name": "email",
      "data_type": "character varying",
      "is_nullable": "NO",
      "column_default": null,
      "character_maximum_length": null,
      "numeric_precision": null,
      "numeric_scale": null
    }
  ],
  "constraints": [
    {
      "constraint_name": "PK_7d6bfa71f4d6a1fa0af1f688327", 
      "constraint_type": "PRIMARY KEY",
      "column_name": "id",
      "foreign_table_name": null,
      "foreign_column_name": null
    },
    {
      "constraint_name": "UQ_864bd044bba869304084843358e",
      "constraint_type": "UNIQUE",
      "column_name": "email", 
      "foreign_table_name": null,
      "foreign_column_name": null
    }
  ]
}
```

#### 사용 예시
```typescript
const fetchTableDetail = async (tableName: string) => {
  const response = await fetch(`/sql-execute/table/${tableName}`);
  const tableDetail = await response.json();
  
  // Primary Key 찾기
  const primaryKey = tableDetail.constraints.find(
    c => c.constraint_type === 'PRIMARY KEY'
  )?.column_name;
  
  // Foreign Key 관계 찾기
  const foreignKeys = tableDetail.constraints.filter(
    c => c.constraint_type === 'FOREIGN KEY'
  );
  
  return { tableDetail, primaryKey, foreignKeys };
};
```

---

## 🔗 4. 테이블 관계 정보 조회 API

### 📌 GET `/sql-execute/relationships`
모든 Foreign Key 관계 정보를 조회하여 ERD 생성에 활용할 수 있습니다.

#### 요청 데이터
없음 (GET 요청)

#### 응답 데이터
```typescript
interface RelationshipResponse {
  source_table: string;       // 참조하는 테이블
  source_column: string;      // 참조하는 컬럼
  target_table: string;       // 참조되는 테이블
  target_column: string;      // 참조되는 컬럼
  constraint_name: string;    // 제약조건명
}

type RelationshipsResponse = RelationshipResponse[];
```

#### 실제 응답 예시
```json
[
  {
    "source_table": "file_upload_model",
    "source_column": "liveId", 
    "target_table": "live_model",
    "target_column": "liveId",
    "constraint_name": "FK_36179e869943778c12134acd6c8"
  },
  {
    "source_table": "play_ticket_sale_model",
    "source_column": "playUploadId",
    "target_table": "file_upload_model", 
    "target_column": "id",
    "constraint_name": "FK_c0f30cc914ad13e656435fe81e2"
  }
]
```

#### 사용 예시
```typescript
const fetchRelationships = async () => {
  const response = await fetch('/sql-execute/relationships');
  const relationships = await response.json();
  
  // 테이블별 관계 맵 생성
  const relationMap = new Map();
  relationships.forEach(rel => {
    if (!relationMap.has(rel.source_table)) {
      relationMap.set(rel.source_table, []);
    }
    relationMap.get(rel.source_table).push({
      targetTable: rel.target_table,
      sourceColumn: rel.source_column,
      targetColumn: rel.target_column
    });
  });
  
  return relationMap;
};
```

---

## ⚡ 5. SQL 쿼리 실행 API

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

## 💻 프론트엔드 구현 가이드

### **1. 확장된 API 호출 헬퍼 함수**
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
    if (!response.ok) throw new Error('테이블 목록 조회 실패');
    return response.json();
  }

  // 🆕 전체 스키마 정보 조회
  async getSchema(): Promise<TableSchema[]> {
    const response = await fetch(`${this.baseUrl}/sql-execute/schema`);
    if (!response.ok) throw new Error('스키마 정보 조회 실패');
    return response.json();
  }

  // 🆕 특정 테이블 상세 정보 조회
  async getTableDetail(tableName: string): Promise<TableDetailResponse> {
    const response = await fetch(`${this.baseUrl}/sql-execute/table/${tableName}`);
    if (!response.ok) throw new Error(`테이블 ${tableName} 정보 조회 실패`);
    return response.json();
  }

  // 🆕 테이블 관계 정보 조회
  async getRelationships(): Promise<RelationshipResponse[]> {
    const response = await fetch(`${this.baseUrl}/sql-execute/relationships`);
    if (!response.ok) throw new Error('테이블 관계 정보 조회 실패');
    return response.json();
  }

  // SQL 쿼리 실행
  async executeQuery(query: string): Promise<SqlSuccessResponse> {
    const response = await fetch(`${this.baseUrl}/sql-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    if (!result.success) {
      throw new SqlError(result.error, result.code);
    }
    return result;
  }
}
```

### **2. 스키마 브라우저 컴포넌트**
```typescript
import React, { useState, useEffect } from 'react';

const SchemaViewer: React.FC<{ onSelectTable: (tableName: string) => void }> = ({ onSelectTable }) => {
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableDetail, setTableDetail] = useState<TableDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  
  const sqlApi = new SqlViewerApi();

  useEffect(() => {
    loadSchema();
  }, []);

  const loadSchema = async () => {
    try {
      const schemaData = await sqlApi.getSchema();
      setSchema(schemaData);
    } catch (error) {
      console.error('스키마 로드 실패:', error);
    }
  };

  const handleTableClick = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoading(true);
    
    try {
      const detail = await sqlApi.getTableDetail(tableName);
      setTableDetail(detail);
      onSelectTable(tableName);
    } catch (error) {
      console.error('테이블 상세 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColumnTypeIcon = (dataType: string) => {
    if (dataType.includes('integer')) return '🔢';
    if (dataType.includes('character') || dataType.includes('text')) return '📝';
    if (dataType.includes('boolean')) return '☑️';
    if (dataType.includes('timestamp') || dataType.includes('date')) return '📅';
    if (dataType.includes('ARRAY')) return '📋';
    return '❓';
  };

  return (
    <div className="schema-viewer">
      <div className="tables-list">
        <h3>📋 테이블 목록 ({schema.length}개)</h3>
        <div className="table-grid">
          {schema.map(table => (
            <div
              key={table.tableName}
              className={`table-card ${selectedTable === table.tableName ? 'selected' : ''}`}
              onClick={() => handleTableClick(table.tableName)}
            >
              <div className="table-name">{table.tableName}</div>
              <div className="column-count">{table.columns.length} 컬럼</div>
            </div>
          ))}
        </div>
      </div>

      {selectedTable && (
        <div className="table-detail">
          <h3>🏗️ {selectedTable} 구조</h3>
          {loading ? (
            <div>로딩 중...</div>
          ) : tableDetail ? (
            <div>
              <div className="columns-list">
                <h4>📊 컬럼 정보</h4>
                <table className="columns-table">
                  <thead>
                    <tr>
                      <th>컬럼명</th>
                      <th>타입</th>
                      <th>NULL</th>
                      <th>기본값</th>
                      <th>제약</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableDetail.columns.map(column => {
                      const constraint = tableDetail.constraints.find(
                        c => c.column_name === column.column_name
                      );
                      return (
                        <tr key={column.column_name}>
                          <td>
                            {getColumnTypeIcon(column.data_type)} {column.column_name}
                          </td>
                          <td>{column.data_type}</td>
                          <td>{column.is_nullable === 'YES' ? '✅' : '❌'}</td>
                          <td>{column.column_default || '-'}</td>
                          <td>{constraint?.constraint_type || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {tableDetail.constraints.length > 0 && (
                <div className="constraints-list">
                  <h4>🔗 제약조건</h4>
                  <ul>
                    {tableDetail.constraints.map(constraint => (
                      <li key={constraint.constraint_name}>
                        <strong>{constraint.constraint_type}</strong>: {constraint.column_name}
                        {constraint.foreign_table_name && (
                          <span> → {constraint.foreign_table_name}.{constraint.foreign_column_name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
```

### **3. SQL 자동완성 기능**
```typescript
const SqlAutoComplete: React.FC<{
  query: string;
  onQueryChange: (query: string) => void;
}> = ({ query, onQueryChange }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const sqlApi = new SqlViewerApi();

  useEffect(() => {
    sqlApi.getSchema().then(setSchema);
  }, []);

  const generateSuggestions = (currentQuery: string) => {
    const words = currentQuery.toLowerCase().split(/\s+/);
    const lastWord = words[words.length - 1];

    const suggestions: string[] = [];

    // FROM 다음에 테이블명 제안
    if (words.includes('from') && !words.includes('where')) {
      const tableNames = schema.map(t => t.tableName);
      suggestions.push(...tableNames.filter(name => 
        name.toLowerCase().includes(lastWord)
      ));
    }

    // SELECT 다음에 컬럼명 제안
    if (words.includes('select') && !words.includes('from')) {
      schema.forEach(table => {
        table.columns.forEach(col => {
          if (col.column_name.toLowerCase().includes(lastWord)) {
            suggestions.push(col.column_name);
          }
        });
      });
    }

    return suggestions.slice(0, 10); // 최대 10개
  };

  const handleQueryChange = (newQuery: string) => {
    onQueryChange(newQuery);
    
    if (newQuery.trim()) {
      const newSuggestions = generateSuggestions(newQuery);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    const words = query.split(/\s+/);
    words[words.length - 1] = suggestion;
    onQueryChange(words.join(' ') + ' ');
    setShowSuggestions(false);
  };

  return (
    <div className="sql-autocomplete">
      <textarea
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        placeholder="SELECT * FROM user_model LIMIT 10;"
        className="sql-input"
      />
      
      {showSuggestions && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => applySuggestion(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### **4. ERD 시각화 컴포넌트**
```typescript
const ErdViewer: React.FC = () => {
  const [relationships, setRelationships] = useState<RelationshipResponse[]>([]);
  const [schema, setSchema] = useState<TableSchema[]>([]);

  const sqlApi = new SqlViewerApi();

  useEffect(() => {
    Promise.all([
      sqlApi.getRelationships(),
      sqlApi.getSchema()
    ]).then(([rels, schemaData]) => {
      setRelationships(rels);
      setSchema(schemaData);
    });
  }, []);

  const generateErdData = () => {
    // Mermaid ERD 문법 생성
    let mermaid = 'erDiagram\n';
    
    schema.forEach(table => {
      mermaid += `  ${table.tableName} {\n`;
      table.columns.forEach(col => {
        const type = col.data_type.replace(/\s+/g, '_');
        const key = col.key_type ? ` ${col.key_type}` : '';
        mermaid += `    ${type} ${col.column_name}${key}\n`;
      });
      mermaid += '  }\n';
    });

    relationships.forEach(rel => {
      mermaid += `  ${rel.target_table} ||--o{ ${rel.source_table} : "has"\n`;
    });

    return mermaid;
  };

  return (
    <div className="erd-viewer">
      <h3>🗺️ 데이터베이스 ERD</h3>
      <div className="relationship-summary">
        <p>📊 {schema.length}개 테이블, {relationships.length}개 관계</p>
      </div>
      
      <div className="relationships-list">
        <h4>🔗 테이블 관계</h4>
        {relationships.map((rel, index) => (
          <div key={index} className="relationship-item">
            <span className="source">{rel.source_table}</span>
            <span className="arrow">→</span>
            <span className="target">{rel.target_table}</span>
            <span className="columns">
              ({rel.source_column} → {rel.target_column})
            </span>
          </div>
        ))}
      </div>

      {/* Mermaid 다이어그램 렌더링 영역 */}
      <div className="mermaid-diagram">
        <pre>{generateErdData()}</pre>
      </div>
    </div>
  );
};
```

---

## 🎨 확장된 CSS 스타일

```css
/* 스키마 뷰어 스타일 */
.schema-viewer {
  display: flex;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.tables-list {
  flex: 1;
  min-width: 300px;
}

.table-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.table-card {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.table-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0,123,255,0.1);
}

.table-card.selected {
  border-color: #007bff;
  background: #f8f9ff;
}

.table-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.column-count {
  font-size: 12px;
  color: #666;
}

.table-detail {
  flex: 2;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.columns-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: white;
  border-radius: 6px;
  overflow: hidden;
}

.columns-table th,
.columns-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.columns-table th {
  background: #f1f3f4;
  font-weight: 600;
}

.constraints-list {
  margin-top: 20px;
}

.constraints-list ul {
  list-style: none;
  padding: 0;
}

.constraints-list li {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 4px;
}

/* 자동완성 스타일 */
.sql-autocomplete {
  position: relative;
}

.sql-input {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  resize: vertical;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:hover {
  background: #f8f9fa;
}

/* ERD 뷰어 스타일 */
.erd-viewer {
  padding: 20px;
}

.relationship-summary {
  padding: 12px;
  background: #e3f2fd;
  border-radius: 6px;
  margin-bottom: 20px;
}

.relationships-list {
  margin-bottom: 20px;
}

.relationship-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 4px;
}

.source, .target {
  font-weight: 600;
  color: #333;
}

.arrow {
  color: #007bff;
  font-weight: bold;
}

.columns {
  font-size: 12px;
  color: #666;
}

.mermaid-diagram {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  overflow-x: auto;
}

.mermaid-diagram pre {
  margin: 0;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
}
```

---

## 🎯 확장된 활용 시나리오

### **1. 스키마 기반 쿼리 작성**
```typescript
// 테이블 구조를 알고 적절한 JOIN 쿼리 작성
const smartJoinQuery = `
SELECT 
  u.name as user_name,
  l."liveName" as live_name,
  f."fileName" as uploaded_file
FROM user_model u
JOIN live_model l ON u."liveNameList" @> ARRAY[l."liveName"]
JOIN file_upload_model f ON l."liveId" = f."liveId"
WHERE u.role <= 1
LIMIT 20;
`;
```

### **2. 데이터 타입별 쿼리 최적화**
```typescript
// 날짜 타입 컬럼 활용
const dateRangeQuery = `
SELECT 
  "liveName",
  COUNT(*) as upload_count,
  MIN("recordDate") as first_upload,
  MAX("recordDate") as last_upload
FROM file_upload_model f
JOIN live_model l ON f."liveId" = l."liveId"
WHERE f."recordDate" >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY "liveName"
ORDER BY upload_count DESC;
`;
```

### **3. 관계 기반 복합 쿼리**
```typescript
// FK 관계를 활용한 데이터 추적
const relationshipQuery = `
SELECT 
  l."liveName",
  f."fileName",
  pts.sales as ticket_sales,
  pss."paidSeatTot" as seats_sold
FROM live_model l
JOIN file_upload_model f ON l."liveId" = f."liveId"
JOIN play_ticket_sale_model pts ON f.id = pts."playUploadId"
JOIN play_show_sale_model pss ON f.id = pss."playUploadId"
WHERE l."isLive" = true
  AND pts."salesDate" = pss."showDateTime"::date
LIMIT 50;
`;
```

---

## 📈 성능 최적화 가이드

### **1. 스키마 정보 캐싱**
```typescript
class SchemaCache {
  private static cache = new Map<string, any>();
  private static lastUpdated = new Map<string, number>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5분

  static async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const lastUpdate = this.lastUpdated.get(key) || 0;
    
    if (this.cache.has(key) && (now - lastUpdate) < this.CACHE_DURATION) {
      return this.cache.get(key);
    }
    
    const data = await fetcher();
    this.cache.set(key, data);
    this.lastUpdated.set(key, now);
    return data;
  }
}

// 사용법
const getSchema = () => SchemaCache.get('schema', () => sqlApi.getSchema());
```

### **2. 점진적 스키마 로딩**
```typescript
const useSchemaLoader = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [loadedTables, setLoadedTables] = useState<Set<string>>(new Set());
  const [tableDetails, setTableDetails] = useState<Map<string, any>>(new Map());

  // 1단계: 테이블 목록만 먼저 로드
  useEffect(() => {
    sqlApi.getTables().then(setTables);
  }, []);

  // 2단계: 필요할 때만 상세 정보 로드
  const loadTableDetail = async (tableName: string) => {
    if (loadedTables.has(tableName)) return;
    
    const detail = await sqlApi.getTableDetail(tableName);
    setTableDetails(prev => new Map(prev).set(tableName, detail));
    setLoadedTables(prev => new Set(prev).add(tableName));
  };

  return { tables, tableDetails, loadTableDetail };
};
```

---

이제 프론트엔드에서 **완벽한 데이터베이스 스키마 정보**를 활용하여 **지능적인 SQL Viewer**를 구현할 수 있습니다! 🚀

- ✅ **46개 테이블** 구조 정보
- ✅ **컬럼 타입 및 제약조건** 
- ✅ **테이블 관계 (ERD)** 정보
- ✅ **SQL 자동완성** 기능
- ✅ **스키마 브라우저** UI 