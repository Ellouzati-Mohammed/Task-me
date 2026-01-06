export type Direction = 'Rabat-Casa' | 'Meknès-Errachidia' | 'Marrakech-Agadir';

export interface Vehicle {
  _id: string;
  immatriculation: string;
  marque?: string;
  modele?: string;
  direction?: Direction;
}
