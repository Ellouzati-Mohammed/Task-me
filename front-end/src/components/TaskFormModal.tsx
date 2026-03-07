import { Save, X, Upload, Calendar, Users, MapPin, FileText } from 'lucide-react';
import '../Styles/TaskFormModal.css';
import type { TypeTache, DirectionAssociee, TaskFormModalProps } from '../types/TaskForm.d';
import { useTaskForm } from '../hooks/useTaskForm';

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

export function TaskFormModal({ onClose, task, mode = 'create' }: TaskFormModalProps) {
  const {
    formData,
    vehicles,
    loadingVehicles,
    errors,
    selectedFile,
    existingFile,
    setSelectedFile,
    handleSubmit,
    handleSpecialiteToggle,
    handleGradeToggle,
    updateField,
    updateDirection,
    updateTypeTache,
  } = useTaskForm({ onClose, task, mode });

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
            <button type="button" className="cancel-button" onClick={onClose}>
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
                  onChange={(e) => updateField('nom', e.target.value)}
                  placeholder="Ex: Formation React Avancé"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
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
                  onChange={(e) => updateTypeTache(e.target.value as TypeTache)}
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
                  onChange={(e) => updateField('nombrePlaces', parseInt(e.target.value))}
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
                        onChange={(e) => updateField('necessiteVehicule', e.target.checked)}
                      />
                      <span className="switch-text">Nécessite un véhicule</span>
                    </label>
                  </div>

                  <div className="form-group direction-group">
                    <label className="form-label">Direction associée *</label>
                    <select
                      className={`form-select ${!formData.necessiteVehicule ? 'disabled' : ''}`}
                      value={formData.directionAssociee}
                      onChange={(e) => updateDirection(e.target.value as DirectionAssociee)}
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
                          onChange={(e) => updateField('vehiculeId', e.target.value)}
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
                  onChange={(e) => updateField('dateDebut', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date de fin *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateFin}
                  onChange={(e) => updateField('dateFin', e.target.value)}
                  min={formData.dateDebut || new Date().toISOString().split('T')[0]}
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
                  onChange={(e) => updateField('urgent', e.target.checked)}
                />
                <span className="switch-text">Tâche urgente</span>
              </label>

              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={formData.remuneree}
                  onChange={(e) => updateField('remuneree', e.target.checked)}
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
              {existingFile && !selectedFile && (
                <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <p style={{ margin: '0 0 8px 0', color: '#1e40af', fontWeight: '500' }}>
                    📎 Fichier actuel: {existingFile}
                  </p>
                  <a 
                    href={`http://localhost:5000/api/tasks/download/${existingFile}`}
                    download
                    style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '14px' }}
                  >
                    Télécharger le fichier
                  </a>
                </div>
              )}
              
              <input
                type="file"
                id="file-input"
                className="file-input"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-input" className="file-label">
                <Upload size={20} />
                <span>
                  {selectedFile 
                    ? 'Changer le fichier' 
                    : existingFile 
                      ? 'Remplacer le fichier' 
                      : 'Cliquez pour télécharger un fichier'}
                </span>
              </label>
              {selectedFile && (
                <p className="file-hint" style={{ color: '#10b981', marginTop: '8px', fontWeight: '500' }}>
                  ✓ Fichier sélectionné: {selectedFile.name}
                </p>
              )}
              <p className="file-hint">Format accepté: PDF uniquement (max 5MB)</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
