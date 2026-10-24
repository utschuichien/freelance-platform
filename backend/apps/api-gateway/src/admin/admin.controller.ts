import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, JwtUserPayload } from '../auth/current-user.decorator';
import { firstValueFrom } from 'rxjs';
import { PROJECT_PATTERNS, AUTH_PATTERNS, USER_PATTERNS, PAYMENT_PATTERNS, CONTRACT_PATTERNS, ResolveDisputeDto } from '@app/shared';

const ADMIN_PAGE_LIMIT = 8;

@Controller('api/admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy,
    @Inject('PROJECT_SERVICE') private projectClient: ClientProxy,
    @Inject('CONTRACT_SERVICE') private contractClient: ClientProxy,
  ) {}

  @Get('users')
  async getUsers(
    @Query('page') page: string = '1',
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = ADMIN_PAGE_LIMIT;

    // 1. Fetch users from auth-service
    const users = await firstValueFrom(this.authClient.send(AUTH_PATTERNS.GET_ALL_USERS, {}));
    
    // 2. Fetch profiles from user-service
    const profiles = await firstValueFrom(this.userClient.send(USER_PATTERNS.GET_ALL_PROFILES, {}));

    // 3. Merge data
    const merged = users.map((user: any) => {
      const profile = profiles.find((p: any) => p.userId === user.id);
      return {
        ...user,
        kycStatus: profile?.kycStatus || 'NONE',
        fullName: profile?.fullName || user.fullName,
      };
    });

    let filtered = merged;
    
    if (role) {
      filtered = filtered.filter((u: any) => u.role === role);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((u: any) => 
        u.fullName?.toLowerCase().includes(searchLower) || 
        u.email?.toLowerCase().includes(searchLower)
      );
    }
    
    if (status === 'pending_kyc') {
      filtered = filtered.filter((u: any) => u.kycStatus === 'PENDING');
    } else if (status === 'blocked') {
      filtered = filtered.filter((u: any) => u.isActive === false);
    }

    const total = filtered.length;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };
  }

  @Patch('users/:id/kyc')
  async updateKycStatus(@Param('id') userId: string, @Body('status') status: string) {
    return firstValueFrom(this.userClient.send(USER_PATTERNS.UPDATE_KYC_STATUS, { userId, status }));
  }

  @Patch('users/:id/status')
  async updateUserStatus(@Param('id') userId: string, @Body('isActive') isActive: boolean) {
    return firstValueFrom(this.authClient.send(AUTH_PATTERNS.UPDATE_USER_STATUS, { id: userId, isActive }));
  }

  // --- FINANCE APIs ---

  @Get('finance/stats')
  async getFinanceStats() {
    return firstValueFrom(this.paymentClient.send(PAYMENT_PATTERNS.GET_FINANCE_STATS, {}));
  }

  @Get('withdrawals')
  async getWithdrawals(@Query('page') page: string = '1') {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = ADMIN_PAGE_LIMIT;

    const withdrawals = await firstValueFrom(this.paymentClient.send(PAYMENT_PATTERNS.GET_ALL_WITHDRAWALS, {}));
    
    // Enrich with user info
    const users = await firstValueFrom(this.authClient.send(AUTH_PATTERNS.GET_ALL_USERS, {}));
    const merged = withdrawals.map((w: any) => {
      const user = users.find((u: any) => u.id === w.userId);
      return {
        ...w,
        userEmail: user?.email,
        userName: user?.fullName,
      };
    });

    const total = merged.length;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedData = merged.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };
  }

  @Patch('withdrawals/:id/approve')
  async approveWithdrawal(@Param('id') id: string, @Body('adminNote') adminNote?: string) {
    return firstValueFrom(this.paymentClient.send(PAYMENT_PATTERNS.APPROVE_WITHDRAWAL, { id, adminNote }));
  }

  @Patch('withdrawals/:id/reject')
  async rejectWithdrawal(@Param('id') id: string, @Body('adminNote') adminNote?: string) {
    return firstValueFrom(this.paymentClient.send(PAYMENT_PATTERNS.REJECT_WITHDRAWAL, { id, adminNote }));
  }

  // --- DASHBOARD API ---
  @Get('dashboard')
  async getDashboardStats() {
    const [users, profiles, financeStats, withdrawals, projects] = await Promise.all([
      firstValueFrom(this.authClient.send(AUTH_PATTERNS.GET_ALL_USERS, {})).catch(() => []),
      firstValueFrom(this.userClient.send(USER_PATTERNS.GET_ALL_PROFILES, {})).catch(() => []),
      firstValueFrom(this.paymentClient.send(PAYMENT_PATTERNS.GET_FINANCE_STATS, {})).catch(() => ({
        totalEscrow: 0,
        totalFees: 0,
        pendingWithdrawals: 0,
      })),
      firstValueFrom(this.paymentClient.send(PAYMENT_PATTERNS.GET_ALL_WITHDRAWALS, {})).catch(() => []),
      firstValueFrom(this.projectClient.send(PROJECT_PATTERNS.GET_PROJECTS, {})).catch(() => ({ data: [] })),
    ]);

    // Format users with KYC
    const formattedUsers = users.map((u: any) => {
      const p = profiles.find((prof: any) => prof.userId === u.id);
      return { ...u, kycStatus: p?.kycStatus || 'NONE' };
    });

    const pendingKycUsers = formattedUsers.filter((u: any) => u.kycStatus === 'PENDING').slice(0, 5);
    const recentWithdrawals = withdrawals.slice(0, 5).map((w: any) => {
      const u = users.find((user: any) => user.id === w.userId);
      return { ...w, userEmail: u?.email, userName: u?.fullName };
    });

    return {
      totalUsers: users.length,
      activeProjects: projects.data?.length || 0, // Mocking active projects count
      totalEscrow: financeStats.totalEscrow,
      pendingWithdrawals: financeStats.pendingWithdrawals,
      recentKycRequests: pendingKycUsers,
      recentWithdrawals,
    };
  }

  // --- DISPUTE MANAGEMENT APIs ---

  @Get('disputes')
  async getDisputes(@Query('status') status?: string) {
    const disputes = await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.GET_DISPUTES, { filters: { status } }),
    );

    if (!Array.isArray(disputes)) return [];

    // Enrich with User & Project details
    const users = await firstValueFrom(this.authClient.send(AUTH_PATTERNS.GET_ALL_USERS, {})).catch(() => []);

    return Promise.all(
      disputes.map(async (d: any) => {
        const initiator = users.find((u: any) => u.id === d.initiatorId);
        const client = users.find((u: any) => u.id === d.contract?.clientId);
        const freelancer = users.find((u: any) => u.id === d.contract?.freelancerId);

        let projectTitle = 'Dự án';
        if (d.contract?.projectId) {
          try {
            const project = await firstValueFrom(
              this.projectClient.send(PROJECT_PATTERNS.GET_PROJECT, { id: d.contract.projectId }),
            );
            if (project?.title) projectTitle = project.title;
          } catch {}
        }

        return {
          ...d,
          initiatorName: initiator?.fullName || initiator?.email || 'Người dùng',
          clientName: client?.fullName || client?.email || 'Khách hàng',
          freelancerName: freelancer?.fullName || freelancer?.email || 'Freelancer',
          projectTitle,
        };
      }),
    );
  }

  @Get('disputes/:id')
  async getDisputeById(@Param('id') id: string) {
    const dispute = await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.GET_DISPUTE, { id }),
    );

    if (!dispute) {
      throw new NotFoundException('Khiếu nại không tồn tại');
    }

    const users = await firstValueFrom(this.authClient.send(AUTH_PATTERNS.GET_ALL_USERS, {})).catch(() => []);
    const initiator = users.find((u: any) => u.id === dispute.initiatorId);
    const client = users.find((u: any) => u.id === dispute.contract?.clientId);
    const freelancer = users.find((u: any) => u.id === dispute.contract?.freelancerId);

    let project: any = null;
    if (dispute.contract?.projectId) {
      try {
        project = await firstValueFrom(
          this.projectClient.send(PROJECT_PATTERNS.GET_PROJECT, { id: dispute.contract.projectId }),
        );
      } catch {}
    }

    return {
      ...dispute,
      initiatorName: initiator?.fullName || initiator?.email || 'Người dùng',
      clientName: client?.fullName || client?.email || 'Khách hàng',
      freelancerName: freelancer?.fullName || freelancer?.email || 'Freelancer',
      project,
    };
  }

  @Post('disputes/:id/resolve')
  async resolveDispute(
    @Param('id') id: string,
    @Body() body: ResolveDisputeDto,
    @CurrentUser() admin: JwtUserPayload,
  ) {
    const dispute = await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.GET_DISPUTE, { id }),
    );

    if (!dispute) {
      throw new NotFoundException('Khiếu nại không tồn tại');
    }

    const contract = dispute.contract;
    if (!contract) {
      throw new NotFoundException('Hợp đồng liên quan không tồn tại');
    }

    // Tính tổng số tiền ký quỹ còn lại chưa giải ngân (status !== 'PAID')
    let unpaidAmount = 0;
    if (contract.milestones && contract.milestones.length > 0) {
      contract.milestones.forEach((m: any) => {
        if (m.status !== 'PAID') {
          unpaidAmount += Number(m.amount) || 0;
        }
      });
    }

    const timestamp = Date.now();

    // 1. Thực thi luồng thanh toán Escrow theo phán quyết
    if (body.resolution === 'REFUND_CLIENT') {
      if (unpaidAmount > 0) {
        await firstValueFrom(
          this.paymentClient.send(PAYMENT_PATTERNS.ESCROW_REFUND, {
            clientId: contract.clientId,
            amount: unpaidAmount,
            idempotencyKey: `dispute-refund-${id}-${timestamp}`,
            contractId: contract.id,
            reason: `Phán quyết tranh chấp: ${body.adminNote}`,
          }),
        );
      }
    } else if (body.resolution === 'RELEASE_FREELANCER') {
      if (unpaidAmount > 0) {
        const milestoneId = dispute.milestoneId || contract.milestones?.[0]?.id || id;
        await firstValueFrom(
          this.paymentClient.send(PAYMENT_PATTERNS.ESCROW_RELEASE, {
            clientId: contract.clientId,
            freelancerId: contract.freelancerId,
            milestoneId,
            amount: unpaidAmount,
            idempotencyKey: `dispute-release-${id}-${timestamp}`,
          }),
        );
      }
    } else if (body.resolution === 'SPLIT') {
      const clientAmount = Number(body.clientRefundAmount) || 0;
      const freelancerAmount = Number(body.freelancerReleaseAmount) || 0;

      if (clientAmount > 0) {
        await firstValueFrom(
          this.paymentClient.send(PAYMENT_PATTERNS.ESCROW_REFUND, {
            clientId: contract.clientId,
            amount: clientAmount,
            idempotencyKey: `dispute-split-refund-${id}-${timestamp}`,
            contractId: contract.id,
            reason: `Phán quyết phân chia tranh chấp: ${body.adminNote}`,
          }),
        );
      }

      if (freelancerAmount > 0) {
        const milestoneId = dispute.milestoneId || contract.milestones?.[0]?.id || id;
        await firstValueFrom(
          this.paymentClient.send(PAYMENT_PATTERNS.ESCROW_RELEASE, {
            clientId: contract.clientId,
            freelancerId: contract.freelancerId,
            milestoneId,
            amount: freelancerAmount,
            idempotencyKey: `dispute-split-release-${id}-${timestamp}`,
          }),
        );
      }
    }

    // 2. Cập nhật trạng thái Dispute và Contract trong Contract Service
    const resolvedDispute = await firstValueFrom(
      this.contractClient.send(CONTRACT_PATTERNS.RESOLVE_DISPUTE, {
        disputeId: id,
        adminId: admin.userId,
        resolution: body.resolution,
        adminNote: body.adminNote,
        clientRefundAmount: body.clientRefundAmount,
        freelancerReleaseAmount: body.freelancerReleaseAmount,
      }),
    );

    return {
      message: 'Đã giải quyết tranh chấp và thực thi luồng ký quỹ thành công',
      dispute: resolvedDispute,
    };
  }
}
