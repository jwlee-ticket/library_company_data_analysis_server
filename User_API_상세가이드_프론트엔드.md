# 📋 User API 상세 가이드 - 프론트엔드 개발자용

## 🏗️ 시스템 개요
라이브러리컴퍼니 데이터 분석 시스템의 User API 가이드입니다.
사용자 계정 관리, 로그인/로그아웃, 권한 관리 기능을 제공합니다.

## 🌐 서버 정보
- **프로덕션**: `http://35.208.29.100:3001`
- **개발환경**: `http://localhost:3001`
- **Base URL**: `/api/users`

---

## 🔐 1. 로그인 API

### 📌 POST `/api/users/login`
사용자 로그인을 처리합니다.

#### 요청 데이터
```typescript
interface LoginRequest {
  email: string;     // 사용자 이메일
  password: string;  // 비밀번호
}
```

#### 응답 데이터
```typescript
// 성공 시
interface LoginSuccessResponse {
  code: 200;
  message: "Login success";
  userId: number;              // 사용자 ID
  name: string;               // 사용자 이름
  role: number;               // 권한 레벨 (0: 마스터, 1: 관리자, 2: 일반사용자)
  isFileUploader: boolean;    // 파일 업로드 권한
  isLiveManager: boolean;     // 라이브 관리 권한
  liveNameList: string[];     // 관리 가능한 라이브 목록
}

// 실패 시
interface LoginFailResponse {
  code: 400;
  message: "Invalid email or password";
}
```

#### 사용 예시
```typescript
const loginUser = async (email: string, password: string) => {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.code === 200) {
    // 로그인 성공 - 사용자 정보 저장
    localStorage.setItem('userInfo', JSON.stringify(data));
    // 메인 페이지로 이동
  } else {
    // 로그인 실패 처리
    alert(data.message);
  }
};
```

---

## 👥 2. 계정 생성 API

### 📌 POST `/api/users/create-account`
새로운 사용자 계정을 생성합니다.

#### 요청 데이터
```typescript
interface CreateAccountRequest {
  email: string;    // 고유한 이메일 주소
  password: string; // 비밀번호
  name: string;     // 고유한 사용자 이름
}
```

#### 응답 데이터
```typescript
interface CreateAccountResponse {
  id: number;
  email: string;
  password: string;
  name: string;
  role: number;              // 기본값: 2 (일반사용자)
  isFileUploader: boolean;   // 기본값: false
  isLiveManager: boolean;    // 기본값: false
  liveNameList: string[];    // 기본값: null
  status: boolean;           // 기본값: false (비활성화)
  updatedAt: Date;
  createdAt: Date;
}
```

#### 사용 예시
```typescript
const createAccount = async (userData: CreateAccountRequest) => {
  try {
    const response = await fetch('/api/users/create-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const newUser = await response.json();
    console.log('계정 생성 완료:', newUser);
  } catch (error) {
    console.error('계정 생성 실패:', error);
  }
};
```

---

## 📊 3. 사용자 목록 조회 API

### 📌 GET `/api/users/get-users`
모든 사용자 목록을 조회합니다. (관리자 권한 필요)

#### 요청 데이터
없음 (GET 요청)

#### 응답 데이터
```typescript
interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: number;              // 0: 마스터, 1: 관리자, 2: 일반사용자
  isFileUploader: boolean;   // 파일 업로드 권한
  isLiveManager: boolean;    // 라이브 관리 권한
  liveNameList: string[];    // 관리 가능한 라이브 목록
  status: boolean;           // 계정 활성화 상태
  updatedAt: Date;
  createdAt: Date;
}

type GetUsersResponse = User[];
```

#### 사용 예시
```typescript
const fetchUsers = async () => {
  const response = await fetch('/api/users/get-users');
  const users = await response.json();
  
  // 권한별로 필터링
  const admins = users.filter(user => user.role <= 1);
  const normalUsers = users.filter(user => user.role === 2);
  
  return { admins, normalUsers };
};
```

---

## 🎭 4. 라이브 목록 조회 API

### 📌 GET `/api/users/get-live-list`
현재 활성화된 라이브 공연 목록을 조회합니다.

#### 요청 데이터
없음 (GET 요청)

#### 응답 데이터
```typescript
type GetLiveListResponse = string[]; // 라이브 공연 이름 배열
```

#### 사용 예시
```typescript
const fetchLiveList = async () => {
  const response = await fetch('/api/users/get-live-list');
  const liveNames = await response.json();
  
  // 드롭다운 옵션으로 사용
  return liveNames.map(name => ({
    value: name,
    label: name
  }));
};
```

