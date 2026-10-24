export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'TERMINATED';

export type ContractMilestoneStatus = 'CREATED' | 'FUNDED' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED' | 'PAID';

export interface Submission {
  id: string;
  milestoneId: string;
  notes?: string | null;
  attachmentUrls?: string[] | null;
  feedback?: string | null;
  submittedAt: string;
}

export interface ContractMilestone {
  id: string;
  contractId: string;
  title: string;
  description?: string | null;
  amount: number | string;
  deadline?: string | null;
  status: ContractMilestoneStatus;
  createdAt: string;
  updatedAt: string;
  submissions?: Submission[];
}

export interface Review {
  id: string;
  contractId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerRole: 'CLIENT' | 'FREELANCER';
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface Contract {
  id: string;
  projectId: string;
  proposalId: string;
  clientId: string;
  freelancerId: string;
  totalAmount: number | string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  milestones?: ContractMilestone[];
  reviews?: Review[];
  title?: string;
  client?: string;
  clientName?: string;
  freelancerName?: string;
  amountPaid?: number;
  amountLocked?: number;
  progress?: number;
  project?: any;
}

export interface EnrichedContract extends Contract {}
