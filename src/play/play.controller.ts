import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlayService } from './play.service';
import { CreatePlayDto } from './dto/create-play.dto';
import { UpdatePlayDto } from './dto/update-play.dto';

@Controller('play')
export class PlayController {
  constructor(private readonly playService: PlayService) { }


}
