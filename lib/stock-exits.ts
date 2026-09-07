import api from './api';

export interface StockExit {
  _id: string;
  item: {
    _id: string;
    name: string;
    barcode?: string;
  };
  quantity: number;
  unitCost: number;
  totalCost: number;
  destination?: string;
  reason: 'sale' | 'damage' | 'loss' | 'transfer' | 'adjustment' | 'return' | 'exit';
  notes?: string;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

export interface CreateStockExitData {
  itemId: string;
  quantity: number;
  unitCost: number;
  destination?: string;
  reason: 'sale' | 'damage' | 'loss' | 'transfer' | 'adjustment' | 'return' | 'exit';
  notes?: string;
}

export interface StockExitsResponse {
  exits: StockExit[];
  totalPages: number;
  currentPage: number;
  totalExits: number;
}

export interface StockExitFilters {
  page?: number;
  limit?: number;
  search?: string;
  reason?: string;
  startDate?: string;
  endDate?: string;
}

export const stockExitsService = {
  async getStockExits(filters: StockExitFilters = {}): Promise<StockExitsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/stock-exits?${params.toString()}`);
    const paginatedData = response.data.data;
    
    return {
      exits: paginatedData.docs || [],
      totalPages: paginatedData.totalPages || 0,
      currentPage: paginatedData.page || 1,
      totalExits: paginatedData.totalDocs || 0
    };
  },

  async getStockExit(id: string): Promise<StockExit> {
    const response = await api.get(`/stock-exits/${id}`);
    return response.data.data;
  },

  async createStockExit(data: CreateStockExitData): Promise<StockExit> {
    const response = await api.post('/stock-exits', data);
    return response.data.data;
  },

  async updateStockExit(id: string, data: Partial<CreateStockExitData>): Promise<StockExit> {
    const response = await api.put(`/stock-exits/${id}`, data);
    return response.data.data;
  },

  async deleteStockExit(id: string): Promise<void> {
    await api.delete(`/stock-exits/${id}`);
  }
};

