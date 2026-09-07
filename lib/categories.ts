import api from './api';

export interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
}

export const categoriesService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data.data || []; // Backend returns nested data
  },

  async getCategory(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data.data; // Backend returns nested data
  },

  async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await api.post('/categories', data);
    return response.data.data; // Backend returns nested data
  },

  async updateCategory(id: string, data: Partial<CreateCategoryData>): Promise<Category> {
    const response = await api.put(`/categories/${id}`, data);
    return response.data.data; // Backend returns nested data
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
};