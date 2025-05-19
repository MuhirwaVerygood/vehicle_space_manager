import { authorizedAPI, unauthorizedAPI } from './api';
import { LoginCredentials, RegisterData, User } from '../types/auth';

// Extended User type to match backend response and component needs
export interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status?: 'active' | 'suspended' | 'pending';
  vehicleCount?: number;
  createdAt?: string;
  lastLogin?: string;
}

export const AuthService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await unauthorizedAPI.post('/auth/login', credentials);
      const data = {
        user: response.data.data.user,
        token: response.data.data.token,
      };
      return data;
    } catch (error) {
      throw {
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      };
    }
  },

  async register(userData: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const response = await unauthorizedAPI.post('/auth/register', userData);
      const data = {
        user: response.data.data.user,
        token: response.data.data.token,
      };
      return data;
    } catch (error) {
      throw {
        response: {
          data: {
            message: 'Registration failed',
          },
        },
      };
    }
  },

  async getCurrentUser(): Promise<User> {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }

    const response = await authorizedAPI.get('/auth/me');
    return response.data.data;
  },

  async updateProfile(userId: string, userData: Partial<User>): Promise<User> {
    const response = await authorizedAPI.put(`/users/profile`, userData);
    return response.data.data;
  },

  async updatePassword(
    userId: string,
    passwords: { currentPassword: string; newPassword: string }
  ): Promise<void> {
    await authorizedAPI.put(`/users/password`, passwords);
  },

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = ''
  ): Promise<{
    items: ExtendedUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const response = await authorizedAPI.get('/users', {
        params: { page, limit, search: searchTerm },
      });
      return response.data.data;
    } catch (error) {
      throw {
        response: {
          data: {
            message: 'Failed to fetch users',
          },
        },
      };
    }
  },

  async createUser(userData: {
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    status: 'active' | 'suspended' | 'pending';
  }): Promise<ExtendedUser> {
    try {
      const response = await authorizedAPI.post('/users', userData);
      return response.data.data;
    } catch (error) {
      throw {
        response: {
          data: {
            message: 'Failed to create user',
          },
        },
      };
    }
  },

  async updateUser(
    userId: string,
    userData: {
      name?: string;
      email?: string;
      role?: 'USER' | 'ADMIN';
      status?: 'active' | 'suspended' | 'pending';
    }
  ): Promise<ExtendedUser> {
    try {
      const response = await authorizedAPI.put(`/users/${userId}`, userData);
      return response.data.data;
    } catch (error) {
      throw {
        response: {
          data: {
            message: 'Failed to update user',
          },
        },
      };
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await authorizedAPI.delete(`/users/${userId}`);
    } catch (error) {
      throw {
        response: {
          data: {
            message: 'Failed to delete user',
          },
        },
      };
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};