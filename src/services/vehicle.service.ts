import { authorizedAPI } from './api';
import { Vehicle, VehicleFormData, PaginatedResponse } from '../types/vehicle';

export const VehicleService = {
  async getVehicles(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Vehicle>> {
    const params = { page, limit, ...(search ? { search } : {}) };
    const response = await authorizedAPI.get('/vehicles', { params });    
    return response.data.data;
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    const response = await authorizedAPI.get(`/vehicles/${id}`);
    return response.data.data;
  },

  async createVehicle(vehicleData: VehicleFormData): Promise<Vehicle> {   
    const response = await authorizedAPI.post('/vehicles', vehicleData);
    return response.data.data;
  },

  async updateVehicle(id: string, vehicleData: Partial<VehicleFormData>): Promise<Vehicle> {
    const response = await authorizedAPI.put(`/vehicles/${id}`, vehicleData);
    return response.data.data;
  },

  async deleteVehicle(id: string): Promise<void> {
    await authorizedAPI.delete(`/vehicles/${id}`);
  },

  async approveVehicle(id: string): Promise<void> {
    await authorizedAPI.patch(`/vehicles/${id}/approve`);
  },

  async rejectVehicle(id: string, reason: string): Promise<void> {
    await authorizedAPI.patch(`/vehicles/${id}/reject`, { reason });
  },
};