---

## ✏️ 5. 사용자 정보 수정 API

### 📌 POST `/api/users/edit-user`
사용자 정보를 수정합니다. (관리자 권한 필요)

#### 요청 데이터
```typescript
interface EditUserRequest {
  id: number;                // 수정할 사용자 ID
  name: string;              // 사용자 이름
  email: string;             // 이메일
  role: number;              // 권한 레벨
  password: string;          // 비밀번호
  status: boolean;           // 계정 활성화 상태
  isFileUploader: boolean;   // 파일 업로드 권한
  isLiveManager: boolean;    // 라이브 관리 권한
  liveNameList: string[];    // 관리 가능한 라이브 목록
}
```

#### 응답 데이터
```typescript
// 성공 시
interface EditUserSuccessResponse {
  code: 200;
  message: "User updated";
}

// 실패 시
interface EditUserFailResponse {
  code: 400;
  message: "User not found";
}
```

#### 특별 규칙
- **role이 0 또는 1인 경우**: 자동으로 모든 권한 부여
  - `isFileUploader = true`
  - `isLiveManager = true`
  - `status = true`
  - `liveNameList = ['전체']`

#### 사용 예시
```typescript
const editUser = async (userData: EditUserRequest) => {
  const response = await fetch('/api/users/edit-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  
  const result = await response.json();
  
  if (result.code === 200) {
    alert('사용자 정보가 수정되었습니다.');
  } else {
    alert(result.message);
  }
};
```

---

## 🗑️ 6. 사용자 삭제 API

### 📌 GET `/api/users/delete-user?id={userId}`
사용자를 삭제합니다. (관리자 권한 필요)

#### 요청 데이터
- **Query Parameter**: `id` (number) - 삭제할 사용자 ID

#### 응답 데이터
```typescript
// 성공 시
interface DeleteUserSuccessResponse {
  code: 200;
  message: "User deleted";
}

// 실패 시
interface DeleteUserFailResponse {
  code: 400;
  message: "User not found";
}
```

#### 사용 예시
```typescript
const deleteUser = async (userId: number) => {
  if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
    return;
  }
  
  const response = await fetch(`/api/users/delete-user?id=${userId}`);
  const result = await response.json();
  
  if (result.code === 200) {
    alert('사용자가 삭제되었습니다.');
    // 사용자 목록 새로고침
  } else {
    alert(result.message);
  }
};
```

---

## 🛡️ 권한 시스템

### 사용자 권한 레벨
```typescript
enum UserRole {
  MASTER = 0,     // 마스터 (최고 관리자)
  ADMIN = 1,      // 관리자
  USER = 2        // 일반 사용자
}
```

### 권한별 기능
- **마스터/관리자 (role: 0, 1)**
  - 모든 API 접근 가능
  - 사용자 생성/수정/삭제
  - 모든 라이브 관리 권한
  - 파일 업로드 권한

- **일반 사용자 (role: 2)**
  - 제한된 데이터 조회
  - 개별 권한 설정에 따라 기능 제한

---

## 🔧 프론트엔드 구현 가이드

### 1. 로그인 상태 관리
```typescript
// 로그인 상태 체크
const checkAuth = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

// 권한 체크
const hasPermission = (userInfo: any, requiredRole: number) => {
  return userInfo && userInfo.role <= requiredRole;
};
```

### 2. API 호출 헬퍼 함수
```typescript
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'http://35.208.29.100:3001' 
    : 'http://localhost:3001';
    
  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  return response.json();
};
```

### 3. 사용자 관리 컴포넌트 예시
```typescript
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const userInfo = checkAuth();
  
  useEffect(() => {
    if (hasPermission(userInfo, 1)) {
      fetchUsers().then(setUsers);
    }
  }, []);
  
  const handleUserEdit = async (userData) => {
    const result = await editUser(userData);
    if (result.code === 200) {
      // 목록 새로고침
      fetchUsers().then(setUsers);
    }
  };
  
  return (
    <div>
      {/* 사용자 목록 및 관리 UI */}
    </div>
  );
};
```

---

## ⚠️ 주의사항

1. **보안**: 패스워드는 평문으로 저장되므로 HTTPS 사용 필수
2. **권한**: API 호출 전 사용자 권한 확인 필요
3. **상태 관리**: 로그인 상태를 적절히 관리하여 세션 만료 처리
4. **에러 처리**: 각 API의 에러 응답을 적절히 처리
5. **유효성 검사**: 이메일, 이름의 고유성 검증 필요

이 가이드를 참고하여 사용자 인증 및 관리 기능을 구현해주세요! 🚀 