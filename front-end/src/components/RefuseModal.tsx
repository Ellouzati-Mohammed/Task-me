import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import type { RefuseModalProps } from '../types/Affectation.d';
import '../Styles/TaskFormModal.css';

export function RefuseModal({ affectationId, taskName, onClose, onSuccess }: RefuseModalProps) {
  const [justificatif, setJustificatif] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRefuse = async () => {
    if (!justificatif.trim()) {
      alert('Veuillez saisir la raison du refus');
      return;
    }

    try {
      setSubmitting(true);
      
      await api.put(`/affectations/${affectationId}`, {
        statutAffectation: 'REFUSEE',
        justificatif: justificatif
      });

      alert('Tâche refusée avec succès !');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('Erreur lors du refus:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors du refus';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

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
