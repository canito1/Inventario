import api from './api';

export interface StockEntry {
  _id: string;
  item: {
    _id: string;
    name: string;
    barcode?: string;
  };
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  reason: 'purchase' | 'return' | 'adjustment' | 'transfer' | 'exit';
  notes?: string;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

export interface CreateStockEntryData {
  itemId: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
  reason: 'purchase' | 'return' | 'adjustment' | 'transfer' | 'exit';
  notes?: string;
}

export interface StockEntriesResponse {
  entries: StockEntry[];
  totalPages: number;
  currentPage: number;
  totalEntries: number;
}

export interface StockEntryFilters {
  page?: number;
  limit?: number;
  search?: string;
  reason?: string;
  startDate?: string;
  endDate?: string;
}

export const stockEntriesService = {
  async getStockEntries(filters: StockEntryFilters = {}): Promise<StockEntriesResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/stock-entries?${params.toString()}`);
    const paginatedData = response.data.data;
    
    return {
      entries: paginatedData.docs || [],
      totalPages: paginatedData.totalPages || 0,
      currentPage: paginatedData.page || 1,
      totalEntries: paginatedData.totalDocs || 0
    };
  },

  async getStockEntry(id: string): Promise<StockEntry> {
    const response = await api.get(`/stock-entries/${id}`);
    return response.data.data;
  },

  async createStockEntry(data: CreateStockEntryData): Promise<StockEntry> {
    const response = await api.post('/stock-entries', data);
    return response.data.data;
  },

  async updateStockEntry(id: string, data: Partial<CreateStockEntryData>): Promise<StockEntry> {
    const response = await api.put(`/stock-entries/${id}`, data);
    return response.data.data;
  },

  async deleteStockEntry(id: string): Promise<void> {
    await api.delete(`/stock-entries/${id}`);
  }
};