import { Controller, Get, Post, Patch, Body, Inject, UseGuards, Param, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, JwtUserPayload } from '../auth/current-user.decorator';
import { CONTRACT_PATTERNS, PAYMENT_PATTERNS, PROJECT_PATTERNS, AUTH_PATTERNS, OpenDisputeDto } from '@app/shared';

@Controller('api/contracts')
export class ContractController {
  constructor(
    @Inject('CONTRACT_SERVICE') private contractClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy,
    @Inject('PROJECT_SERVICE') private projectClient: ClientProxy,
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getContracts(@CurrentUser() user: JwtUserPayload) {
    const userId = user.userId;
    const role = user.role;
    const contracts = await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.GET_CONTRACTS, { userId, role })
    );

    // Bổ sung thông tin dự án & tính toán tiến độ
    const enrichedContracts = await Promise.all(
      contracts.map(async (contract: any) => {
        let title = 'Dự án không xác định';
        let client = 'Khách hàng';
        try {
          const project = await firstValueFrom(
            this.projectClient.send(PROJECT_PATTERNS.GET_PROJECT, { id: contract.projectId })
          );
          if (project) {
            title = project.title;
            client = project.clientName || 'Khách hàng'; 
          }
        } catch (e) {
          // Bỏ qua lỗi nếu không tìm thấy dự án gốc
        }

        // Tính tổng tiền đã trả (PAID) và % tiến độ
        let amountPaid = 0;
        let progress = 0;
        
        if (contract.milestones && contract.milestones.length > 0) {
          contract.milestones.forEach((m: any) => {
            if (m.status === 'PAID') {
              amountPaid += Number(m.amount);
            }
          });
        }
        
        const totalAmount = Number(contract.totalAmount);
        if (totalAmount > 0) {
          progress = Math.round((amountPaid / totalAmount) * 100);
        } else {
          progress = contract.status === 'COMPLETED' ? 100 : 0;
        }

        return {
          ...contract,
          title,
          client,
          amountPaid,
          progress,
        };
      })
    );

