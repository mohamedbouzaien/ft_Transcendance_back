import { Test, TestingModule } from '@nestjs/testing';
import { LocalFilesService } from './local-files.service';

describe('LocalFilesService', () => {
  let service: LocalFilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalFilesService],
    }).compile();

    service = module.get<LocalFilesService>(LocalFilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
