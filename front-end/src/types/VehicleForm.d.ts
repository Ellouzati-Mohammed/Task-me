export type VehicleStatus = 'disponible' | 'en_service' | 'maintenance';
export type VehicleType = 'berline' | 'utilitaire' | 'suv' | '4x4';
export type FuelType = 'essence' | 'diesel' | 'hybride' | 'electrique';

export interface VehicleFormData {
  name: string;
  model: string;
  registration: string;
  status: VehicleStatus;
  location: string;
  type: VehicleType;
  fuelType: FuelType;
  year: number;
  mileage?: number;
  capacity: number;
  color?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  insuranceExpiry?: string;
  notes?: string;
}

export interface VehicleFormModalProps {
  onClose: () => void;
  vehicle?: VehicleFormData & { id?: string };
  mode?: 'create' | 'edit';
}
