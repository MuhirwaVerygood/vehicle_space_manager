export interface ParkingSlot {
  id: string;
  slotNumber: string;
  vehicleType: 'CAR' | 'MOTORCYCLE' | 'TRUCK';
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  location: 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    userId: string;
    vehicleId: string;
    vehiclePlate: string;
  };
}

export interface SlotRequest {
  id: string;
  userId: string;
  userName: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleType: 'CAR' | 'MOTORCYCLE' | 'TRUCK';
  preferredLocation?: 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';
  startDate?: string;
  endDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  assignedSlot?: { id: string; slotNumber: string };
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlotRequestFormData {
  vehicleId: string;
  preferredLocation?: 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';
  startDate?: string;
  endDate?: string;
  userId: string | any;
  notes?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  data?: { items: T[]; total: number };
}

