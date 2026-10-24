export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'ESCROW_HOLD' | 'ESCROW_RELEASE' | 'REFUND';

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Transaction {
  id: string;
  walletId: string;
  milestoneId?: string | null;
  amount: number | string;
  feeAmount?: number | string;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: string;
  description?: string;
}

export interface Wallet {
  id: string;
  userId: string;
  availableBalance: number | string;
  escrowBalance: number | string;
  updatedAt?: string;
  transactions?: Transaction[];
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  status: WithdrawalStatus;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  adminNote?: string | null;
  createdAt: string;
  userEmail?: string;
  userName?: string;
}

export interface FinanceStats {
  totalEscrow: number;
  totalFees: number;
  pendingWithdrawals: number;
}
