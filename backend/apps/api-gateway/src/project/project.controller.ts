import { Controller, Post, Get, Patch, Body, Inject, UseGuards, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProjectDto, SubmitProposalDto, PROJECT_PATTERNS, AUTH_PATTERNS, USER_PATTERNS, CONTRACT_PATTERNS, PAYMENT_PATTERNS } from '@app/shared';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser, JwtUserPayload } from '../auth/current-user.decorator';
import { JwtService } from '@nestjs/jwt';

@Controller('api/projects')
export class ProjectController {
  constructor(
    @Inject('PROJECT_SERVICE') private projectClient: ClientProxy,
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
    @Inject('CONTRACT_SERVICE') private contractClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy,
    private jwtService: JwtService
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Post()
  async createProject(
    @Body() dto: CreateProjectDto,
    @CurrentUser('userId') clientId: string,
  ) {
    return await firstValueFrom(
      this.projectClient.send(PROJECT_PATTERNS.CREATE_PROJECT, { dto, clientId })
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('FREELANCER')
  @Post(':id/proposals')
  async submitProposal(
    @Param('id') projectId: string,
    @Body() dto: SubmitProposalDto,
    @CurrentUser('userId') freelancerId: string,
  ) {
    return await firstValueFrom(
      this.projectClient.send(PROJECT_PATTERNS.SUBMIT_PROPOSAL, { projectId, freelancerId, dto })
    );
  }

  @Get()
  async getProjects(
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('budgetMin') budgetMin?: number,
    @Query('budgetMax') budgetMax?: number,
    @Query('type') type?: string,
    @Query('skills') skills?: string,
  ) {
    const cleanSearch = search && search.trim() !== '' ? search.trim() : undefined;
    const cleanCategory = category && category.trim() !== '' ? category.trim() : undefined;
    const cleanType = type && type.trim() !== '' ? type.trim() : undefined;
    const cleanSkills = skills && skills.trim() !== '' ? skills.trim() : undefined;
    const cleanBudgetMin = budgetMin !== undefined && !isNaN(Number(budgetMin)) ? Number(budgetMin) : undefined;
    const cleanBudgetMax = budgetMax !== undefined && !isNaN(Number(budgetMax)) ? Number(budgetMax) : undefined;

    return await firstValueFrom(
      this.projectClient.send(PROJECT_PATTERNS.GET_PROJECTS, { 
        cursor, 
        search: cleanSearch, 
        category: cleanCategory, 
        budgetMin: cleanBudgetMin, 
        budgetMax: cleanBudgetMax, 
        type: cleanType, 
        skills: cleanSkills 
      })
    );
  }

  @Get('categories')
  async getCategories() {
    return await firstValueFrom(
      this.projectClient.send(PROJECT_PATTERNS.GET_CATEGORIES, {})
    );
  }

  @UseGuards(AuthGuard)
  @Get('my-projects')
  async getMyProjects(
    @CurrentUser() user: JwtUserPayload,
    @Query('cursor') cursor?: string,
  ) {
    return await firstValueFrom(
      this.projectClient.send(PROJECT_PATTERNS.GET_MY_PROJECTS, {
        userId: user.userId,
        role: user.role,
        cursor,
      })
    );
  }

  @Get(':id')
  async getProject(@Param('id') id: string, @Req() req: any) {
    let userId: string | null = null;
    const token = req.cookies?.['accessToken'] || req.headers?.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = this.jwtService.decode(token) as any;
        if (decoded?.sub) {
          userId = decoded.sub;
        }
      } catch {}
    }
    
    const project = await firstValueFrom(
      this.projectClient.send(PROJECT_PATTERNS.GET_PROJECT, { id, userId })
    );

    if (project && project.clientId) {
      try {
        const clientData = await firstValueFrom(
          this.authClient.send(AUTH_PATTERNS.GET_USER, { id: project.clientId })
        );
        project.client = clientData;
      } catch (error) {
        project.client = null;
      }
    }

    // Enrich proposals with Freelancer details if user is project owner
    if (project?.proposals && Array.isArray(project.proposals)) {
      project.proposals = await Promise.all(
        project.proposals.map(async (p: any) => {
          let freelancerProfile: any = null;
          try {
            const freelancerUser = await firstValueFrom(
              this.authClient.send(AUTH_PATTERNS.GET_USER, { id: p.freelancerId })
            );
            let userProfile: any = null;
            try {
              userProfile = await firstValueFrom(
                this.userClient.send(USER_PATTERNS.GET_PROFILE, { userId: p.freelancerId })
              );
            } catch {}
            freelancerProfile = {
              fullName: userProfile?.fullName || freelancerUser?.fullName || 'Freelancer',
              avatarUrl: userProfile?.avatarUrl,
              skills: userProfile?.skills,
              hourlyRate: userProfile?.hourlyRate,
            };
          } catch {}
          return {
            ...p,
            freelancer: freelancerProfile,
          };
        })
      );
    }

    return project;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('CLIENT')
  @Patch(':projectId/proposals/:proposalId/accept')
  async acceptProposal(
    @Param('projectId') projectId: string,
    @Param('proposalId') proposalId: string,
    @CurrentUser('userId') clientId: string,
  ) {
    // 1. Accept Proposal in Project Service
    const acceptResult = await firstValueFrom(
      this.projectClient.send(PROJECT_PATTERNS.ACCEPT_PROPOSAL, { projectId, proposalId, clientId })
    );

    // 2. Automatically Create Contract in Contract Service
    if (acceptResult && acceptResult.id) {
      try {
        const bidAmount = Number(acceptResult.bidAmount);
        const idempotencyKey = `escrow-hold-${acceptResult.id}`;

        // 2a. ESCROW_HOLD in Payment Service
        await firstValueFrom(
          this.paymentClient.send(PAYMENT_PATTERNS.ESCROW_HOLD, {
            userId: clientId,
            amount: bidAmount,
            idempotencyKey,
          })
        );

        // 2b. Create Contract
        const contractResult = await firstValueFrom(
          this.contractClient.send(CONTRACT_PATTERNS.CREATE_CONTRACT, {
            projectId,
            proposalId,
            clientId,
            freelancerId: acceptResult.freelancerId,
            bidAmount,
          })
        );
        return {
          message: 'Báo giá đã được duyệt, tiền đã chuyển vào Escrow và hợp đồng đã được tạo',
          contract: contractResult,
        };
      } catch (err) {
        throw err;
      }
    }

    return acceptResult;
  }
}

