import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ViewService } from './view.service';
import { CreateViewDto } from './dto/create-view.dto';
import { UpdateViewDto } from './dto/update-view.dto';

@Controller('view')
export class ViewController {
  constructor(private readonly viewService: ViewService) { }

  @Get('export')
  async exportViews(): Promise<string> {
    await this.viewService.exportAllViewDefinitions();
    return 'View definitions exported successfully';
  }
}
