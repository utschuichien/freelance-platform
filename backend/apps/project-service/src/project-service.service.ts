import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CreateProjectDto, SubmitProposalDto } from '@app/shared';
import { ProjectStatus } from '@prisma/client/project/index.js';
import { PROJECT_CONSTANTS } from '@app/shared/constants/project.constants';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RABBITMQ_CONFIG, createEventHeaders } from '@app/shared';

@Injectable()
export class ProjectServiceService {
  constructor(
    private prisma: PrismaService,
    private amqpConnection: AmqpConnection,
  ) {}

  async createProject(data: CreateProjectDto, clientId: string) {
    const { title, description, budget, skills, deadline, milestones } = data;

    let categoryId = data.categoryId;
    if (!categoryId && data.category && data.category.trim() !== '') {
      const catName = data.category.trim();
      let cat = await this.prisma.category.findUnique({ where: { name: catName } });
      if (!cat) {
        cat = await this.prisma.category.create({ data: { name: catName } });
      }
      categoryId = cat.id;
    }

    const skillRecords = await Promise.all(
      skills.map(async (skillName) => {
        const name = skillName.trim().toUpperCase();
        let skill = await this.prisma.skill.findUnique({ where: { name } });
        if (!skill) {
          skill = await this.prisma.skill.create({ data: { name } });
        }
        return skill;
      }),
    );

    const project = await this.prisma.project.create({
      data: {
        clientId,
        title,
        description,
        budget,
        categoryId: categoryId || null,
        type: data.type || null,
        deadline: deadline ? new Date(deadline) : null,
        status: ProjectStatus.OPEN,
        skills: {
          create: skillRecords.map((skill) => ({
            skill: { connect: { id: skill.id } },
          })),
        },
        milestones: {
          create: milestones.map((m, index) => ({
            title: m.title,
            amount: m.amount,
            order: index + 1,
          })),
        },
      },
      include: {
        category: true,
        skills: {
          include: { skill: true },
        },
        milestones: true,
      },
    });

    return project;
  }

  async submitProposal(
    projectId: string,
    freelancerId: string,
    dto: SubmitProposalDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    if (project.status !== ProjectStatus.OPEN) {
      throw new BadRequestException('Dự án này đã đóng nhận báo giá');
    }

    const existingProposal = await this.prisma.proposal.findUnique({
      where: {
        uq_project_freelancer: {
          projectId,
          freelancerId,
        },
      },
    });

    if (existingProposal) {
      throw new BadRequestException('Bạn đã gửi báo giá cho dự án này rồi');
    }

    const proposal = await this.prisma.proposal.create({
      data: {
        projectId,
        freelancerId,
        bidAmount: dto.bidAmount,
        estimatedDays: dto.estimatedDays,
        coverLetter: dto.coverLetter,
      },
    });

    // Notify the client that a new proposal was submitted
    await this.amqpConnection.publish(
      RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
      RABBITMQ_CONFIG.ROUTING_KEYS.PROPOSAL_SUBMITTED,
      {
        userId: project.clientId,
        title: 'Có báo giá mới!',
        content: `Một freelancer vừa gửi báo giá mới cho dự án: ${project.title}.`,
        type: 'PROJECT',
        relatedEntityId: projectId,
        link: `/projects/${projectId}`,
      },
      {
        headers: createEventHeaders('project-service'),
        persistent: true,
      },
    );

    return proposal;
  }

  async getProjects(
    cursor?: string, 
    search?: string, 
    category?: string, 
    budgetMin?: number, 
    budgetMax?: number, 
    type?: string,
    skills?: string
  ) {
    const limit = PROJECT_CONSTANTS.PAGINATION_LIMIT;
    
    const where: any = { status: ProjectStatus.OPEN };
    
    if (search && search.trim() !== '') {
      where.title = { contains: search.trim() };
    }
    
    if (category && category.trim() !== '') {
      where.category = {
        name: { contains: category.trim() },
      };
    }
    
    if (type && type.trim() !== '') {
      where.type = type.trim();
    }
    
    if ((budgetMin !== undefined && !isNaN(budgetMin)) || (budgetMax !== undefined && !isNaN(budgetMax))) {
      where.budget = {};
      if (budgetMin !== undefined && !isNaN(budgetMin)) where.budget.gte = budgetMin;
      if (budgetMax !== undefined && !isNaN(budgetMax)) where.budget.lte = budgetMax;
    }
    
    if (skills && skills.trim() !== '') {
      const skillArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillArray.length > 0) {
        where.skills = {
          some: {
            skill: {
              name: { in: skillArray }
            }
          }
        };
      }
    }

    const projects = await this.prisma.project.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      include: {
        category: true,
        skills: {
          include: { skill: true },
        },
        _count: {
          select: { proposals: true },
        },
      },
    });

    let nextCursor: string | null = null;
    if (projects.length > limit) {
      const nextItem = projects.pop();
      nextCursor = nextItem!.id;
    }

    return {
      data: projects,
      nextCursor,
    };
  }

  async getMyProjects(userId: string, role: string, cursor?: string) {
    const limit = PROJECT_CONSTANTS.PAGINATION_LIMIT;
    const whereClause = role === 'CLIENT' 
      ? { clientId: userId } 
      : { proposals: { some: { freelancerId: userId } } };

    const projects = await this.prisma.project.findMany({
      where: whereClause,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      include: {
        category: true,
        skills: {
          include: { skill: true },
        },
        _count: {
          select: { proposals: true },
        },
      },
    });

    let nextCursor: string | null = null;
    if (projects.length > limit) {
      const nextItem = projects.pop();
      nextCursor = nextItem!.id;
    }

    return {
      data: projects,
      nextCursor,
    };
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getProjectById(id: string, userId?: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        category: true,
        skills: {
          include: { skill: true },
        },
        milestones: true,
        _count: {
          select: { proposals: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    // Nếu người xem chính là Chủ dự án (Client tạo ra nó) -> cho phép xem toàn bộ danh sách báo giá
    if (userId && userId === project.clientId) {
      const proposals = await this.prisma.proposal.findMany({
        where: { projectId: id },
        orderBy: { createdAt: 'asc' },
      });
      return { ...project, proposals };
    }

    return project;
  }

  async acceptProposal(
    projectId: string,
    proposalId: string,
    clientId: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    if (project.clientId !== clientId) {
      throw new BadRequestException(
        'Bạn không có quyền duyệt báo giá cho dự án này',
      );
    }

    if (project.status !== ProjectStatus.OPEN) {
      throw new BadRequestException('Dự án không ở trạng thái mở');
    }

    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal || proposal.projectId !== projectId) {
      throw new NotFoundException(
        'Báo giá không tồn tại hoặc không thuộc dự án này',
      );
    }

    // Dùng transaction để đảm bảo toàn vẹn dữ liệu
    return this.prisma.$transaction(async (tx) => {
      // 1. Chuyển Project sang IN_PROGRESS
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: { status: 'IN_PROGRESS' },
      });

      // 2. Chuyển Proposal này sang ACCEPTED
      const acceptedProposal = await tx.proposal.update({
        where: { id: proposalId },
        data: { status: 'ACCEPTED' },
      });

      // 3. (Tuỳ chọn) Chuyển các Proposal khác sang REJECTED
      await tx.proposal.updateMany({
        where: {
          projectId,
          id: { not: proposalId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      return { project: updatedProject, proposal: acceptedProposal };
    });
  }

  async updateStatus(projectId: string, status: any) {
    return this.prisma.project.update({
      where: { id: projectId },
      data: { status },
    });
  }
}

