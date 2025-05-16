
import api from './api';
import { ParkingSlot, SlotRequest, SlotRequestFormData, PaginatedResponse } from '../types/parking';

export const ParkingService = {
  // Parking Slot Services
  async getSlots(page = 1, limit = 10, search?: string, onlyAvailable = false): Promise<PaginatedResponse<ParkingSlot>> {
    const params = { 
      page, 
      limit, 
      ...(search ? { search } : {}),
      ...(onlyAvailable ? { status: 'available' } : {})
    };
    const response = await api.get('/parking-slots', { params });
    return response.data;
  },

  async getSlotById(id: string): Promise<ParkingSlot> {
    const response = await api.get(`/parking-slots/${id}`);
    return response.data;
  },

  async createSlots(slotsData: { 
    count: number, 
    prefix: string,
    vehicleType: string, 
    size: string, 
    location: string 
  }): Promise<ParkingSlot[]> {
    const response = await api.post('/parking-slots/bulk', slotsData);
    return response.data;
  },

  async updateSlot(id: string, slotData: Partial<ParkingSlot>): Promise<ParkingSlot> {
    const response = await api.put(`/parking-slots/${id}`, slotData);
    return response.data;
  },

  async deleteSlot(id: string): Promise<void> {
    await api.delete(`/parking-slots/${id}`);
  },

  // Slot Request Services
  async getSlotRequests(page = 1, limit = 10, search?: string, status?: string): Promise<PaginatedResponse<SlotRequest>> {
    const params = { 
      page, 
      limit, 
      ...(search ? { search } : {}),
      ...(status ? { status } : {})
    };
    const response = await api.get('/slot-requests', { params });
    return response.data;
  },

  async createSlotRequest(requestData: SlotRequestFormData): Promise<SlotRequest> {
    const response = await api.post('/slot-requests', requestData);
    return response.data;
  },

  async updateSlotRequest(id: string, requestData: Partial<SlotRequestFormData>): Promise<SlotRequest> {
    const response = await api.put(`/slot-requests/${id}`, requestData);
    return response.data;
  },

  async deleteSlotRequest(id: string): Promise<void> {
    await api.delete(`/slot-requests/${id}`);
  },

  async approveSlotRequest(id: string, slotId?: string): Promise<SlotRequest> {
    const response = await api.put(`/slot-requests/${id}/approve`, { slotId });
    return response.data;
  },

  async rejectSlotRequest(id: string, reason?: string): Promise<SlotRequest> {
    const response = await api.put(`/slot-requests/${id}/reject`, { reason });
    return response.data;
  }
};
