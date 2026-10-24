import { IsNumber, Min, IsPositive, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DepositMoneyDto {
  @IsNumber()
  @IsPositive({ message: 'Số tiền nạp phải lớn hơn 0' })
  @Min(1000, { message: 'Số tiền nạp tối thiểu là 1.000 VNĐ' })
  amount: number;
}

export class WithdrawMoneyDto {
  @IsNumber()
  @IsPositive({ message: 'Số tiền rút phải lớn hơn 0' })
  @Min(1000, { message: 'Số tiền rút tối thiểu là 1.000 VNĐ' })
  amount: number;
}

export class EscrowHoldDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}

export class EscrowReleaseDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  freelancerId: string;

  @IsString()
  @IsNotEmpty()
  milestoneId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;
}

export class ProcessWithdrawalDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
