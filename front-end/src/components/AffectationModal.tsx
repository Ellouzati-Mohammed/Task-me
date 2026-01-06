import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import type { User } from '../types/User.d';
import '../Styles/TaskFormModal.css';

interface AffectationModalProps {
  taskId: string;
  onClose: () => void;
}

export function AffectationModal({ taskId, onClose }: AffectationModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users');
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

  const handleAffectUser = async (userId: string, userName: string) => {
    try {
      // Créer l'affectation via l'API
      const affectationData = {
        modeAffectation: 'MANUEL',
        statutAffectation: 'PROPOSEE',
        tache: taskId,
        auditeur: userId
      };

      await api.post('/affectations', affectationData);
      alert(`Utilisateur ${userName} affecté à la tâche avec succès !`);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      alert('Erreur lors de l\'affectation de l\'utilisateur');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="task-form-header">
          <div>
            <h1 className="task-form-title">Affecter la tâche</h1>
            <p className="task-form-subtitle">Sélectionnez un ou plusieurs utilisateurs</p>
          </div>
          <button type="button" className="cancel-button" onClick={onClose}>
            <X size={18} />
            Fermer
          </button>
        </div>
        
        <div className="task-form" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Chargement des utilisateurs...</p>
          ) : users.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {users.map((user) => (
                <div 
                  key={user._id} 
                  style={{
                    padding: '15px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="user-item-affectation"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                        {user.prenom} {user.nom}
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                        {user.email}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                        {user.specialite} - Grade {user.grade}
                      </p>
                    </div>
                    <button 
                      className="submit-button"
                      style={{ padding: '8px 16px' }}
                      onClick={() => handleAffectUser(user._id, `${user.prenom} ${user.nom}`)}
                    >
                      Affecter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '20px' }}>Aucun utilisateur disponible</p>
          )}
        </div>
      </div>
    </div>
  );
}
