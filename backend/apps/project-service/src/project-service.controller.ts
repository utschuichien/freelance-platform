import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProjectServiceService } from './project-service.service';
import { PROJECT_PATTERNS, CreateProjectDto, SubmitProposalDto } from '@app/shared';

@Controller()
export class ProjectServiceController {
  constructor(private readonly projectService: ProjectServiceService) {}

  @MessagePattern(PROJECT_PATTERNS.CREATE_PROJECT)
  async createProject(@Payload() data: { dto: CreateProjectDto; clientId: string }) {
    return this.projectService.createProject(data.dto, data.clientId);
  }

  @MessagePattern(PROJECT_PATTERNS.SUBMIT_PROPOSAL)
  async submitProposal(@Payload() data: { projectId: string; freelancerId: string; dto: SubmitProposalDto }) {
    return this.projectService.submitProposal(data.projectId, data.freelancerId, data.dto);
  }

  @MessagePattern(PROJECT_PATTERNS.GET_PROJECTS)
  async getProjects(@Payload() data: { 
    cursor?: string;
    search?: string;
    category?: string;
    budgetMin?: number;
    budgetMax?: number;
    type?: string;
    skills?: string;
  }) {
    return this.projectService.getProjects(
      data?.cursor,
      data?.search,
      data?.category,
      data?.budgetMin,
      data?.budgetMax,
      data?.type,
      data?.skills
    );
  }

  @MessagePattern(PROJECT_PATTERNS.GET_MY_PROJECTS)
  async getMyProjects(@Payload() data: { userId: string; role: string; cursor?: string }) {
    return this.projectService.getMyProjects(data.userId, data.role, data.cursor);
  }

  @MessagePattern(PROJECT_PATTERNS.GET_CATEGORIES)
  async getCategories() {
    return this.projectService.getCategories();
  }

  @MessagePattern(PROJECT_PATTERNS.GET_PROJECT)
  async getProject(@Payload() data: { id: string; userId?: string }) {
    return this.projectService.getProjectById(data.id, data.userId);
  }

  @MessagePattern(PROJECT_PATTERNS.ACCEPT_PROPOSAL)
  async acceptProposal(@Payload() data: { projectId: string; proposalId: string; clientId: string }) {
    return this.projectService.acceptProposal(data.projectId, data.proposalId, data.clientId);
  }

  @MessagePattern(PROJECT_PATTERNS.UPDATE_STATUS)
  async updateStatus(@Payload() data: { projectId: string; status: any }) {
    return this.projectService.updateStatus(data.projectId, data.status);
  }
}

