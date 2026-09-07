import api from './api';

export interface DashboardStats {
  totalItems: number;
  totalCategories: number;
  totalUsers: number;
  lowStockItems: number;
  totalValue: number;
  recentActivity: number;
}

export interface InventoryOverview {
  totalItems: number;
  activeItems: number;
  inactiveItems: number;
  discontinuedItems: number;
  lowStockCount: number;
  averageStock: number;
  totalValue: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },

  async getInventoryOverview(): Promise<InventoryOverview> {
    const response = await api.get('/dashboard/inventory-overview');
    return response.data.data;
  }
};