import { ApiProperty } from '@nestjs/swagger';

export class ExecuteSqlDto {
  @ApiProperty({
    description: 'SQL 쿼리문 (SELECT 문만 허용)',
    example: 'SELECT * FROM user_model LIMIT 10;'
  })
  query: string;
} 