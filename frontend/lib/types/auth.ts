// Authentication types

export type UserRole = 'farmer' | 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  status: 'active' | 'suspended' | 'pending';
  district?: string;
  province?: string;
  phone?: string;
  createdAt: string;
}

export interface AuthCredentials {
  username?: string;
  password?: string;
  role?: UserRole;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
