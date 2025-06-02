import { Test, TestingModule } from '@nestjs/testing';
import { LocalScheduleController } from './local-schedule.controller';
import { LocalScheduleService } from './local-schedule.service';

describe('LocalScheduleController', () => {
  let controller: LocalScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalScheduleController],
      providers: [LocalScheduleService],
    }).compile();

    controller = module.get<LocalScheduleController>(LocalScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
