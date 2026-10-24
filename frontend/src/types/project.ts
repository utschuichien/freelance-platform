import { User } from './user';

export type ProjectStatus = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'CLOSED';

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Skill {
  id: number;
  name: string;
}

export interface ProjectSkill {
  projectId: string;
  skillId: number;
  skill?: Skill;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  amount: number | string;
  order: number;
  isCompleted?: boolean;
}

export interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  bidAmount: number | string;
  estimatedDays: number;
  coverLetter?: string | null;
  status: ProposalStatus;
  createdAt: string;
  freelancer?: {
    id: string;
    fullName: string;
    email?: string;
    avatarUrl?: string;
  };
}

export interface ProjectCount {
  proposals?: number;
  milestones?: number;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budget: number | string;
  deadline?: string | null;
  category?: string | null;
  type?: string | null;
  status: ProjectStatus;
  version?: number;
  createdAt: string;
  updatedAt: string;
  skills?: (ProjectSkill | { skill?: { name: string } } | { skill: { name: string } })[];
  milestones?: Milestone[];
  proposals?: Proposal[];
  _count?: ProjectCount;
  client?: Partial<User> & {
    avatarUrl?: string;
    location?: string;
  };
}

export interface ProjectFilterParams {
  cursor?: string;
  search?: string;
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  type?: string;
  skills?: string;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  budget: number;
  category?: string;
  type?: string;
  skills: string[];
  deadline?: string;
  milestones: { title: string; amount: number }[];
}

export interface SubmitProposalPayload {
  bidAmount: number;
  estimatedDays: number;
  coverLetter: string;
}
