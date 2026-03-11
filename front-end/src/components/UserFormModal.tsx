import { Save, X, Upload, User as UserIcon, Briefcase } from 'lucide-react';
import '../Styles/UserFormModal.css';
import type { UserGrade, Specialite, UserFormModalProps } from '../types/UserForm.d';
import { useUserForm } from '../hooks/useUserForm';

const gradeOptions = [
  { value: 'A' as UserGrade, label: 'Grade A' },
  { value: 'B' as UserGrade, label: 'Grade B' },
  { value: 'C' as UserGrade, label: 'Grade C' }
];

const specialiteOptions = [
  { value: 'pedagogique' as Specialite, label: 'Pédagogique' },
  { value: 'orientation' as Specialite, label: 'Orientation' },
  { value: 'planification' as Specialite, label: 'Planification' },
  { value: 'services_financiers' as Specialite, label: 'Services financiers' }
];

export function UserFormModal({ onClose, user, mode = 'create' }: UserFormModalProps) {
  const { userType, formData, error, updateField, handleUserTypeChange, handleSubmit } =
    useUserForm({ onClose, user, mode });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-form-header">
          <div>
            <h1 className="user-form-title">
              {mode === 'edit' ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
            </h1>
            <p className="user-form-subtitle">
              {mode === 'edit' 
                ? 'Modifiez les informations de l\'utilisateur' 
                : 'Remplissez les informations pour créer un utilisateur'}
            </p>
          </div>
          <div className="header-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              <X size={18} />
              Annuler
            </button>
            <button type="submit" form="user-form" className="submit-button">
              <Save size={18} />
              {mode === 'edit' ? 'Enregistrer' : 'Créer l\'utilisateur'}
            </button>
          </div>
        </div>

        <form id="user-form" onSubmit={handleSubmit} className="user-form">
          {/* Message d'erreur */}
          {error && (
            <div className="error-message" style={{
              padding: '12px',
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              color: '#dc2626',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Type d'utilisateur (seulement en mode création) */}
          {mode === 'create' && (
            <div className="form-section">
              <h2 className="section-title">
                <UserIcon size={18} />
                Type d'utilisateur
              </h2>
              <div className="user-type-selector">
                <label className={`user-type-option ${userType === 'coordinateur' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="userType"
                    value="coordinateur"
                    checked={userType === 'coordinateur'}
                    onChange={(e) => handleUserTypeChange(e.target.value as 'coordinateur' | 'auditeur')}
                  />
                  <span className="type-label">Coordinateur</span>
                </label>
                <label className={`user-type-option ${userType === 'auditeur' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="userType"
                    value="auditeur"
                    checked={userType === 'auditeur'}
                    onChange={(e) => handleUserTypeChange(e.target.value as 'coordinateur' | 'auditeur')}
                  />
                  <span className="type-label">Auditeur</span>
                </label>
              </div>
            </div>
          )}

          {/* Informations personnelles */}
          <div className="form-section">
            <h2 className="section-title">
              <UserIcon size={18} />
              Informations personnelles
            </h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Prénom *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.prenom}
                  onChange={(e) => updateField('prenom', e.target.value)}
                  placeholder="Ex: Ahmed"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nom}
                  onChange={(e) => updateField('nom', e.target.value)}
                  placeholder="Ex: Benali"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="Ex: ahmed.benali@taskme.ma"
                  required
                />
              </div>

              {mode === 'create' && (
                <div className="form-group full-width">
                  <label className="form-label">Mot de passe *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.motdePasse}
                    onChange={(e) => updateField('motdePasse', e.target.value)}
                    placeholder="Mot de passe"
                    required={mode === 'create'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="form-section">
            <h2 className="section-title">
              <Briefcase size={18} />
              Informations professionnelles
            </h2>
            <div className="form-grid">
              {userType === 'auditeur' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Grade *</label>
                    <select
                      className="form-select"
                      value={formData.grade}
                      onChange={(e) => updateField('grade', e.target.value as UserGrade)}
                      required
                    >
                      <option value="">Sélectionner un grade</option>
                      {gradeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Spécialité *</label>
                    <select
                      className="form-select"
                      value={formData.specialite}
                      onChange={(e) => updateField('specialite', e.target.value as Specialite)}
                      required
                    >
                      <option value="">Sélectionner une spécialité</option>
                      {specialiteOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Date d'inscription *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateInscription}
                  onChange={(e) => updateField('dateInscription', e.target.value)}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={formData.actif}
                    onChange={(e) => updateField('actif', e.target.checked)}
                  />
                  <span className="switch-text">Utilisateur actif</span>
                </label>
              </div>
            </div>
          </div>

          {/* Photo de profil */}
          <div className="form-section">
            <h2 className="section-title">
              <Upload size={18} />
              Photo de profil (optionnel)
            </h2>
            <div className="file-upload">
              <input
                type="file"
                id="avatar-input"
                className="file-input"
                accept="image/*"
                onChange={(e) => updateField('avatar', e.target.files?.[0])}
              />
              <label htmlFor="avatar-input" className="file-label">
                <Upload size={20} />
                <span>Cliquez pour télécharger une photo</span>
              </label>
              <p className="file-hint">Formats acceptés: JPG, PNG (max 2MB)</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
