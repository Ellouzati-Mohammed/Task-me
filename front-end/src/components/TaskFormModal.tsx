import { useState, useEffect } from 'react';
import { Save, X, Upload, Calendar, Users, MapPin, FileText } from 'lucide-react';
import '../Styles/TaskFormModal.css';
import type { TaskFormData, TypeTache, DirectionAssociee, TaskFormModalProps } from '../types/TaskForm.d';
import type { Vehicle } from '../types/Vehicle.d';
import api from '../services/api';

const typeTacheOptions = [
  { value: 'Formateur' as TypeTache, label: 'Formateur' },
  { value: 'Membre de Jury' as TypeTache, label: 'Membre de jury' },
  { value: 'Bénéficiaire de formation' as TypeTache, label: 'Bénéficiaire de formation' },
  { value: 'Observateur' as TypeTache, label: 'Observateur' },
  { value: 'Concepteur' as TypeTache, label: 'Concepteur' }
];

const directionOptions = [
  { value: 'Rabat-Casa' as DirectionAssociee, label: 'Rabat - Casablanca' },
  { value: 'Meknès-Errachidia' as DirectionAssociee, label: 'Meknès - Errachidia' },
  { value: 'Marrakech-Agadir' as DirectionAssociee, label: 'Marrakech - Agadir' }
];

const initialFormData: TaskFormData = {
  nom: '',
  description: '',
  typeTache: 'Formateur',
  statutTache: 'Ouverte',
  dateDebut: '',
  dateFin: '',
  dateCreation: new Date().toISOString().split('T')[0],
  remuneree: false,
  specialites: [],
  grades: [],
  commune: false,
  necessiteVehicule: false,
  fichierJoint: '',
  nombrePlaces: 1,
  urgent: false
};

