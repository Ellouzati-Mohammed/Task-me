import { useState, useEffect } from 'react';
import { Save, X, Upload, Calendar, Users, MapPin, FileText } from 'lucide-react';
import '../Styles/TaskFormModal.css';
import type { TaskFormData, TypeTache, Specialite, Grade, DirectionAssociee } from '../types/TaskForm.d';

interface TaskFormModalProps {
  onClose: () => void;
  task?: TaskFormData & { id?: string }; // task optionnel pour mode édition
  mode?: 'create' | 'edit';
}

const typeTacheOptions = [
  { value: 'formateur' as TypeTache, label: 'Formateur' },
  { value: 'membre_jury' as TypeTache, label: 'Membre de jury' },
  { value: 'beneficiaire_formation' as TypeTache, label: 'Bénéficiaire de formation' },
  { value: 'observateur' as TypeTache, label: 'Observateur' },
  { value: 'concepteur_evaluation' as TypeTache, label: 'Concepteur d\'évaluation' }
];

const specialiteOptions = [
  { value: 'pedagogique' as Specialite, label: 'Pédagogique' },
  { value: 'orientation' as Specialite, label: 'Orientation' },
  { value: 'planification' as Specialite, label: 'Planification' },
  { value: 'services_financiers' as Specialite, label: 'Services financiers' }
];

const gradeOptions = [
  { value: 'A' as Grade, label: 'Grade A' },
  { value: 'B' as Grade, label: 'Grade B' },
  { value: 'C' as Grade, label: 'Grade C' }
];

const directionOptions = [
  { value: 'rabat_casa' as DirectionAssociee, label: 'Rabat - Casablanca' },
  { value: 'meknes_errachidia' as DirectionAssociee, label: 'Meknès - Errachidia' },
  { value: 'marrakech_agadir' as DirectionAssociee, label: 'Marrakech - Agadir' }
];

const initialFormData: TaskFormData = {
  nom: '',
  description: '',
  typeTache: 'formateur',
  dateDebut: '',
  dateFin: '',
  remuneree: false,
  specialites: [],
  grades: [],
  commune: false,
  necessiteVehicule: false,
  directionAssociee: 'rabat_casa',
  nombrePlaces: 1,
  urgent: false,
  lieu: ''
};

export function TaskFormModal({ onClose, task, mode = 'create' }: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskFormData>(task || initialFormData);

  // Bloquer le scroll de la page en arrière-plan
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(mode === 'edit' ? 'Updating task:' : 'Creating task:', formData);
    // TODO: API call to create/update task
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSpecialiteToggle = (specialite: Specialite) => {
    setFormData(prev => ({
      ...prev,
      specialites: prev.specialites.includes(specialite)
        ? prev.specialites.filter(s => s !== specialite)
        : [...prev.specialites, specialite]
    }));
  };

  const handleGradeToggle = (grade: Grade) => {
    setFormData(prev => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter(g => g !== grade)
        : [...prev.grades, grade]
    }));
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
                <label className="form-label">Direction associée *</label>
                <select
                  className="form-select"
                  value={formData.directionAssociee}
                  onChange={(e) => setFormData(prev => ({ ...prev, directionAssociee: e.target.value as DirectionAssociee }))}
                  required
                >
                  {directionOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Lieu</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.lieu}
                  onChange={(e) => setFormData(prev => ({ ...prev, lieu: e.target.value }))}
                  placeholder="Ex: Rabat, Salle A"
                />
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
              <label className="criteria-label">Spécialités requises</label>
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
              <label className="criteria-label">Grades acceptés</label>
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

              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={formData.commune}
                  onChange={(e) => setFormData(prev => ({ ...prev, commune: e.target.checked }))}
                />
                <span className="switch-text">Tâche commune</span>
              </label>

              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={formData.necessiteVehicule}
                  onChange={(e) => setFormData(prev => ({ ...prev, necessiteVehicule: e.target.checked }))}
                />
                <span className="switch-text">Nécessite un véhicule</span>
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
