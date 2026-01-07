import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import type { User } from '../types/User.d';
import '../Styles/TaskFormModal.css';

interface DelegateModalProps {
  affectationId: string;
  taskName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DelegateModal({ affectationId, taskName, onClose, onSuccess }: DelegateModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [justificatif, setJustificatif] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/auditeurs/list');
        setUsers(response.data.data || response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        alert('Erreur lors de la récupération des utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelegate = async () => {
    if (!selectedUser) {
      alert('Veuillez sélectionner un utilisateur');
      return;
    }

    if (!justificatif.trim()) {
      alert('Veuillez saisir la raison de la délégation');
      return;
    }

    try {
      setSubmitting(true);
      
      // Mettre à jour l'affectation actuelle
      await api.put(`/affectations/${affectationId}`, {
        statutAffectation: 'DELEGUEE',
        justificatif: justificatif
      });

      // Créer une nouvelle affectation pour l'utilisateur délégué
      // TODO: Récupérer le taskId de l'affectation
      const affectationResponse = await api.get(`/affectations`);
      const currentAffectation = affectationResponse.data.data.find((aff: { _id: string }) => aff._id === affectationId);
      
      if (currentAffectation) {
        await api.post('/affectations/assign', {
          taskId: currentAffectation.tache._id || currentAffectation.tache,
          userId: selectedUser,
          modeAffectation: 'MANUEL',
          affectationOrigine: affectationId
        });
      }

      alert('Tâche déléguée avec succès !');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('Erreur lors de la délégation:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la délégation';
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
                  onClick={handleDelegate}
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
