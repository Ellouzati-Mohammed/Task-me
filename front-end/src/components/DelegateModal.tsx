import { X } from 'lucide-react';
import type { DelegateModalProps } from '../types/Affectation.d';
import { useDelegate } from '../hooks/useDelegate';
import '../Styles/TaskFormModal.css';

export function DelegateModal({ affectationId, taskName, onClose, onSuccess }: DelegateModalProps) {
  const {
    users,
    loading,
    selectedUser,
    setSelectedUser,
    submitting,
    justificatif,
    setJustificatif,
    handleDelegate,
  } = useDelegate(affectationId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="task-form-header">
          <div>
            <h1 className="task-form-title">Déléguer la tâche</h1>
            {taskName && <p className="task-form-subtitle">{taskName}</p>}
          </div>
          <button type="button" className="cancel-button" onClick={onClose}>
            <X size={18} />
            Fermer
          </button>
        </div>
        
        <div className="task-form">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Chargement des utilisateurs...</p>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">
                  Sélectionner l'utilisateur
                  <span className="required">*</span>
                </label>
                <select
                  className="form-input"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  required
                >
                  <option value="">-- Choisir un utilisateur --</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.prenom} {user.nom} - {user.grade} ({user.specialite})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Raison de la délégation
                  <span className="required">*</span>
                </label>
                <textarea
                  className="form-input"
                  value={justificatif}
                  onChange={(e) => setJustificatif(e.target.value)}
                  placeholder="Expliquez pourquoi vous déléguez cette tâche..."
                  rows={4}
                  required
                />
              </div>

              <div className="task-form-footer">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={onClose}
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="submit-button"
                  onClick={() => handleDelegate(onSuccess, onClose)}
                  disabled={submitting}
                >
                  {submitting ? 'Délégation...' : 'Déléguer'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
