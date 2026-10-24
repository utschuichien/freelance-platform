import { Test, TestingModule } from '@nestjs/testing';
import { ContractServiceController } from './contract-service.controller';
import { ContractServiceService } from './contract-service.service';

describe('ContractServiceController', () => {
  let contractServiceController: ContractServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ContractServiceController],
      providers: [ContractServiceService],
    }).compile();

    contractServiceController = app.get<ContractServiceController>(ContractServiceController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(contractServiceController).toBeDefined();
    });
  });
});
