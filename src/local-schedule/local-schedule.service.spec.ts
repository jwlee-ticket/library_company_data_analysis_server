import { Test, TestingModule } from '@nestjs/testing';
import { LocalScheduleService } from './local-schedule.service';

describe('LocalScheduleService', () => {
  let service: LocalScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalScheduleService],
    }).compile();

    service = module.get<LocalScheduleService>(LocalScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
