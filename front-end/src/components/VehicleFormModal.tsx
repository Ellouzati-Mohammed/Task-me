import { useState, useEffect } from 'react';
import { Save, X, Car, MapPin, Settings, FileText } from 'lucide-react';
import '../Styles/VehicleFormModal.css';
import type { VehicleFormData, VehicleStatus, VehicleType, FuelType, VehicleFormModalProps } from '../types/VehicleForm.d';

const statusOptions = [
  { value: 'disponible' as VehicleStatus, label: 'Disponible' },
  { value: 'en_service' as VehicleStatus, label: 'En service' },
  { value: 'maintenance' as VehicleStatus, label: 'En maintenance' }
];

const typeOptions = [
  { value: 'berline' as VehicleType, label: 'Berline' },
  { value: 'utilitaire' as VehicleType, label: 'Utilitaire' },
  { value: 'suv' as VehicleType, label: 'SUV' },
  { value: '4x4' as VehicleType, label: '4x4' }
];

const fuelTypeOptions = [
  { value: 'essence' as FuelType, label: 'Essence' },
  { value: 'diesel' as FuelType, label: 'Diesel' },
  { value: 'hybride' as FuelType, label: 'Hybride' },
  { value: 'electrique' as FuelType, label: 'Électrique' }
];

const locationOptions = [
  { value: 'Rabat', label: 'Rabat' },
  { value: 'Casablanca', label: 'Casablanca' },
  { value: 'Meknès', label: 'Meknès' },
  { value: 'Errachidia', label: 'Errachidia' },
  { value: 'Marrakech', label: 'Marrakech' },
  { value: 'Agadir', label: 'Agadir' }
];

const initialFormData: VehicleFormData = {
  name: '',
  model: '',
  registration: '',
  status: 'disponible',
  location: 'Rabat',
  type: 'berline',
  fuelType: 'diesel',
  year: new Date().getFullYear(),
  mileage: 0,
  capacity: 5,
  color: '',
  lastMaintenance: '',
  nextMaintenance: '',
  insuranceExpiry: '',
  notes: ''
};

export function VehicleFormModal({ onClose, vehicle, mode = 'create' }: VehicleFormModalProps) {
  const [formData, setFormData] = useState<VehicleFormData>(vehicle || initialFormData);

  // Bloquer le scroll de la page en arrière-plan
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(mode === 'edit' ? 'Updating vehicle:' : 'Creating vehicle:', formData);
    // TODO: API call to create/update vehicle
    onClose();
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
                <label className="form-label">Nom du véhicule *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Dacia Logan"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Modèle *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Ex: Logan"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Immatriculation *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.registration}
                  onChange={(e) => setFormData(prev => ({ ...prev, registration: e.target.value }))}
                  placeholder="Ex: 12345-A-1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Année *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type de véhicule *</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as VehicleType }))}
                  required
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Carburant *</label>
                <select
                  className="form-select"
                  value={formData.fuelType}
                  onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value as FuelType }))}
                  required
                >
                  {fuelTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Couleur</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Ex: Blanc"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacité (places) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                  min={2}
                  max={9}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kilométrage</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.mileage}
                  onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                  min={0}
                  placeholder="Ex: 50000"
                />
              </div>
            </div>
          </div>

          {/* Localisation et statut */}
          <div className="form-section">
            <h2 className="section-title">
              <MapPin size={18} />
              Localisation et statut
            </h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Localisation *</label>
                <select
                  className="form-select"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                >
                  {locationOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Statut *</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as VehicleStatus }))}
                  required
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Maintenance et assurance */}
          <div className="form-section">
            <h2 className="section-title">
              <Settings size={18} />
              Maintenance et assurance
            </h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Dernière maintenance</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.lastMaintenance}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastMaintenance: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prochaine maintenance</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.nextMaintenance}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextMaintenance: e.target.value }))}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Expiration assurance</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.insuranceExpiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, insuranceExpiry: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="form-section">
            <h2 className="section-title">
              <FileText size={18} />
              Notes additionnelles
            </h2>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ajoutez des notes ou des commentaires..."
                rows={4}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
