import { X } from 'lucide-react';
import type { RefuseModalProps } from '../types/Affectation.d';
import { useRefuseModal } from '../hooks/useRefuseModal';
import '../Styles/TaskFormModal.css';

export function RefuseModal({ affectationId, taskName, onClose, onSuccess }: RefuseModalProps) {
  const { justificatif, setJustificatif, submitting, error, handleRefuse } = useRefuseModal({
    affectationId,
    onClose,
    onSuccess,
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="task-form-header">
          <div>
            <h1 className="task-form-title">Refuser la tâche</h1>
            {taskName && <p className="task-form-subtitle">{taskName}</p>}
          </div>
          <button type="button" className="cancel-button" onClick={onClose}>
            <X size={18} />
            Fermer
          </button>
        </div>
        
        <div className="task-form">
          <div className="form-group">
            <label className="form-label">
              Raison du refus
              <span className="required">*</span>
            </label>
            <textarea
              className="form-input"
              value={justificatif}
              onChange={(e) => setJustificatif(e.target.value)}
              placeholder="Expliquez pourquoi vous refusez cette tâche..."
              rows={5}
              required
            />
            {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '6px' }}>{error}</p>}
          </div>

          <div 
            className="task-form-footer" 
            style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid #e5e7eb'
            }}
          >
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
              onClick={handleRefuse}
              disabled={submitting}
              style={{ backgroundColor: '#dc2626' }}
            >
              {submitting ? 'Refus en cours...' : 'Refuser la tâche'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
