import { Controller } from '@nestjs/common';
import { LocalScheduleService } from './local-schedule.service';

@Controller('local-schedule')
export class LocalScheduleController {
  constructor(private readonly localScheduleService: LocalScheduleService) { }
}
