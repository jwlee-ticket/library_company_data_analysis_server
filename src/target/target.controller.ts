import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { TargetService } from './target.service';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';

@Controller('target')
export class TargetController {
  private readonly logger = new Logger(TargetController.name);
  constructor(private readonly targetService: TargetService) { }

  @Get('make-dummy')
  async makeDummy() {
    return await this.targetService.makeDummy();
  }

  @Post('change-target')
  async changeTarget(@Body() updateTargetDto: UpdateTargetDto) {
    return this.targetService.changeTarget(updateTargetDto);
  }

}
