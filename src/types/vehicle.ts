export enum VehicleType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  TRUCK = 'TRUCK',
}

export enum Size {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

export interface Vehicle {
  id: string;
  userId: string;
  plateNumber: string;
  vehicleType: VehicleType;
  size: Size;
  attributes?: {
    color?: string;
    model?: string;
    [key: string]: any;
  };
  status?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormData {
  plateNumber: string;
  vehicleType: VehicleType;
  size: Size;
  attributes?: {
    color?: string;
    model?: string;
    [key: string]: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}