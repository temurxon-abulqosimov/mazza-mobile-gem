import { UserRole } from './enums/UserRole';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  marketId: string;
  createdAt: string;
}

export interface UserLevel {
  name: string;
  progress: number;
}

export interface UserStats {
  mealsSaved: number;
  co2Prevented: number;
  moneySaved: number;
}

export interface UserProfile extends User {
  level: UserLevel;
  stats: UserStats;
  memberSince: string;
  market: {
    id: string;
    name: string;
  };
}
