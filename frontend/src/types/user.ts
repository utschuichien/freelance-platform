export type UserRole = 'CLIENT' | 'FREELANCER' | 'ADMIN';

export type KycStatus = 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string | null;
  isActive?: boolean;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface UserReview {
  id: string;
  contractId: string;
  reviewerId: string;
  reviewerName?: string;
  revieweeId: string;
  reviewerRole: 'CLIENT' | 'FREELANCER';
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface UserReviewsResponse {
  total: number;
  avgRating: number;
  reviews: UserReview[];
}

export interface FreelancerProfile {
  id?: string;
  userId: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  hourlyRate?: number;
  rating?: number;
  totalReviews?: number;
  completedJobs?: number;
  category?: string;
  location?: string;
  skills?: string[] | { skill?: { name: string } }[];
  kycStatus?: KycStatus;
  createdAt?: string;
  reviews?: UserReview[];
}

export interface FreelancerFilterParams {
  cursor?: string;
  search?: string;
  category?: string;
  rateMin?: number;
  rateMax?: number;
  skills?: string;
}
