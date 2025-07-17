#!/bin/bash

# =================================
# 프로덕션 → 개발환경 데이터 동기화 스크립트
# =================================

set -e  # 에러 발생시 스크립트 중단

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 프로덕션 서버 정보
SSH_KEY="/Users/tikes-seukweeo/.ssh/library_company"
SERVER_USER="forifwhile.xyz"
SERVER_IP="35.208.29.100"
SERVER_PROJECT_DIR="library_company_data_analysis_server"

# PostgreSQL 정보 (양쪽 환경 동일)
POSTGRES_USER="libraryPostgres"
POSTGRES_PASSWORD="libraryPostgres777"
POSTGRES_DB="libraryPostgres"
POSTGRES_PORT="1377"

# 컨테이너명 (양쪽 환경 동일)
CONTAINER_NAME="libraryPostgres"

# 백업 파일명
BACKUP_FILE="prod_backup_$(date +%Y%m%d_%H%M%S).sql"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 프로덕션 → 개발환경 데이터 동기화 시작${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 0. 사전 체크
echo -e "${YELLOW}📋 0. 사전 환경 체크...${NC}"

# SSH 키 존재 확인
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH 키가 존재하지 않습니다: $SSH_KEY${NC}"
    exit 1
fi

# 현재 디렉토리에 view-definitions.sql 존재 확인
if [ ! -f "view-definitions.sql" ]; then
    echo -e "${RED}❌ view-definitions.sql 파일이 존재하지 않습니다${NC}"
    echo -e "${YELLOW}💡 현재 디렉토리가 프로젝트 루트인지 확인하세요${NC}"
    exit 1
fi

# sudo 권한 사전 확보 (postgres-data 삭제용)
if [ -d "postgres-data" ]; then
    echo "postgres-data 디렉토리 삭제를 위해 관리자 권한이 필요합니다."
    echo "macOS 사용자 패스워드를 입력하세요:"
    sudo -v
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 관리자 권한 획득 실패${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ 사전 체크 완료${NC}"
echo ""

# 1. 프로덕션 서버에서 데이터 백업
echo -e "${YELLOW}📦 1. 프로덕션 데이터 백업 중...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    cd $SERVER_PROJECT_DIR && 
    echo 'PostgreSQL 백업 생성 중...' &&
    docker exec $CONTAINER_NAME pg_dump -U $POSTGRES_USER -d $POSTGRES_DB > $BACKUP_FILE &&
    echo '백업 파일 생성 완료: $BACKUP_FILE' &&
    ls -lh $BACKUP_FILE
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 프로덕션 백업 완료${NC}"
else
    echo -e "${RED}❌ 프로덕션 백업 실패${NC}"
    exit 1
fi
echo ""

# 2. 백업 파일 로컬로 다운로드
echo -e "${YELLOW}⬇️ 2. 백업 파일 다운로드 중...${NC}"
scp -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP:~/$SERVER_PROJECT_DIR/$BACKUP_FILE" ./

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 백업 파일 다운로드 완료${NC}"
    ls -lh "$BACKUP_FILE"
else
    echo -e "${RED}❌ 백업 파일 다운로드 실패${NC}"
    exit 1
fi
echo ""

# 3. 개발환경 초기화
echo -e "${YELLOW}🗑️ 3. 개발환경 초기화 중...${NC}"
echo "기존 컨테이너 중지..."
docker-compose down

echo "기존 PostgreSQL 데이터 삭제..."
# Docker 볼륨을 통해 안전하게 삭제 (sudo 불필요)
docker volume prune -f 2>/dev/null || true

# 안전한 디렉토리 삭제 방법
if [ -d "postgres-data" ]; then
    echo "postgres-data 디렉토리를 삭제합니다..."
    sudo rm -rf postgres-data
    echo "✅ postgres-data 디렉토리 삭제 완료"
fi

echo "PostgreSQL 컨테이너 재시작..."
docker-compose up -d postgres

echo "컨테이너 초기화 대기 (20초)..."
sleep 20

# 컨테이너 상태 확인
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${GREEN}✅ PostgreSQL 컨테이너 시작 완료${NC}"
else
    echo -e "${RED}❌ PostgreSQL 컨테이너 시작 실패${NC}"
    exit 1
fi
echo ""

# 4. 데이터 복원
echo -e "${YELLOW}🔄 4. 프로덕션 데이터 복원 중...${NC}"
echo "백업 데이터를 개발 DB에 복원..."

# 데이터베이스 복원
docker exec -i "$CONTAINER_NAME" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 데이터 복원 완료${NC}"
else
    echo -e "${RED}❌ 데이터 복원 실패${NC}"
    exit 1
fi
echo ""

# 5. 뷰 생성
echo -e "${YELLOW}🏗️ 5. 데이터베이스 뷰 생성 중...${NC}"
PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f view-definitions.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 뷰 생성 완료${NC}"
else
    echo -e "${RED}❌ 뷰 생성 실패${NC}"
    exit 1
fi
echo ""

# 6. 데이터 확인
echo -e "${YELLOW}🔍 6. 데이터 복원 확인 중...${NC}"
TABLE_COUNT=$(docker exec "$CONTAINER_NAME" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
VIEW_COUNT=$(docker exec "$CONTAINER_NAME" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT count(*) FROM information_schema.views WHERE table_schema = 'public';")

echo "📊 복원된 테이블 수: $(echo $TABLE_COUNT | tr -d ' ')"
echo "📊 생성된 뷰 수: $(echo $VIEW_COUNT | tr -d ' ')"

# 주요 테이블 데이터 확인
echo ""
echo "📋 주요 테이블 데이터 확인:"
docker exec "$CONTAINER_NAME" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
    SELECT 
        'concert_ticket_sale_model' as table_name, 
        count(*) as record_count 
    FROM concert_ticket_sale_model
    UNION ALL
    SELECT 
        'play_ticket_sale_model' as table_name, 
        count(*) as record_count 
    FROM play_ticket_sale_model
    ORDER BY table_name;
"
echo ""

# 7. 정리
echo -e "${YELLOW}🧹 7. 임시 파일 정리...${NC}"
rm -f "$BACKUP_FILE"

# 프로덕션 서버의 백업 파일도 정리 (선택사항)
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "cd $SERVER_PROJECT_DIR && rm -f $BACKUP_FILE"

echo -e "${GREEN}✅ 임시 파일 정리 완료${NC}"
echo ""

# 완료 메시지
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 데이터 동기화 완료!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📝 다음 단계:${NC}"
echo -e "${YELLOW}1. 개발 서버 시작: ${NC}npm run start:dev"
echo -e "${YELLOW}2. API 테스트: ${NC}curl http://localhost:3001/api/play/summary"
echo -e "${YELLOW}3. 브라우저 확인: ${NC}http://localhost:3001"
echo ""
echo -e "${BLUE}💡 참고사항:${NC}"
echo "- 프로덕션 데이터가 개발환경에 완전히 복사되었습니다"
echo "- 기존 개발환경 데이터는 모두 삭제되었습니다"
echo "- view-definitions.sql의 모든 뷰가 생성되었습니다"
echo "" 