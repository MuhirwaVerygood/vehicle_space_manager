import { ParkingSlot, SlotRequest, SlotRequestFormData, PaginatedResponse } from '../types/parking';
import { authorizedAPI } from './api';

export const ParkingService = {
  // Parking Slot Services
  async getSlots(
    page = 1,
    limit = 10,
    search?: string,
    p0?: string | boolean,
    signal?: AbortSignal,
    onlyAvailable = false
  ): Promise<PaginatedResponse<ParkingSlot>> {
    const params = {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(onlyAvailable ? { status: 'AVAILABLE' } : {}),
    };
    const response = await authorizedAPI.get('/parking-slots', { params, signal });
    return response.data;
  },

  async getSlotById(id: string): Promise<ParkingSlot> {
    const response = await authorizedAPI.get(`/parking-slots/${id}`);
    return response.data;
  },

  async createSlot(slotData: {
    vehicleType: string;
    size: string;
    location: string;
    status?: string;
  }): Promise<ParkingSlot> {
    const response = await authorizedAPI.post('/parking-slots', slotData);
    return response.data.data;
  },

  async createSlots(slotsData: {
    count: number;
    prefix: string;
    vehicleType: string;
    size: string;
    location: string;
  }): Promise<ParkingSlot[]> {
    const response = await authorizedAPI.post('/parking-slots/bulk', slotsData);
    return response.data.data;
  },

  async updateSlot(id: string, slotData: Partial<ParkingSlot>): Promise<ParkingSlot> {
    const response = await authorizedAPI.get(`/parking-slots/${id}`);
    return response.data;
  },

  async deleteSlot(id: string): Promise<void> {
    await authorizedAPI.delete(`/parking-slots/${id}`);
  },

  // Slot Request Services
  async getSlotRequests(
    page = 1,
    limit = 10,
    search?: string,
    status?: string | boolean
  ): Promise<PaginatedResponse<SlotRequest>> {
    const params = {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    };
    const response = await authorizedAPI.get('/slot-requests', { params });
    return response.data.data;
  },

  async createSlotRequest(requestData: SlotRequestFormData): Promise<SlotRequest> {
    const response = await authorizedAPI.post('/slot-requests', requestData);
    return response.data.data;
  },

  async updateSlotRequest(id: string, requestData: Partial<SlotRequestFormData>): Promise<SlotRequest> {
    const response = await authorizedAPI.put(`/slot-requests/${id}`, requestData);
    return response.data.data;
  },

  async deleteSlotRequest(id: string): Promise<void> {
    await authorizedAPI.delete(`/slot-requests/${id}`);
  },

  async approveSlotRequest(id: string, slotId?: string): Promise<SlotRequest> {
    const response = await authorizedAPI.put(`/slot-requests/${id}/approve`, { slotId });
    return response.data.data;
  },

  async rejectSlotRequest(id: string, reason?: string): Promise<SlotRequest> {
    const response = await authorizedAPI.put(`/slot-requests/${id}/reject`, { reason });
    return response.data.data;
  },

  // New method to get rejection reason by slot request ID
  async getRejectionReasonBySlotRequestId(id: string): Promise<string | null> {
    try {
      const response = await authorizedAPI.get(`/slot-requests/${id}/reason`);
      console.log(response.data);
      
      return response.data.data.rejectionReason;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch rejection reason');
    }
  },
};