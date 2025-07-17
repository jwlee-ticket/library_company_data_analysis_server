import { ApiProperty } from '@nestjs/swagger';

export class SqlSuccessResponseDto {
  @ApiProperty({
    description: '실행 성공 여부',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: '쿼리 결과 데이터',
    example: [
      { id: 1, email: 'admin@test.com', name: 'Admin' },
      { id: 2, email: 'user@test.com', name: 'User' }
    ]
  })
  results: any[];

  @ApiProperty({
    description: '반환된 행 수',
    example: 2
  })
  rowCount: number;

  @ApiProperty({
    description: '쿼리 실행 시간 (밀리초)',
    example: 45
  })
  executionTime: number;
}

export class SqlErrorResponseDto {
  @ApiProperty({
    description: '실행 성공 여부',
    example: false
  })
  success: boolean;

  @ApiProperty({
    description: '에러 메시지',
    example: 'SELECT 문만 실행 가능합니다.'
  })
  error: string;

  @ApiProperty({
    description: '에러 코드',
    example: 'INVALID_QUERY_TYPE',
    required: false
  })
  code?: string;
} 