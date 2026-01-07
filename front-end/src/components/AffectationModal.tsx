import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import type { User } from '../types/User.d';
import '../Styles/TaskFormModal.css';

interface AffectationModalProps {
  taskId: string;
  taskName?: string;
  maxPlaces?: number;
  onClose: () => void;
}

export function AffectationModal({ taskId, taskName, maxPlaces = 1, onClose }: AffectationModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [existingAffectationsCount, setExistingAffectationsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les utilisateurs
        const usersResponse = await api.get('/users');
        setUsers(usersResponse.data.data || usersResponse.data);
        
        // Charger les affectations existantes pour cette tâche
        const affectationsResponse = await api.get(`/affectations?tache=${taskId}`);
        const affectations = affectationsResponse.data.data || affectationsResponse.data;
        setExistingAffectationsCount(affectations.length);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        alert('Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId]);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        // Si déjà sélectionné, on le désélectionne
        return prev.filter(id => id !== userId);
      } else {
        // Vérifier si on n'a pas dépassé le nombre de places
        if (prev.length >= maxPlaces) {
          // Ne rien faire, le checkbox sera désactivé
          return prev;
        }
        return [...prev, userId];
      }
    });
  };

  const handleAffectUsers = async () => {
    if (selectedUsers.length === 0) {
      alert('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    try {
      setSubmitting(true);
      
      // Affecter les utilisateurs un par un avec validation des dates
      let successCount = 0;
      const errors: string[] = [];
      
      for (const userId of selectedUsers) {
        try {
          await api.post('/affectations/assign', {
            taskId: taskId,
            userId: userId
          });
          successCount++;
        } catch (error: unknown) {
          console.error('Erreur lors de l\'affectation:', error);
          const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur inconnue';
          errors.push(errorMessage);
        }
      }
      
      // Afficher le résultat
      if (successCount > 0 && errors.length === 0) {
        alert(`${successCount} utilisateur(s) affecté(s) à la tâche avec succès !`);
        onClose();
      } else if (successCount > 0 && errors.length > 0) {
        alert(`${successCount} utilisateur(s) affecté(s) avec succès.\n\nErreurs :\n${errors.join('\n')}`);
        onClose();
      } else {
        alert(`Aucune affectation n'a pu être créée.\n\nErreurs :\n${errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      alert('Erreur lors de l\'affectation des utilisateurs');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="task-form-header">
          <div>
            <h1 className="task-form-title">Affecter la tâche</h1>
            <p className="task-form-subtitle">
              {taskName && <strong>{taskName}</strong>}
              {' - '}
              {existingAffectationsCount >= maxPlaces 
                ? `Tâche complète (${existingAffectationsCount}/${maxPlaces})`
                : `Sélectionnez ${maxPlaces - existingAffectationsCount} utilisateur(s) maximum (${existingAffectationsCount}/${maxPlaces} déjà affectés)`
              }
            </p>
          </div>
          <button type="button" className="cancel-button" onClick={onClose}>
            <X size={18} />
            Fermer
          </button>
        </div>
        
        <div className="task-form" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Chargement des utilisateurs...</p>
          ) : existingAffectationsCount >= maxPlaces ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>
              <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '10px' }}>
                Cette tâche est complète
              </p>
              <p style={{ fontSize: '14px' }}>
                Tous les {maxPlaces} place(s) ont été attribuées.
              </p>
            </div>
          ) : users.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {users.map((user) => {
                const isSelected = selectedUsers.includes(user._id);
                const isDisabled = !isSelected && selectedUsers.length >= (maxPlaces - existingAffectationsCount);
                
                return (
                  <label 
                    key={user._id} 
                    style={{
                      padding: '15px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: isSelected ? '#f0f9ff' : isDisabled ? '#f9fafb' : 'white',
                      borderColor: isSelected ? '#3b82f6' : '#e5e7eb',
                      opacity: isDisabled ? 0.5 : 1
                    }}
                    className="user-item-affectation"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleUser(user._id)}
                        disabled={isDisabled}
                        style={{ 
                          width: '18px', 
                          height: '18px', 
                          cursor: isDisabled ? 'not-allowed' : 'pointer' 
                        }}
                      />
                      <div style={{ flex: 1 }}>
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
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '20px' }}>Aucun utilisateur disponible</p>
          )}
        </div>

        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {existingAffectationsCount >= maxPlaces 
              ? `${existingAffectationsCount}/${maxPlaces} places attribuées`
              : `${selectedUsers.length} / ${maxPlaces - existingAffectationsCount} utilisateur(s) sélectionné(s)`
            }
          </div>
          <button 
            className="submit-button"
            onClick={handleAffectUsers}
            disabled={submitting || selectedUsers.length === 0 || existingAffectationsCount >= maxPlaces}
            style={{ 
              padding: '10px 24px',
              opacity: (submitting || selectedUsers.length === 0 || existingAffectationsCount >= maxPlaces) ? 0.5 : 1,
              cursor: (submitting || selectedUsers.length === 0 || existingAffectationsCount >= maxPlaces) ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Affectation en cours...' : `Affecter ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