    return enrichedContracts;
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getContract(
    @Param('id') id: string,
    @CurrentUser() user: JwtUserPayload,
  ) {
    const contract = await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.GET_CONTRACT, { id })
    );

    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng');
    }

    if (
      user.role !== 'ADMIN' &&
      contract.clientId !== user.userId &&
      contract.freelancerId !== user.userId
    ) {
      throw new ForbiddenException('Bạn không có quyền truy cập hợp đồng này');
    }

    let title = 'Hợp đồng dự án';
    let clientName = 'Khách hàng';
    let freelancerName = 'Freelancer';
    let project: any = null;

    try {
      project = await firstValueFrom(
        this.projectClient.send(PROJECT_PATTERNS.GET_PROJECT, { id: contract.projectId })
      );
      if (project) {
        title = project.title;
      }
    } catch (e) {}

    try {
      const clientUser = await firstValueFrom(
        this.authClient.send(AUTH_PATTERNS.GET_USER, { id: contract.clientId })
      );
      if (clientUser) {
        clientName = clientUser.fullName || clientUser.email || 'Khách hàng';
      }
    } catch (e) {}

    try {
      const freelancerUser = await firstValueFrom(
        this.authClient.send(AUTH_PATTERNS.GET_USER, { id: contract.freelancerId })
      );
      if (freelancerUser) {
        freelancerName = freelancerUser.fullName || freelancerUser.email || 'Freelancer';
      }
    } catch (e) {}

    let amountPaid = 0;
    let amountLocked = 0;
    let progress = 0;

    if (contract.milestones && contract.milestones.length > 0) {
      contract.milestones.forEach((m: any) => {
        const amt = Number(m.amount) || 0;
        if (m.status === 'PAID') {
          amountPaid += amt;
        } else if (m.status === 'FUNDED' || m.status === 'SUBMITTED' || m.status === 'APPROVED') {
          amountLocked += amt;
        }
      });
    }

    const totalAmount = Number(contract.totalAmount) || 0;
    if (totalAmount > 0) {
      progress = Math.round((amountPaid / totalAmount) * 100);
    } else {
      progress = contract.status === 'COMPLETED' ? 100 : 0;
    }

    return {
      ...contract,
      title,
      clientName,
      freelancerName,
      project,
      amountPaid,
      amountLocked,
      progress,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('FREELANCER')
  @Post('milestones/:id/submit')
  async submitMilestone(
    @Param('id') milestoneId: string,
    @Body() data: { notes: string; attachmentUrls: any },
    @CurrentUser('userId') freelancerId: string,
  ) {
    return await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.SUBMIT_MILESTONE, {
        milestoneId,
        freelancerId,
        notes: data.notes,
        attachmentUrls: data.attachmentUrls,
      })
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Patch('milestones/:id/approve')
  async approveMilestone(
    @Param('id') milestoneId: string,
    @CurrentUser('userId') clientId: string,
  ) {
    // 1. Approve Milestone in Contract Service
    const milestoneResult = await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.APPROVE_MILESTONE, { milestoneId, clientId })
    );

    // 2. Release Escrow in Payment Service
    if (milestoneResult && milestoneResult.id) {
      const contractData = await firstValueFrom(
        this.contractClient.send(CONTRACT_PATTERNS.GET_CONTRACT, { id: milestoneResult.contractId })
      );

      const idempotencyKey = `escrow-release-${milestoneId}`;
      await firstValueFrom(
        this.paymentClient.send(PAYMENT_PATTERNS.ESCROW_RELEASE, {
          clientId,
          freelancerId: contractData.freelancerId,
          milestoneId,
          amount: Number(milestoneResult.amount),
          idempotencyKey,
        })
      );
      await firstValueFrom(
        this.contractClient.send(CONTRACT_PATTERNS.MARK_MILESTONE_PAID, { milestoneId })
      );
    }

    return { message: 'Đã duyệt sản phẩm và giải ngân thành công', milestone: milestoneResult };
  }
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Patch('milestones/:id/request-revision')
  async requestRevision(
    @Param('id') milestoneId: string,
    @Body() data: { feedbackNotes: string },
    @CurrentUser('userId') clientId: string,
  ) {
    return await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.REQUEST_REVISION, {
        milestoneId,
        clientId,
        feedbackNotes: data.feedbackNotes,
      }),
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Post(':id/terminate')
  async terminateContract(
    @Param('id') contractId: string,
    @Body() data: { reason?: string },
    @CurrentUser('userId') clientId: string,
  ) {
    // 1. Lấy thông tin hợp đồng để tính số tiền chưa thanh toán
    const contract = await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.GET_CONTRACT, { id: contractId }),
    );

    if (!contract) {
      throw new NotFoundException('Hợp đồng không tồn tại');
    }
    if (contract.clientId !== clientId) {
      throw new BadRequestException('Bạn không có quyền hủy hợp đồng này');
    }
    if (contract.status === 'COMPLETED' || contract.status === 'TERMINATED') {
      throw new BadRequestException('Hợp đồng đã hoàn thành hoặc đã bị hủy trước đó');
    }

    // 2. Tính số tiền chưa giải ngân (các milestone có status !== 'PAID')
    let unpaidAmount = 0;
    if (contract.milestones && contract.milestones.length > 0) {
      contract.milestones.forEach((m: any) => {
        if (m.status !== 'PAID') {
          unpaidAmount += Number(m.amount) || 0;
        }
      });
    }

    // 3. Nếu còn tiền Escrow, thực hiện hoàn trả về ví Client
    if (unpaidAmount > 0) {
      const idempotencyKey = `escrow-refund-${contractId}-${Date.now()}`;
      await firstValueFrom(
        this.paymentClient.send(PAYMENT_PATTERNS.ESCROW_REFUND, {
          clientId,
          amount: unpaidAmount,
          idempotencyKey,
          contractId,
          reason: data?.reason,
        }),
      );
    }

    // 4. Cập nhật trạng thái hợp đồng sang TERMINATED trong Contract Service
    const terminatedResult = await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.TERMINATE_CONTRACT, {
        id: contractId,
        clientId,
        reason: data?.reason,
      }),
    );

    return {
      message: 'Hủy hợp đồng thành công và đã hoàn trả tiền ký quỹ về ví',
      refundedAmount: unpaidAmount,
      contract: terminatedResult,
    };
  }

  @UseGuards(AuthGuard)
  @Post(':id/reviews')
  async createReview(
    @Param('id') contractId: string,
    @Body() body: { rating: number; comment?: string },
    @CurrentUser() user: JwtUserPayload,
  ) {
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      throw new BadRequestException('Số sao đánh giá phải từ 1 đến 5 sao');
    }

    return await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.CREATE_REVIEW, {
        contractId,
        reviewerId: user.userId,
        reviewerRole: user.role,
        rating: Number(body.rating),
        comment: body.comment,
      }),
    );
  }

  @UseGuards(AuthGuard)
  @Get(':id/reviews')
  async getContractReviews(@Param('id') contractId: string) {
    return await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.GET_CONTRACT_REVIEWS, { contractId }),
    );
  }

  @UseGuards(AuthGuard)
  @Get('users/:userId/reviews')
  async getUserReviews(@Param('userId') userId: string) {
    return await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.GET_USER_REVIEWS, { userId }),
    );
  }

  // --- DISPUTE USER APIs ---

  @UseGuards(AuthGuard)
  @Post(':id/dispute')
  async openDispute(
    @Param('id') contractId: string,
    @Body() body: OpenDisputeDto,
    @CurrentUser() user: JwtUserPayload,
  ) {
    return await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.OPEN_DISPUTE, {
        contractId,
        initiatorId: user.userId,
        initiatorRole: user.role,
        reason: body.reason,
        evidenceUrls: body.evidenceUrls,
        milestoneId: body.milestoneId,
      }),
    );
  }

  @UseGuards(AuthGuard)
  @Get(':id/dispute')
  async getContractDispute(
    @Param('id') contractId: string,
    @CurrentUser() user: JwtUserPayload,
  ) {
    // 1. Kiểm tra quyền truy cập hợp đồng
    const contract = await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.GET_CONTRACT, { id: contractId }),
    );

    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng');
    }

    if (
      user.role !== 'ADMIN' &&
      contract.clientId !== user.userId &&
      contract.freelancerId !== user.userId
    ) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin tranh chấp hợp đồng này');
    }

    return await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.GET_CONTRACT_DISPUTE, { contractId }),
    );
  }

  @UseGuards(AuthGuard)
  @Post('disputes/:disputeId/cancel')
  async cancelDispute(
    @Param('disputeId') disputeId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.CANCEL_DISPUTE, {
        disputeId,
        userId,
      }),
    );
  }
}

