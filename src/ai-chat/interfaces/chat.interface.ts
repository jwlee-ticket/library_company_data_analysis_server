export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sqlQuery?: string;  // AI가 생성한 SQL 쿼리 (있는 경우)
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;  // 향후 사용자 연동용
}

export interface SqlAnalysis {
  isValidSql: boolean;
  query?: string;
  explanation?: string;
  confidence: number;  // 0-1 사이 신뢰도
} 