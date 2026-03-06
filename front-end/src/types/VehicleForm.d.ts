import type { Direction } from './Vehicle';
export type { Direction };

export interface VehicleFormData {
  immatriculation: string;
  marque: string;
  modele: string;
  direction: Direction;
}

export interface VehicleFormModalProps {
  onClose: () => void;
  vehicle?: Partial<VehicleFormData> & { _id?: string };
  mode?: 'create' | 'edit';
}
