import { Controller, Get, Inject, UseGuards, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../auth/auth.guard';
import { PROJECT_PATTERNS } from '@app/shared';

@Controller('api/dashboard')
export class DashboardController {
  constructor(
    @Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy,
    @Inject('CONTRACT_SERVICE') private contractClient: ClientProxy,
    @Inject('PROJECT_SERVICE') private projectClient: ClientProxy,
  ) {}

  @UseGuards(AuthGuard)
  @Get('overview')
  async getOverview(@Req() req: any) {
    const userId = req.user.userId;
    const role = req.user.role; // 'CLIENT' or 'FREELANCER'

    // Dùng Promise.all để gọi song song 3 services
    const [walletResponse, contractsResponse, projectsResponse] =
      await Promise.allSettled([
        firstValueFrom(this.paymentClient.send('GET_WALLET', { userId })),
        firstValueFrom(
          this.contractClient.send('GET_CONTRACTS', { userId, role }),
        ),
        firstValueFrom(
          this.projectClient.send(PROJECT_PATTERNS.GET_PROJECTS, {}),
        ),
      ]);

    // Lấy dữ liệu ví
    let wallet = { availableBalance: 0, escrowBalance: 0 };
    if (walletResponse.status === 'fulfilled' && walletResponse.value) {
      wallet = {
        availableBalance: Number(walletResponse.value.availableBalance || 0),
        escrowBalance: Number(walletResponse.value.escrowBalance || 0),
      };
    }

    // Lấy dữ liệu Milestone từ hợp đồng đang chạy
    let milestones: any[] = [];
    let activeContractsCount = 0;
    let paidAmount = 0;
    
    if (
      contractsResponse.status === 'fulfilled' &&
      Array.isArray(contractsResponse.value)
    ) {
      contractsResponse.value.forEach((contract: any) => {
        // Chỉ lấy milestone của hợp đồng đang ACTIVE hoặc DRAFT
        if (contract.status === 'ACTIVE' || contract.status === 'DRAFT') {
          activeContractsCount++;
          if (Array.isArray(contract.milestones)) {
            contract.milestones.forEach((m: any) => {
              // Extract the first attachmentUrl from the first submission if exists
              let link = '';
              if (
                m.submissions &&
                m.submissions.length > 0 &&
                m.submissions[0].attachmentUrls
              ) {
                const urls = m.submissions[0].attachmentUrls;
                if (Array.isArray(urls) && urls.length > 0) link = urls[0];
                else if (typeof urls === 'string') link = urls;
              }

              const amountNum = Number(m.amount);
              
              if (m.status === 'PAID') {
                paidAmount += amountNum;
              }

              milestones.push({
                id: m.id,
                title: m.title,
                amount: amountNum,
                status: m.status,
                deadline: m.deadline || null,
                link,
              });
            });
          }
        }
      });
    }

    // Lấy dữ liệu dự án (Gợi ý dự án cho Freelancer, hoặc hiển thị dự án của Client)
    let projects: any[] = [];
    let activeProjectsCount = 0;
    
    if (
      projectsResponse.status === 'fulfilled' &&
      projectsResponse.value?.data
    ) {
      // Đối với MVP này, tạm thời bốc 3 dự án mới nhất để hiển thị
      projects = projectsResponse.value.data.slice(0, 3).map((p: any) => ({
        id: p.id,
        title: p.title,
        budget: Number(p.budget),
        status: p.status,
        bids: p._count?.proposals || 0,
      }));
    }

    const stats = {
      activeProjectsCount,
      activeContractsCount,
      milestonesCount: milestones.length,
      paidAmount,
      pendingProposals: 0, // Mock for now, would need additional query to proposal table
    };

    return {
      wallet,
      milestones,
      projects,
      stats,
    };
  }
}
