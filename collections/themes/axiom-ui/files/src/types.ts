export type PageId = 'overview' | 'users' | 'products' | 'analytics';
export type UserStatus = 'Active' | 'Pending' | 'Inactive';
export type UserRole = 'Customer' | 'Admin' | 'Editor';
export type Trend = 'up' | 'down' | 'flat';

export interface Metric {
  label: string;
  value: string;
  change: string;
  trend: Trend;
  icon: 'users' | 'revenue' | 'cart' | 'growth' | 'clock' | 'conversion';
}
export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  orders: number;
  spent: number;
  joined: string;
  avatar: string;
}
export interface DashboardProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  color: 'indigo' | 'pink' | 'green' | 'slate' | 'lilac' | 'blue';
  featured?: boolean;
}
export interface DashboardConfig {
  brand: { name: string; subtitle: string; initial: string; accent: string };
  currency: string;
  locale: string;
  profile: { name: string; role: string; initials: string };
  metrics: { overview: Metric[]; users: Metric[]; analytics: Metric[] };
  users: DashboardUser[];
  products: DashboardProduct[];
  revenue: number[];
  traffic: { name: string; value: number; color: string }[];
  activities: { title: string; description: string; minutesAgo: number; kind: string }[];
}
