import { IsString, IsNotEmpty, IsNumber, IsInt, IsArray, Min, IsOptional, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MilestoneDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  budget: number;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones: MilestoneDto[];
}

export class SubmitProposalDto {
  @IsNumber()
  @Min(0)
  bidAmount: number;

  @IsNumber()
  @Min(1)
  estimatedDays: number;

  @IsOptional()
  @IsString()
  coverLetter?: string;
}
