export type VehicleStatus = 'disponible' | 'en_service' | 'maintenance';

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  registration: string;
  status: VehicleStatus;
  location: string;
  assignedTo?: number; // nombre d'auditeurs assignés
}

export interface VehicleStatusConfig {
  [key: string]: {
    label: string;
    className: string;
  };
}