export function TaskFormModal({ onClose, task, mode = 'create' }: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskFormData>(task || initialFormData);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Bloquer le scroll de la page en arrière-plan
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Charger les véhicules quand la direction change
  useEffect(() => {
    const fetchVehicles = async () => {
      if (formData.necessiteVehicule && formData.directionAssociee) {
        try {
          setLoadingVehicles(true);
          const response = await api.get('/vehicles');
          const allVehicles = response.data.data || response.data;
          // Filtrer les véhicules par direction
          const filteredVehicles = allVehicles.filter(
            (v: Vehicle) => v.direction === formData.directionAssociee
          );
          setVehicles(filteredVehicles);
        } catch (error) {
          console.error('Erreur lors de la récupération des véhicules:', error);
        } finally {
          setLoadingVehicles(false);
        }
      } else {
        setVehicles([]);
      }
    };

    fetchVehicles();
  }, [formData.necessiteVehicule, formData.directionAssociee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'edit' && task?.id) {
        await api.put(`/tasks/${task.id}`, formData);
        console.log('Tâche mise à jour avec succès');
      } else {
        await api.post('/tasks', formData);
        console.log('Tâche créée avec succès');
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la tâche:', error);
      alert('Erreur lors de l\'enregistrement de la tâche');
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-form-header">
          <div>
            <h1 className="task-form-title">
              {mode === 'edit' ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
            </h1>
            <p className="task-form-subtitle">
              {mode === 'edit' 
                ? 'Modifiez les informations de la tâche' 
                : 'Remplissez les informations pour créer une tâche'}
            </p>
          </div>
          <div className="header-actions">
            <button type="button" className="cancel-button" onClick={handleCancel}>
              <X size={18} />
              Annuler
            </button>
            <button type="submit" form="task-form" className="submit-button">
              <Save size={18} />
              {mode === 'edit' ? 'Enregistrer' : 'Créer la tâche'}
            </button>
          </div>
        </div>

        <form id="task-form" onSubmit={handleSubmit} className="task-form">
          {/* Informations générales */}
          <div className="form-section">
            <h2 className="section-title">
              <FileText size={18} />
              Informations générales
            </h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Nom de la tâche *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  placeholder="Ex: Formation React Avancé"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez la tâche en détail..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type de tâche *</label>
                <select
                  className="form-select"
                  value={formData.typeTache}
                  onChange={(e) => setFormData(prev => ({ ...prev, typeTache: e.target.value as TypeTache }))}
                  required
                >
                  {typeTacheOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nombre de places *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.nombrePlaces}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombrePlaces: parseInt(e.target.value) }))}
                  min={1}
                  required
                />
              </div>

              <div className="form-group full-width">
                <div className="vehicle-section">
                  <div className="vehicle-checkbox-group">
                    <label className="form-label">Véhicule</label>
                    <label className="switch-label">
                      <input
                        type="checkbox"
                        checked={formData.necessiteVehicule}
                        onChange={(e) => setFormData(prev => ({ ...prev, necessiteVehicule: e.target.checked }))}
                      />
                      <span className="switch-text">Nécessite un véhicule</span>
                    </label>
                  </div>

                  <div className="form-group direction-group">
                    <label className="form-label">Direction associée *</label>
                    <select
                      className={`form-select ${!formData.necessiteVehicule ? 'disabled' : ''}`}
                      value={formData.directionAssociee}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        directionAssociee: e.target.value as DirectionAssociee,
                        vehicule: '' // Reset vehicule quand on change de direction
                      }))}
                      disabled={!formData.necessiteVehicule}
                      required
                    >
                      {directionOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {!formData.necessiteVehicule && (
                      <p className="form-hint">Activez "Nécessite un véhicule" pour sélectionner une direction</p>
                    )}
                  </div>

                  {formData.necessiteVehicule && (
                    <div className="form-group direction-group">
                      <label className="form-label">Sélectionner un véhicule</label>
                      {loadingVehicles ? (
                        <p className="form-hint">Chargement des véhicules...</p>
                      ) : vehicles.length > 0 ? (
                        <select
                          className="form-select"
                          value={formData.vehicule || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, vehicule: e.target.value }))}
                        >
                          <option value="">Aucun véhicule sélectionné</option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle._id} value={vehicle._id}>
                              {vehicle.immatriculation} - {vehicle.marque || 'N/A'} {vehicle.modele || ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="form-hint">Aucun véhicule disponible pour cette direction</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="form-section">
            <h2 className="section-title">
              <Calendar size={18} />
              Période
            </h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date de début *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateDebut: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date de fin *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateFin}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateFin: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Critères de sélection */}
          <div className="form-section">
            <h2 className="section-title">
              <Users size={18} />
              Critères de sélection des auditeurs
            </h2>
            
            <div className="criteria-group">
              <label className="criteria-label">Spécialités requises (séparées par virgule)</label>
              <input
                type="text"
                className="form-input"
                value={formData.specialites.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  specialites: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')
                }))}
                placeholder="Ex: Pédagogique, Orientation"
              />
            </div>

            <div className="criteria-group">
              <label className="criteria-label">Grades acceptés (séparés par virgule)</label>
              <input
                type="text"
                className="form-input"
                value={formData.grades.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  grades: e.target.value.split(',').map(g => g.trim()).filter(g => g !== '')
                }))}
                placeholder="Ex: A, B, C"
              />
            </div>
          </div>

          {/* Options supplémentaires */}
          <div className="form-section">
            <h2 className="section-title">
              <MapPin size={18} />
              Options supplémentaires
            </h2>
            
            <div className="options-grid">
              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={formData.urgent}
                  onChange={(e) => setFormData(prev => ({ ...prev, urgent: e.target.checked }))}
                />
                <span className="switch-text">Tâche urgente</span>
              </label>

              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={formData.remuneree}
                  onChange={(e) => setFormData(prev => ({ ...prev, remuneree: e.target.checked }))}
                />
                <span className="switch-text">Tâche rémunérée</span>
              </label>
            </div>
          </div>

          {/* Fichier joint */}
          <div className="form-section">
            <h2 className="section-title">
              <Upload size={18} />
              Fichier joint *
            </h2>
            <div className="form-group">
              <label className="form-label">Chemin du fichier</label>
              <input
                type="text"
                className="form-input"
                value={formData.fichierJoint}
                onChange={(e) => setFormData(prev => ({ ...prev, fichierJoint: e.target.value }))}
                placeholder="Ex: /uploads/task-document.pdf"
                required
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
