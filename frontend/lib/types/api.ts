// API response types

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Map endpoints
export interface DistrictAggregate {
  district: string;
  province: string;
  harvest: number;
  consumption: number;
  surplus: number;
  status: 'surplus' | 'shortage' | 'stable' | 'balanced';
  price: { current: number; trend: string };
  count: number;
  isLiveData: boolean;
}

export interface DistrictsResponse {
  district: string;
  province: string;
  status: string;
  count: number;
}

export interface ForecastResponse extends DistrictAggregate {
  horizon: number;
  priceTrend: string;
}

// Submission
export interface Submission {
  id: string;
  farmerName: string;
  district: string;
  province: string;
  crop: string;
  quantity: number;
  unit: string;
  price: number;
  harvestDate: string;
  notes?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Listing (marketplace)
export interface Listing {
  id: string;
  farmerName: string;
  crop: string;
  quantity: number;
  unit: string;
  price: number;
  district: string;
  province: string;
  description?: string;
  photos?: string[];
  status: 'active' | 'sold' | 'expired';
  createdAt: string;
}

// Alert
export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  district?: string;
  crop?: string;
  createdAt: string;
}

// KPI (admin dashboard)
export interface KPIData {
  totalFarmers: number;
  totalCustomers: number;
  totalUsers: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  verifiedSubmissions: number;
  activeListings: number;
  shortageRegions: number;
  surplusRegions: number;
  unreadAlerts: number;
  lastUpdated: string;
}
