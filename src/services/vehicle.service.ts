
import api from './api';
import { Vehicle, VehicleFormData, PaginatedResponse } from '../types/vehicle';

export const VehicleService = {
  async getVehicles(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Vehicle>> {
    const params = { page, limit, ...(search ? { search } : {}) };
    const response = await api.get('/vehicles', { params });
    return response.data;
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  async createVehicle(vehicleData: VehicleFormData): Promise<Vehicle> {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },

  async updateVehicle(id: string, vehicleData: Partial<VehicleFormData>): Promise<Vehicle> {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  async deleteVehicle(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },
};
