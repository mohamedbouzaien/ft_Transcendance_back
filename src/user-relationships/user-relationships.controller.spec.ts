import { Test, TestingModule } from '@nestjs/testing';
import { UserRelationshipsController } from './user-relationships.controller';

describe('UserRelationshipsController', () => {
  let controller: UserRelationshipsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRelationshipsController],
    }).compile();

    controller = module.get<UserRelationshipsController>(UserRelationshipsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
