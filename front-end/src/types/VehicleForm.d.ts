export type Direction = 'Rabat-Casa' | 'Meknès-Errachidia' | 'Marrakech-Agadir';

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
