import { Save, X, Car } from 'lucide-react';
import '../Styles/VehicleFormModal.css';
import type { Direction, VehicleFormModalProps } from '../types/VehicleForm';
import { useVehicleForm } from '../hooks/useVehiculeForm';

const directionOptions = [
  { value: 'Rabat-Casa' as Direction, label: 'Rabat-Casa' },
  { value: 'Meknès-Errachidia' as Direction, label: 'Meknès-Errachidia' },
  { value: 'Marrakech-Agadir' as Direction, label: 'Marrakech-Agadir' }
];

export function VehicleFormModal({ onClose, vehicle, mode = 'create' }: VehicleFormModalProps) {
  const { formData, error, updateField, handleSubmit } = useVehicleForm({ onClose, vehicle, mode });

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
            <button type="button" className="cancel-button" onClick={onClose}>
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
          {error && (
            <div style={{ padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#dc2626', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}
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
                  onChange={(e) => updateField('immatriculation', e.target.value)}
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
                  onChange={(e) => updateField('marque', e.target.value)}
                  placeholder="Ex: Dacia"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Modèle</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.modele}
                  onChange={(e) => updateField('modele', e.target.value)}
                  placeholder="Ex: Logan"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Direction *</label>
                <select
                  className="form-select"
                  value={formData.direction}
                  onChange={(e) => updateField('direction', e.target.value as Direction)}
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
