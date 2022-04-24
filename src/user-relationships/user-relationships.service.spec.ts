import { Test, TestingModule } from '@nestjs/testing';
import { UserRelationshipsService } from './user-relationships.service';

describe('UserRelationshipsService', () => {
  let service: UserRelationshipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRelationshipsService],
    }).compile();

    service = module.get<UserRelationshipsService>(UserRelationshipsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
