import { Module } from '@nestjs/common';
import { SqlViewerController } from './sql-viewer.controller';
import { SqlViewerService } from './sql-viewer.service';
import { SqlSecurityGuard } from './guards/sql-security.guard';

@Module({
  controllers: [SqlViewerController],
  providers: [SqlViewerService, SqlSecurityGuard],
  exports: [SqlViewerService]
})
export class SqlViewerModule {} 