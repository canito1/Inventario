import api from './api';
import { Currency, DEFAULT_CURRENCY } from './currency';

export interface Item {
  _id: string;
  name: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  quantity: number;
  minStock: number;
  maxStock: number;
  price: number;
  currency: Currency;
  location: string;
  barcode?: string;
  image?: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemData {
  name: string;
  description: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  price: number;
  currency: Currency;
  location: string;
  barcode?: string;
  image?: string;
  status?: 'active' | 'inactive' | 'discontinued';
}

export interface ItemsResponse {
  items: Item[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface ItemFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  lowStock?: boolean;
}

export const itemsService = {
  async getItems(filters: ItemFilters = {}): Promise<ItemsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/items?${params.toString()}`);
    const paginatedData = response.data.data; // Backend returns nested data
    
    return {
      items: paginatedData.docs || [],
      totalPages: paginatedData.totalPages || 0,
      currentPage: paginatedData.page || 1,
      totalItems: paginatedData.totalDocs || 0
    };
  },

  async getItem(id: string): Promise<Item> {
    const response = await api.get(`/items/${id}`);
    return response.data.data; // Backend returns nested data
  },

  async createItem(data: CreateItemData): Promise<Item> {
    const response = await api.post('/items', data);
    return response.data.data; // Backend returns nested data
  },

  async updateItem(id: string, data: Partial<CreateItemData>): Promise<Item> {
    const response = await api.put(`/items/${id}`, data);
    return response.data.data; // Backend returns nested data
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete(`/items/${id}`);
  },

  async uploadImage(id: string, file: File): Promise<Item> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post(`/items/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data; // Backend returns nested data
  },

  async getLowStockItems(): Promise<Item[]> {
    const response = await api.get('/items?lowStock=true');
    return response.data.data.docs || []; // Backend returns nested data with pagination
  }
};