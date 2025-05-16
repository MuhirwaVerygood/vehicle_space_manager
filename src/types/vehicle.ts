
export interface Vehicle {
  id: string;
  userId: string;
  plateNumber: string;
  vehicleType: "car" | "motorcycle" | "truck";
  size: "small" | "medium" | "large";
  attributes: {
    color?: string;
    model?: string;
    [key: string]: any;
  };
  status?: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormData {
  plateNumber: string;
  vehicleType: "car" | "motorcycle" | "truck";
  size: "small" | "medium" | "large";
  attributes: {
    color?: string;
    model?: string;
    [key: string]: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  };
}
