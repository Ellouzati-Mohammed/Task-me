import { useState, useEffect } from 'react';
import api from '../services/api';
import type { VehicleFormData, VehicleFormModalProps } from '../types/VehicleForm';

export function useVehicleForm({ onClose, vehicle, mode = 'create' }: VehicleFormModalProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    immatriculation: vehicle?.immatriculation || '',
    marque: vehicle?.marque || '',
    modele: vehicle?.modele || '',
    direction: vehicle?.direction || 'Rabat-Casa',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const updateField = <K extends keyof VehicleFormData>(key: K, value: VehicleFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'edit' && vehicle?._id) {
        await api.put(`/vehicles/${vehicle._id}`, formData);
      } else {
        await api.post('/vehicles', formData);
      }
      onClose();
    } catch {
      setError("Erreur lors de l'enregistrement du véhicule");
    }
  };

  return {
    formData,
    error,
    updateField,
    handleSubmit,
  };
}
