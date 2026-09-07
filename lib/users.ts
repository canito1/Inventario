import api from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'employee';
}

export interface UsersResponse {
  users: User[];
  totalPages: number;
  currentPage: number;
  totalUsers: number;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export const usersService = {
  async getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/users?${params.toString()}`);
    const paginatedData = response.data.data;
    
    return {
      users: paginatedData.docs || [],
      totalPages: paginatedData.totalPages || 0,
      currentPage: paginatedData.page || 1,
      totalUsers: paginatedData.totalDocs || 0
    };
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  async createUser(data: CreateUserData): Promise<User> {
    const response = await api.post('/users', data);
    return response.data.data;
  },

  async updateUser(id: string, data: Partial<CreateUserData>): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async toggleUserStatus(id: string): Promise<User> {
    const response = await api.put(`/users/${id}/toggle-status`);
    return response.data.data;
  }
};