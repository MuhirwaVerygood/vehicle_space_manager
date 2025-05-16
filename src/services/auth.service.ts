import  { authorizedAPI, unauthorizedAPI } from './api';
import { LoginCredentials, RegisterData, User } from '../types/auth';

export const AuthService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {    
    try {
      const response = await unauthorizedAPI.post('/auth/login', credentials);      
      const data = {
        user: response.data.data.user,
        token: response.data.data.token
      }
      return data;
    } catch (error) {
      throw {
        response: {
          data: {
            message: "Invalid credentials"
          }
        }
      };
    }
  },

  async register(userData: RegisterData): Promise<{ user: User; token: string }> {   
    try {
      const response = await unauthorizedAPI.post('/auth/register', userData);
      const data = {
        user: response.data.data.user,
        token: response.data.data.token
      }
      return data;
    } catch (error) {
      throw {
        response: {
          data: {
            message: "Registration failed"
          }
        }
      };
    }
  },

  async getCurrentUser(): Promise<User> {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    
    const response = await authorizedAPI.get('/auth/me');
    console.log(response.data);
    return response.data;
  },

  async updateProfile(userId: string, userData: Partial<User>): Promise<User> { 
    const response = await authorizedAPI.put(`/users/profile`, userData);
    return response.data;
  },

  async updatePassword(userId: string, passwords: { currentPassword: string; newPassword: string }): Promise<void> {  
    await authorizedAPI.put(`/users/password`, passwords);
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
