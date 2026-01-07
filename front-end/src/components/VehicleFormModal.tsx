import { useState, useEffect } from 'react';
import { Save, X, Car } from 'lucide-react';
import '../Styles/VehicleFormModal.css';
import type { VehicleFormData, Direction, VehicleFormModalProps } from '../types/VehicleForm.d';
import api from '../services/api';

const directionOptions = [
  { value: 'Rabat-Casa' as Direction, label: 'Rabat-Casa' },
  { value: 'Meknès-Errachidia' as Direction, label: 'Meknès-Errachidia' },
  { value: 'Marrakech-Agadir' as Direction, label: 'Marrakech-Agadir' }
];

export function VehicleFormModal({ onClose, vehicle, mode = 'create' }: VehicleFormModalProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    immatriculation: vehicle?.immatriculation || '',
    marque: vehicle?.marque || '',
    modele: vehicle?.modele || '',
    direction: vehicle?.direction || 'Rabat-Casa'
  });

  // Bloquer le scroll de la page en arrière-plan
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'edit' && vehicle?._id) {
        // Mettre à jour un véhicule existant
        await api.put(`/vehicles/${vehicle._id}`, formData);
        console.log('Véhicule mis à jour avec succès');
      } else {
        // Créer un nouveau véhicule
        await api.post('/vehicles', formData);
        console.log('Véhicule créé avec succès');
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du véhicule:', error);
      alert('Erreur lors de l\'enregistrement du véhicule');
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="vehicle-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vehicle-form-header">
          <div>
            <h1 className="vehicle-form-title">
              {mode === 'edit' ? 'Modifier le véhicule' : 'Ajouter un nouveau véhicule'}
            </h1>
            <p className="vehicle-form-subtitle">
              {mode === 'edit' 
                ? 'Modifiez les informations du véhicule' 
                : 'Remplissez les informations pour ajouter un véhicule'}
            </p>
          </div>
          <div className="header-actions">
            <button type="button" className="cancel-button" onClick={handleCancel}>
              <X size={18} />
              Annuler
            </button>
            <button type="submit" form="vehicle-form" className="submit-button">
              <Save size={18} />
              {mode === 'edit' ? 'Enregistrer' : 'Ajouter le véhicule'}
            </button>
          </div>
        </div>

        <form id="vehicle-form" onSubmit={handleSubmit} className="vehicle-form">
          {/* Informations générales */}
          <div className="form-section">
            <h2 className="section-title">
              <Car size={18} />
              Informations du véhicule
            </h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Immatriculation *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.immatriculation}
                  onChange={(e) => setFormData(prev => ({ ...prev, immatriculation: e.target.value }))}
                  placeholder="Ex: 12345-A-1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Marque</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.marque}
                  onChange={(e) => setFormData(prev => ({ ...prev, marque: e.target.value }))}
                  placeholder="Ex: Dacia"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Modèle</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.modele}
                  onChange={(e) => setFormData(prev => ({ ...prev, modele: e.target.value }))}
                  placeholder="Ex: Logan"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Direction *</label>
                <select
                  className="form-select"
                  value={formData.direction}
                  onChange={(e) => setFormData(prev => ({ ...prev, direction: e.target.value as Direction }))}
                  required
                >
                  {directionOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
