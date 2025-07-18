import { Module } from '@nestjs/common';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { SqlViewerModule } from '../sql-viewer/sql-viewer.module';

@Module({
  imports: [
    SqlViewerModule, // SQL Viewer 서비스 사용을 위해 import
  ],
  controllers: [AiChatController],
  providers: [AiChatService],
  exports: [AiChatService], // 다른 모듈에서 사용할 수 있도록 export
})
export class AiChatModule {} 