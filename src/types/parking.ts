
export interface ParkingSlot {
  id: string;
  slotNumber: string;
  vehicleType: "car" | "motorcycle" | "truck";
  size: "small" | "medium" | "large";
  location: string;
  status: "available" | "occupied" | "reserved" | "maintenance";
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
  userName?: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleType: string;
  preferredLocation: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  rejectionReason?: string;
  assignedSlot?: {
    id: string;
    slotNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SlotRequestFormData {
  vehicleId: string;
  preferredLocation: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  [x: string]: SetStateAction<number>;
  [x: string]: SetStateAction<SlotRequest[]>;
  data: T[];
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  };
}
