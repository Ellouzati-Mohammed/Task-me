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

const specialiteOptions = [
  { value: 'pedagogique', label: 'Pédagogique' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'planification', label: 'Planification' },
  { value: 'services_financiers', label: 'Services financiers' }
];

const gradeOptions = [
  { value: 'A', label: 'Grade A' },
  { value: 'B', label: 'Grade B' },
  { value: 'C', label: 'Grade C' }
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
  statutTache: 'CREEE',
  dateDebut: '',
  dateFin: '',
  dateCreation: new Date().toISOString().split('T')[0],
  remuneree: false,
  specialites: [],
  grades: [],
  necessiteVehicule: false,
  directionAssociee: 'Rabat-Casa',
  nombrePlaces: 1,
  urgent: false
};

export function TaskFormModal({ onClose, task, mode = 'create' }: TaskFormModalProps) {
  // Initialiser les données du formulaire en mappant task si présent
  const getInitialFormData = (): TaskFormData => {
    if (task && mode === 'edit') {
      return {
        nom: task.nom || '',
        description: task.description || '',
        typeTache: task.typeTache || 'Formateur',
        statutTache: task.statutTache || 'CREEE',
        dateDebut: task.dateDebut ? task.dateDebut.split('T')[0] : '',
        dateFin: task.dateFin ? task.dateFin.split('T')[0] : '',
        dateCreation: task.dateCreation ? task.dateCreation.split('T')[0] : new Date().toISOString().split('T')[0],
        remuneree: task.remuneree || false,
        specialites: task.specialites || [],
        grades: task.grades || [],
        necessiteVehicule: task.necessiteVehicule || false,
        vehiculeId: task.vehiculeId || '',
        directionAssociee: task.directionAssociee || 'Rabat-Casa',
        nombrePlaces: task.nombrePlaces || 1,
        urgent: task.urgent || false
      };
    }
    return initialFormData;
  };

  const [formData, setFormData] = useState<TaskFormData>(getInitialFormData());
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [errors, setErrors] = useState<{ grades?: string; specialites?: string; date?: string }>({});

  // Bloquer le scroll de la page en arrière-plan
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Charger les véhicules disponibles quand la direction ou les dates changent
  useEffect(() => {
    const fetchVehicles = async () => {
      if (formData.necessiteVehicule && formData.directionAssociee && formData.dateDebut && formData.dateFin) {
        try {
          setLoadingVehicles(true);
          const response = await api.get('/vehicles/available', {
            params: {
              direction: formData.directionAssociee,
              dateDebut: formData.dateDebut,
              dateFin: formData.dateFin
            }
          });
          const availableVehicles = response.data.data || [];
          // Filtrer uniquement les véhicules disponibles
          const onlyAvailable = availableVehicles.filter((v: { isAvailable?: boolean }) => v.isAvailable);
          setVehicles(onlyAvailable);
        } catch (error) {
          console.error('Erreur lors de la récupération des véhicules:', error);
          setVehicles([]);
        } finally {
          setLoadingVehicles(false);
        }
      } else {
        setVehicles([]);
      }
    };

    fetchVehicles();
  }, [formData.necessiteVehicule, formData.directionAssociee, formData.dateDebut, formData.dateFin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation : au moins un grade et une spécialité
    const newErrors: { grades?: string; specialites?: string; date?: string } = {};

    if (formData.grades.length === 0) {
      newErrors.grades = 'Veuillez sélectionner au moins un grade';
    }

    if (formData.specialites.length === 0) {
      newErrors.specialites = 'Veuillez sélectionner au moins une spécialité';
    }

    // Validation date début <= date fin
    if (formData.dateDebut && formData.dateFin) {
      const d1 = new Date(formData.dateDebut);
      const d2 = new Date(formData.dateFin);
      if (d1 > d2) {
        newErrors.date = 'La date de début doit être antérieure ou égale à la date de fin';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Réinitialiser les erreurs si tout est valide
    setErrors({});

    try {
      // Préparer les données à envoyer en mappant vehiculeId vers vehicule
      const { vehiculeId, ...restData } = formData;
      const dataToSend = {
        ...restData,
        vehicule: vehiculeId || null
      };

      const taskId = (task as { _id?: string; id?: string })?._id || (task as { _id?: string; id?: string })?.id;
      if (mode === 'edit' && taskId) {
        await api.put(`/tasks/${taskId}`, dataToSend);
        console.log('Tâche mise à jour avec succès');
      } else {
        await api.post('/tasks', dataToSend);
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

  const handleSpecialiteToggle = (specialite: string) => {
    setFormData(prev => ({
      ...prev,
      specialites: prev.specialites.includes(specialite)
        ? prev.specialites.filter(s => s !== specialite)
        : [...prev.specialites, specialite]
    }));
    // Effacer l'erreur quand l'utilisateur sélectionne une spécialité
    if (errors.specialites) {
      setErrors(prev => ({ ...prev, specialites: undefined }));
    }
  };

  const handleGradeToggle = (grade: string) => {
    setFormData(prev => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter(g => g !== grade)
        : [...prev.grades, grade]
    }));
    // Effacer l'erreur quand l'utilisateur sélectionne un grade
    if (errors.grades) {
      setErrors(prev => ({ ...prev, grades: undefined }));
    }
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

        {/* Messages d'erreur */}
        {(errors.grades || errors.specialites || errors.date) && (
          <div className="error-banner">
            {errors.specialites && (
              <p className="error-message">• {errors.specialites}</p>
            )}
            {errors.grades && (
              <p className="error-message">• {errors.grades}</p>
            )}
            {errors.date && (
              <p className="error-message">• {errors.date}</p>
            )}
          </div>
        )}

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
                        vehiculeId: '' // Reset vehicule quand on change de direction
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
                      {!formData.dateDebut || !formData.dateFin ? (
                        <p className="form-hint" style={{ color: '#f59e0b' }}>
                          Veuillez sélectionner les dates de début et de fin pour voir les véhicules disponibles
                        </p>
                      ) : loadingVehicles ? (
                        <p className="form-hint">Chargement des véhicules disponibles...</p>
                      ) : vehicles.length > 0 ? (
                        <select
                          className="form-select"
                          value={formData.vehiculeId || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, vehiculeId: e.target.value }))}
                        >
                          <option value="">Aucun véhicule sélectionné</option>
                          {vehicles.map(vehicle => (
                            <option key={vehicle._id} value={vehicle._id}>
                              {vehicle.immatriculation} - {vehicle.marque || 'N/A'} {vehicle.modele || ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="form-hint">Aucun véhicule disponible pour cette direction et ces dates</p>
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
              <label className="criteria-label">Spécialités requises *</label>
              <div className="checkbox-group">
                {specialiteOptions.map(option => (
                  <label key={option.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.specialites.includes(option.value)}
                      onChange={() => handleSpecialiteToggle(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="criteria-group">
              <label className="criteria-label">Grades acceptés *</label>
              <div className="checkbox-group">
                {gradeOptions.map(option => (
                  <label key={option.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.grades.includes(option.value)}
                      onChange={() => handleGradeToggle(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
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
              Document joint (optionnel)
            </h2>
            <div className="file-upload">
              <input
                type="file"
                id="file-input"
                className="file-input"
                accept=".pdf"
                onChange={(e) => setFormData(prev => ({ ...prev, fichierJoint: e.target.files?.[0] }))}
              />
              <label htmlFor="file-input" className="file-label">
                <Upload size={20} />
                <span>Cliquez pour télécharger un fichier PDF</span>
              </label>
              <p className="file-hint">Format accepté: PDF uniquement</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
