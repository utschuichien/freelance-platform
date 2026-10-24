import { IsString, IsOptional, IsNumber, Min, IsArray, IsEnum } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  skills?: string[];

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class GetFreelancerProfilesDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  rateMin?: number;

  @IsOptional()
  @IsNumber()
  rateMax?: number;

  @IsOptional()
  @IsString()
  skills?: string;
}

export class UpdateKycStatusDto {
  @IsString()
  userId: string;

  @IsString()
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}
