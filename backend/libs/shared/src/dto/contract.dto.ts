import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsArray } from 'class-validator';

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  proposalId: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  freelancerId: string;

  @IsNumber()
  @Min(0)
  bidAmount: number;
}

export class SubmitMilestoneDto {
  @IsString()
  @IsNotEmpty()
  notes: string;

  @IsOptional()
  @IsArray()
  attachmentUrls?: string[];
}

export class ApproveMilestoneDto {
  @IsString()
  @IsNotEmpty()
  milestoneId: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;
}

export class OpenDisputeDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsArray()
  evidenceUrls?: string[];

  @IsOptional()
  @IsString()
  milestoneId?: string;
}

export class ResolveDisputeDto {
  @IsString()
  @IsNotEmpty()
  resolution: 'REFUND_CLIENT' | 'RELEASE_FREELANCER' | 'SPLIT';

  @IsString()
  @IsNotEmpty()
  adminNote: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  clientRefundAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freelancerReleaseAmount?: number;
}
