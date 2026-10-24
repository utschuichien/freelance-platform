import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContractServiceService } from './contract-service.service';
import { CONTRACT_PATTERNS } from '@app/shared';

@Controller()
export class ContractServiceController {
  constructor(private readonly contractService: ContractServiceService) {}

  @MessagePattern(CONTRACT_PATTERNS.CREATE_CONTRACT)
  async createContract(
    @Payload()
    data: {
      projectId: string;
      proposalId: string;
      clientId: string;
      freelancerId: string;
      bidAmount: number;
    },
  ) {
    return this.contractService.createContract(data);
  }

  @MessagePattern(CONTRACT_PATTERNS.GET_CONTRACTS)
  async getContracts(@Payload() data: { userId: string; role: string }) {
    return this.contractService.getContracts(data.userId, data.role);
  }

  @MessagePattern(CONTRACT_PATTERNS.GET_CONTRACT)
  async getContract(@Payload() data: { id: string }) {
    return this.contractService.getContractById(data.id);
  }

  @MessagePattern(CONTRACT_PATTERNS.GET_MILESTONE)
  async getMilestone(@Payload() data: { id: string }) {
    return this.contractService.getMilestoneById(data.id);
  }

  @MessagePattern(CONTRACT_PATTERNS.SUBMIT_MILESTONE)
  async submitMilestone(
    @Payload()
    data: {
      milestoneId: string;
      freelancerId: string;
      notes: string;
      attachmentUrls: any;
    },
  ) {
    return this.contractService.submitMilestone(
      data.milestoneId,
      data.freelancerId,
      data.notes,
      data.attachmentUrls,
    );
  }

  @MessagePattern(CONTRACT_PATTERNS.APPROVE_MILESTONE)
  async approveMilestone(
    @Payload() data: { milestoneId: string; clientId: string },
  ) {
    return this.contractService.approveMilestone(data.milestoneId, data.clientId);
  }

  @MessagePattern(CONTRACT_PATTERNS.MARK_MILESTONE_PAID)
  async markMilestonePaid(@Payload() data: { milestoneId: string }) {
    return this.contractService.markMilestonePaid(data.milestoneId);
  }
  @MessagePattern(CONTRACT_PATTERNS.REQUEST_REVISION)
  async requestRevision(
    @Payload() data: { milestoneId: string; clientId: string; feedbackNotes: string },
  ) {
    return this.contractService.requestRevision(data.milestoneId, data.clientId, data.feedbackNotes);
  }

  @MessagePattern(CONTRACT_PATTERNS.TERMINATE_CONTRACT)
  async terminateContract(
    @Payload() data: { id: string; clientId: string; reason?: string },
  ) {
    return this.contractService.terminateContract(data.id, data.clientId, data.reason);
  }

  @MessagePattern(CONTRACT_PATTERNS.CREATE_REVIEW)
  async createReview(
    @Payload()
    data: {
      contractId: string;
      reviewerId: string;
      reviewerRole: string;
      rating: number;
      comment?: string;
    },
  ) {
    return this.contractService.createReview(data);
  }

  @MessagePattern(CONTRACT_PATTERNS.GET_CONTRACT_REVIEWS)
  async getContractReviews(@Payload() data: { contractId: string }) {
    return this.contractService.getContractReviews(data.contractId);
  }

  @MessagePattern(CONTRACT_PATTERNS.GET_USER_REVIEWS)
  async getUserReviews(@Payload() data: { userId: string }) {
    return this.contractService.getUserReviews(data.userId);
  }

  @MessagePattern(CONTRACT_PATTERNS.OPEN_DISPUTE)
  async openDispute(@Payload() data: any) {
    return this.contractService.openDispute(data);
  }

  @MessagePattern(CONTRACT_PATTERNS.GET_DISPUTES)
  async getDisputes(@Payload() data: any) {
    return this.contractService.getDisputes(data?.filters);
  }

  @MessagePattern(CONTRACT_PATTERNS.GET_DISPUTE)
  async getDispute(@Payload() data: { id: string }) {
    return this.contractService.getDisputeById(data.id);
  }

  @MessagePattern(CONTRACT_PATTERNS.GET_CONTRACT_DISPUTE)
  async getContractDispute(@Payload() data: { contractId: string }) {
    return this.contractService.getContractDispute(data.contractId);
  }

  @MessagePattern(CONTRACT_PATTERNS.RESOLVE_DISPUTE)
  async resolveDispute(@Payload() data: any) {
    return this.contractService.resolveDispute(data);
  }

  @MessagePattern(CONTRACT_PATTERNS.CANCEL_DISPUTE)
  async cancelDispute(@Payload() data: { disputeId: string; userId: string }) {
    return this.contractService.cancelDispute(data.disputeId, data.userId);
  }
}

