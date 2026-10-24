import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PROJECT_PATTERNS, RABBITMQ_CONFIG, createEventHeaders } from '@app/shared';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ContractServiceService {
  constructor(
    private prisma: PrismaService,
    @Inject('PROJECT_SERVICE') private projectClient: ClientProxy,
    private amqpConnection: AmqpConnection,
  ) {}

  async createContract(data: {
    projectId: string;
    proposalId: string;
    clientId: string;
    freelancerId: string;
    bidAmount: number;
  }) {
    // 1. Lấy thông tin dự án (để lấy milestones gốc)
    const project = await firstValueFrom(
      this.projectClient.send(PROJECT_PATTERNS.GET_PROJECT, { id: data.projectId }),
    ).catch(() => null);

    if (!project) {
      throw new NotFoundException('Dự án gốc không tồn tại');
    }

    if (!project.milestones || project.milestones.length === 0) {
      throw new BadRequestException('Dự án gốc không có milestone nào');
    }

    const totalOriginalBudget = Number(project.budget);
    const bidAmount = Number(data.bidAmount);

    // 2. Tính toán chia tỉ lệ cho các milestone mới
    const newMilestones: any[] = [];
    let accumulatedAmount = 0;

    for (let i = 0; i < project.milestones.length; i++) {
      const originalM = project.milestones[i];
      const originalAmount = Number(originalM.amount);

      let newAmount = 0;
      if (i === project.milestones.length - 1) {
        // Milestone cuối cùng: Lấy tổng báo giá trừ đi tổng các milestone trước đó để chống sai số
        newAmount = bidAmount - accumulatedAmount;
      } else {
        // Các milestone trước: Tính theo %
        const percentage = originalAmount / totalOriginalBudget;
        newAmount = Math.round(percentage * bidAmount);
        accumulatedAmount += newAmount;
      }

      newMilestones.push({
        title: originalM.title,
        description: `Milestone được tạo tự động từ dự án (gốc: ${originalM.amount} VNĐ)`,
        amount: newAmount,
        deadline: null,
        status: 'FUNDED',
      });
    }

    // 3. Tạo Contract và Milestone
    return this.prisma.contract.create({
      data: {
        projectId: data.projectId,
        proposalId: data.proposalId,
        clientId: data.clientId,
        freelancerId: data.freelancerId,
        totalAmount: bidAmount,
        status: 'ACTIVE',
        milestones: {
          create: newMilestones,
        },
      },
      include: {
        milestones: true,
      },
    });
  }

  async getContracts(userId: string, role: string) {
    const whereClause = role === 'CLIENT' ? { clientId: userId } : { freelancerId: userId };
    return this.prisma.contract.findMany({
      where: whereClause,
      include: {
        milestones: {
          include: { submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getContractById(id: string) {
    return this.prisma.contract.findUnique({
      where: { id },
      include: {
        milestones: {
          include: {
            submissions: {
              orderBy: { submittedAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
      } as any,
    });
  }

  async getMilestoneById(id: string) {
    return this.prisma.milestone.findUnique({
      where: { id }
    });
  }

  async submitMilestone(milestoneId: string, freelancerId: string, notes: string, attachmentUrls: any) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { contract: true },
    });

    if (!milestone) throw new NotFoundException('Milestone không tồn tại');
    if (milestone.contract.freelancerId !== freelancerId) {
      throw new BadRequestException('Bạn không có quyền thao tác trên milestone này');
    }
    if (milestone.status !== 'FUNDED' && milestone.status !== 'CREATED' && milestone.status !== 'REVISION_REQUESTED') {
      throw new BadRequestException('Không thể nộp sản phẩm cho milestone này');
    }

    const submission = await this.prisma.$transaction(async (tx) => {
      await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: 'SUBMITTED' },
      });

      return await tx.submission.create({
        data: {
          milestoneId,
          notes,
          attachmentUrls,
        },
      });
    });

    // Emit domain event for notification sau khi transaction DB đã commit thành công
    await this.amqpConnection.publish(
      RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
      RABBITMQ_CONFIG.ROUTING_KEYS.MILESTONE_SUBMITTED,
      {
        userId: milestone.contract.clientId,
        title: 'Sản phẩm mới đã được nộp',
        content: `Freelancer đã nộp sản phẩm cho milestone: ${milestone.title}. Vui lòng kiểm tra và phê duyệt.`,
        type: 'PROJECT',
        relatedEntityId: milestone.contract.projectId,
        link: `/projects/${milestone.contract.projectId}`,
      },
      {
        headers: createEventHeaders('contract-service'),
        persistent: true,
      },
    );

    return submission;
  }

  async approveMilestone(milestoneId: string, clientId: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { contract: true },
    });

    if (!milestone) throw new NotFoundException('Milestone không tồn tại');
    if (milestone.contract.clientId !== clientId) {
      throw new BadRequestException('Bạn không có quyền thao tác trên milestone này');
    }
    if (milestone.status !== 'SUBMITTED') {
      throw new BadRequestException('Milestone chưa được nộp sản phẩm');
    }

    const updatedMilestone = await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'APPROVED' },
    });

    // Emit domain event for notification
    await this.amqpConnection.publish(
      RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
      RABBITMQ_CONFIG.ROUTING_KEYS.MILESTONE_APPROVED,
      {
        userId: milestone.contract.freelancerId,
        title: 'Sản phẩm đã được duyệt!',
        content: `Khách hàng đã phê duyệt sản phẩm của milestone: ${milestone.title}. Số tiền sẽ sớm được giải ngân.`,
        type: 'PROJECT',
        relatedEntityId: milestone.contract.projectId,
        link: `/projects/${milestone.contract.projectId}`,
      },
      {
        headers: createEventHeaders('contract-service'),
        persistent: true,
      },
    );

    return updatedMilestone;
  }

  async markMilestonePaid(milestoneId: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { contract: true },
    });

    if (!milestone) throw new NotFoundException('Milestone không tồn tại');
    
    const updatedMilestone = await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'PAID' },
    });

    // Kiểm tra xem tất cả các milestone trong hợp đồng này đã PAID chưa
    const remainingUnpaid = await this.prisma.milestone.count({
      where: {
        contractId: milestone.contractId,
        status: { not: 'PAID' },
      },
    });

    if (remainingUnpaid === 0) {
      // 1. Cập nhật trạng thái Hợp đồng sang COMPLETED
      await this.prisma.contract.update({
        where: { id: milestone.contractId },
        data: { status: 'COMPLETED' },
      });

      // 2. Cập nhật Dự án gốc sang COMPLETED
      try {
        await firstValueFrom(
          this.projectClient.send(PROJECT_PATTERNS.UPDATE_STATUS, {
            projectId: milestone.contract.projectId,
            status: 'COMPLETED',
          }),
        );
      } catch (err) {
        console.error('Không thể cập nhật trạng thái dự án sang COMPLETED:', err);
      }

      // 3. Bắn RabbitMQ Notification thông báo hoàn tất hợp đồng cho cả 2 bên
      try {
        // Cho Freelancer:
        await this.amqpConnection.publish(
          RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
          RABBITMQ_CONFIG.ROUTING_KEYS.CONTRACT_COMPLETED,
          {
            userId: milestone.contract.freelancerId,
            title: 'Hợp đồng đã hoàn thành xuất sắc!',
            content: `Tất cả các cột mốc trong hợp đồng đã được nghiệm thu và thanh toán 100%.`,
            type: 'PROJECT',
            relatedEntityId: milestone.contract.projectId,
            link: `/contracts/${milestone.contractId}`,
          },
          {
            headers: createEventHeaders('contract-service'),
            persistent: true,
          },
        );

        // Cho Client:
        await this.amqpConnection.publish(
          RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
          RABBITMQ_CONFIG.ROUTING_KEYS.CONTRACT_COMPLETED,
          {
            userId: milestone.contract.clientId,
            title: 'Dự án đã hoàn thành!',
            content: `Hợp đồng đã hoàn tất tất cả cột mốc và giải ngân thành công.`,
            type: 'PROJECT',
            relatedEntityId: milestone.contract.projectId,
            link: `/contracts/${milestone.contractId}`,
          },
          {
            headers: createEventHeaders('contract-service'),
            persistent: true,
          },
        );
      } catch (err) {
        console.error('Lỗi khi gửi thông báo RabbitMQ CONTRACT_COMPLETED:', err);
      }
    }

    return updatedMilestone;
  }
  async requestRevision(milestoneId: string, clientId: string, feedbackNotes: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { 
        contract: true,
        submissions: { orderBy: { submittedAt: 'desc' }, take: 1 }
      },
    });

    if (!milestone) throw new NotFoundException('Không tồn tại milestone này');
    if (milestone.contract.clientId !== clientId) {
      throw new BadRequestException('Bạn không có quyền thao tác trên milestone này');
    }
    if (milestone.status !== 'SUBMITTED') {
      throw new BadRequestException('Chỉ có thể yêu cầu sửa đổi khi milestone đang ở trạng thái đã nộp');
    }

    const latestSubmission = milestone.submissions && milestone.submissions.length > 0 ? milestone.submissions[0] : null;

    const [updatedMilestone] = await this.prisma.$transaction([
      this.prisma.milestone.update({
        where: { id: milestoneId },
        data: { status: 'REVISION_REQUESTED' },
      }),
      ...(latestSubmission
        ? [
            this.prisma.submission.update({
              where: { id: latestSubmission.id },
              data: { feedback: feedbackNotes } as any,
            }),
          ]
        : []),
    ]);

    await this.amqpConnection.publish(
      RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
      RABBITMQ_CONFIG.ROUTING_KEYS.MILESTONE_REVESION,
      {
        userId: milestone.contract.freelancerId,
        title: 'Yêu cầu chỉnh sửa sản phẩm',
        content: `Khách hàng đã yêu cầu chỉnh sửa milestone "${milestone.title}". Lý do: "${feedbackNotes}"`,
        type: 'PROJECT',
        relatedEntityId: milestone.contract.projectId,
        link: `/contracts/${milestone.contractId}`,
      },
      {
        headers: createEventHeaders('contract-service'),
        persistent: true,
      },
    );

    return { success: true, milestone: updatedMilestone };
  }

  async terminateContract(id: string, clientId: string, reason?: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { milestones: true },
    });

    if (!contract) throw new NotFoundException('Hợp đồng không tồn tại');
    if (contract.clientId !== clientId) {
      throw new BadRequestException('Bạn không có quyền hủy hợp đồng này');
    }
    if (contract.status === 'COMPLETED') {
      throw new BadRequestException('Hợp đồng đã hoàn thành, không thể hủy');
    }
    if (contract.status === 'TERMINATED') {
      throw new BadRequestException('Hợp đồng này đã bị hủy trước đó');
    }

    const updatedContract = await this.prisma.contract.update({
      where: { id },
      data: { status: 'TERMINATED' },
    });

    // Cập nhật trạng thái dự án sang CANCELLED
    try {
      await firstValueFrom(
        this.projectClient.send(PROJECT_PATTERNS.UPDATE_STATUS, {
          projectId: contract.projectId,
          status: 'CANCELLED',
        }),
      );
    } catch (e) {
      console.error('Không thể cập nhật trạng thái dự án sang CANCELLED:', e);
    }

    // Bắn thông báo RabbitMQ cho Freelancer
    try {
      await this.amqpConnection.publish(
        RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
        RABBITMQ_CONFIG.ROUTING_KEYS.CONTRACT_TERMINATED,
        {
          userId: contract.freelancerId,
          title: 'Hợp đồng đã bị hủy',
          content: `Khách hàng đã hủy hợp đồng. ${reason ? `Lý do: "${reason}"` : ''}`,
          type: 'PROJECT',
          relatedEntityId: contract.projectId,
          link: `/contracts/${contract.id}`,
        },
        {
          headers: createEventHeaders('contract-service'),
          persistent: true,
        },
      );
    } catch (e) {
      console.error('Lỗi khi gửi thông báo RabbitMQ CONTRACT_TERMINATED:', e);
    }

    return updatedContract;
  }

  async createReview(data: {
    contractId: string;
    reviewerId: string;
    reviewerRole: string;
    rating: number;
    comment?: string;
  }) {
    const { contractId, reviewerId, reviewerRole, rating, comment } = data;

    if (!rating || rating < 1 || rating > 5) {
      throw new BadRequestException('Số sao đánh giá phải từ 1 đến 5');
    }

    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Hợp đồng không tồn tại');
    }

    if (contract.status !== 'COMPLETED') {
      throw new BadRequestException('Chỉ có thể đánh giá khi hợp đồng đã hoàn thành');
    }

    if (contract.clientId !== reviewerId && contract.freelancerId !== reviewerId) {
      throw new BadRequestException('Bạn không phải là thành viên trong hợp đồng này');
    }

    // Tự động gán người nhận đánh giá
    const revieweeId = reviewerId === contract.clientId ? contract.freelancerId : contract.clientId;

    // Kiểm tra xem đã từng đánh giá chưa
    const existing = await (this.prisma as any).review.findUnique({
      where: {
        uq_contract_reviewer: {
          contractId,
          reviewerId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Bạn đã gửi đánh giá cho hợp đồng này rồi');
    }

    const review = await (this.prisma as any).review.create({
      data: {
        contractId,
        reviewerId,
        revieweeId,
        reviewerRole,
        rating: Math.round(rating),
        comment: comment?.trim() || null,
      },
    });

    // Bắn thông báo RabbitMQ cho người nhận đánh giá
    try {
      await this.amqpConnection.publish(
        RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
        RABBITMQ_CONFIG.ROUTING_KEYS.REVIEW_SUBMITTED,
        {
          userId: revieweeId,
          title: 'Bạn nhận được đánh giá mới!',
          content: `Đối tác đã gửi đánh giá ${review.rating} ⭐ cho bạn trên hợp đồng dự án.`,
          type: 'PROJECT',
          relatedEntityId: contract.projectId,
          link: `/contracts/${contract.id}`,
        },
        {
          headers: createEventHeaders('contract-service'),
          persistent: true,
        },
      );
    } catch (e) {
      console.error('Lỗi khi gửi thông báo RabbitMQ REVIEW_SUBMITTED:', e);
    }

    return review;
  }

  async getContractReviews(contractId: string) {
    return (this.prisma as any).review.findMany({
      where: { contractId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserReviews(userId: string) {
    const reviews = await (this.prisma as any).review.findMany({
      where: { revieweeId: userId },
      orderBy: { createdAt: 'desc' },
    });

    const total = reviews.length;
    const avgRating = total > 0 
      ? Number((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / total).toFixed(1)) 
      : 5.0;

    return {
      reviews,
      total,
      avgRating,
    };
  }

  async openDispute(data: {
    contractId: string;
    initiatorId: string;
    initiatorRole: string;
    reason: string;
    evidenceUrls?: any;
    milestoneId?: string;
  }) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: data.contractId },
      include: { milestones: true },
    });

    if (!contract) {
      throw new NotFoundException('Hợp đồng không tồn tại');
    }

    if (contract.clientId !== data.initiatorId && contract.freelancerId !== data.initiatorId) {
      throw new BadRequestException('Bạn không thuộc hợp đồng này');
    }

    if (contract.status === 'TERMINATED' || contract.status === 'COMPLETED') {
      throw new BadRequestException('Hợp đồng đã kết thúc, không thể mở khiếu nại');
    }

    // Kiểm tra xem đã có dispute nào đang OPEN hoặc UNDER_REVIEW không
    const existingDispute = await this.prisma.dispute.findFirst({
      where: {
        contractId: data.contractId,
        status: { in: ['OPEN', 'UNDER_REVIEW'] },
      },
    });

    if (existingDispute) {
      throw new BadRequestException('Hợp đồng này đang có khiếu nại chờ xử lý');
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        contractId: data.contractId,
        milestoneId: data.milestoneId || null,
        initiatorId: data.initiatorId,
        initiatorRole: data.initiatorRole,
        reason: data.reason,
        evidenceUrls: data.evidenceUrls || [],
        status: 'OPEN',
      },
    });

    // Cập nhật trạng thái hợp đồng sang DISPUTED
    await this.prisma.contract.update({
      where: { id: data.contractId },
      data: { status: 'DISPUTED' },
    });

    // Bắn thông báo RabbitMQ cho đối tác
    const targetUserId = data.initiatorId === contract.clientId ? contract.freelancerId : contract.clientId;
    try {
      await this.amqpConnection.publish(
        RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
        RABBITMQ_CONFIG.ROUTING_KEYS.CONTRACT_COMPLETED,
        {
          userId: targetUserId,
          title: 'Hợp đồng có khiếu nại mới',
          content: `Đối tác đã mở khiếu nại đối với hợp đồng "${contract.id}". Ban quản trị đang tiếp nhận xử lý.`,
          type: 'PROJECT',
          relatedEntityId: contract.projectId,
          link: `/contracts/${contract.id}`,
        },
        {
          headers: createEventHeaders('contract-service'),
          persistent: true,
        },
      );
    } catch (e) {
      console.error('Lỗi khi gửi thông báo RabbitMQ khiếu nại:', e);
    }

    return dispute;
  }

  async getDisputes(filters?: { status?: string }) {
    return this.prisma.dispute.findMany({
      where: filters?.status ? { status: filters.status as any } : undefined,
      include: {
        contract: {
          include: {
            milestones: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDisputeById(id: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            milestones: {
              include: {
                submissions: true,
              },
            },
          },
        },
      },
    });

    if (!dispute) {
      throw new NotFoundException('Khiếu nại không tồn tại');
    }
    return dispute;
  }

  async getContractDispute(contractId: string) {
    return this.prisma.dispute.findFirst({
      where: { contractId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveDispute(data: {
    disputeId: string;
    adminId: string;
    resolution: 'REFUND_CLIENT' | 'RELEASE_FREELANCER' | 'SPLIT';
    adminNote: string;
    clientRefundAmount?: number;
    freelancerReleaseAmount?: number;
  }) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: data.disputeId },
      include: { contract: true },
    });

    if (!dispute) {
      throw new NotFoundException('Khiếu nại không tồn tại');
    }

    if (dispute.status === 'RESOLVED') {
      throw new BadRequestException('Khiếu nại này đã được phân xử trước đó');
    }

    const updatedDispute = await this.prisma.dispute.update({
      where: { id: data.disputeId },
      data: {
        status: 'RESOLVED',
        resolution: data.resolution as any,
        adminNote: data.adminNote,
        resolvedBy: data.adminId,
        resolvedAt: new Date(),
      },
    });

    // Cập nhật trạng thái hợp đồng tương ứng
    const newContractStatus = data.resolution === 'RELEASE_FREELANCER' ? 'COMPLETED' : 'TERMINATED';
    await this.prisma.contract.update({
      where: { id: dispute.contractId },
      data: { status: newContractStatus },
    });

    // Bắn thông báo RabbitMQ cho cả 2 bên về phán quyết của Admin
    const recipients = [dispute.contract.clientId, dispute.contract.freelancerId];
    for (const userId of recipients) {
      try {
        await this.amqpConnection.publish(
          RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
          RABBITMQ_CONFIG.ROUTING_KEYS.CONTRACT_COMPLETED,
          {
            userId,
            title: 'Tranh chấp hợp đồng đã có phán quyết',
            content: `Ban quản trị đã giải quyết khiếu nại: ${data.adminNote}`,
            type: 'PROJECT',
            relatedEntityId: dispute.contract.projectId,
            link: `/contracts/${dispute.contractId}`,
          },
          {
            headers: createEventHeaders('contract-service'),
            persistent: true,
          },
        );
      } catch (e) {}
    }

    return updatedDispute;
  }

  async cancelDispute(disputeId: string, userId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { contract: true },
    });

    if (!dispute) {
      throw new NotFoundException('Khiếu nại không tồn tại');
    }

    if (dispute.initiatorId !== userId) {
      throw new BadRequestException('Chỉ người mở khiếu nại mới có thể hủy');
    }

    if (dispute.status !== 'OPEN') {
      throw new BadRequestException('Chỉ có thể hủy khiếu nại đang ở trạng thái OPEN');
    }

    const updated = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: { status: 'CANCELLED' },
    });

    // Phục hồi lại trạng thái hợp đồng ACTIVE
    await this.prisma.contract.update({
      where: { id: dispute.contractId },
      data: { status: 'ACTIVE' },
    });

    return updated;
  }
}

