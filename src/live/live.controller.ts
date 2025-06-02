import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LiveService } from './live.service';
import { CreateLiveDto } from './dto/create-live.dto';
import { UpdateLiveDto } from './dto/update-live.dto';

@Controller('live')
export class LiveController {
  constructor(private readonly liveService: LiveService) { }

  @Get('get-live-data')
  async getLiveInfo(@Query('userId') userId: number) {
    return this.liveService.getLiveData(userId);
  }

  @Get('get-user-list')
  async getUserList() {
    return this.liveService.getUserList();
  }

  @Post('save-live')
  async saveLive(@Body() createLiveDto: CreateLiveDto) {
    return this.liveService.saveLive(createLiveDto);
  }

  @Get('get-live-detail-data')
  async getLiveDetailData(@Query('liveId') liveId: string) {
    return this.liveService.getLiveDetailData(liveId);
  }

  @Post('change-live-detail-data')
  async changeLiveDetailData(@Body() updateLiveDto: UpdateLiveDto) {
    return this.liveService.changeLiveDetailData(updateLiveDto);
  }

  @Get('delete-live')
  async deleteLive(@Query('liveId') liveId: string) {
    return this.liveService.deleteLive(liveId);
  }
}
