import { Controller, Post, UseInterceptors, UploadedFile, Logger, Get, Query, Body, Res, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';
import * as path from 'path';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) { } // 서비스 주입

  @Post('play-excel')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async handleExcel(@UploadedFile() file, @Body() data: any) {
    try {
      this.logger.debug('handleExcel');

      if (!file) {
        throw new Error('No file uploaded');
      }

      // 파일 처리 서비스 호출
      return await this.uploadService.handlePlayExcel(file, data.liveName, data.userName);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      return { status: false, message: error.message };
    }
  }

  @Get('download')
  async downloadExcel(@Query('id') id: string, @Res() res: Response) {
    try {

      this.logger.debug(`Download request for upload ID: ${id}`);
      const fileData = await this.uploadService.getFileForDownload(Number(id));

      this.logger.debug(`File data: ${JSON.stringify(fileData)}`);

      if (!fileData) {
        throw new NotFoundException('File not found');
      }

      // 파일 전송 - Content-Disposition 헤더로 다운로드 파일명 지정
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileData.originalFileName)}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      return res.sendFile(fileData.filePath, { root: '/' });
    } catch (error) {
      this.logger.error(`Failed to download file: ${error.message}`, error.stack);
      res.status(404).send({ status: false, message: error.message });
    }
  }

  @Get('live-list')
  async getLiveInfo(@Query('id') id: string) {
    return await this.uploadService.getLiveInfo(id);
  }

  @Get('upload-entry')
  async getUploadEntry(@Query('liveName') liveName: string) {
    return await this.uploadService.getUploadEntry(liveName);
  }

  @Get('get-upload-history')
  async getUploadHistory() {
    return await this.uploadService.getUploadHistory();
  }

  @Get('get-time-test')
  async timeTest() {
    return await this.uploadService.timeTest();
  }


  @Get('ping')
  async ping() {
    this.logger.log('ping');
    return 'pong';
  }

  @Get('delete-entry')
  async deleteEntry(@Query('liveName') liveName: string, @Query('uploadId') uploadId: number) {
    return await this.uploadService.deleteEntry(liveName, uploadId);
  }
}