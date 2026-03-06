import { X } from 'lucide-react';
import type { AffectationModalProps } from '../types/Affectation.d';
import { useAffectation } from '../hooks/useAffectation';

export function AffectationModal({ taskId, taskName, maxPlaces = 1, onClose }: AffectationModalProps) {
  const {
    users,
    loading,
    selectedUsers,
    submitting,
    validAffectationsCount,
    handleToggleUser,
    handleAffectUsers,
    handleSemiAutoAffect,
    handleAutoAffectGroq,
  } = useAffectation(taskId, maxPlaces);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="task-form-header">
          <div>
            <h1 className="task-form-title">Affecter la tâche</h1>
            <p className="task-form-subtitle">
              {taskName && <strong>{taskName}</strong>}
              {' - '}
              {validAffectationsCount >= maxPlaces 
                ? `Tâche complète (${validAffectationsCount}/${maxPlaces})`
                : `Sélectionnez ${maxPlaces - validAffectationsCount} utilisateur(s) maximum (${validAffectationsCount}/${maxPlaces} déjà affectés)`
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
          ) : validAffectationsCount >= maxPlaces ? (
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
                const isDisabled = !isSelected && selectedUsers.length >= (maxPlaces - validAffectationsCount);
                
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
            {validAffectationsCount >= maxPlaces 
              ? `${validAffectationsCount}/${maxPlaces} places attribuées`
              : `${selectedUsers.length} / ${maxPlaces - validAffectationsCount} utilisateur(s) sélectionné(s)`
            }
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="cancel-button"
              onClick={handleSemiAutoAffect}
              disabled={submitting || validAffectationsCount >= maxPlaces}
              style={{ 
                padding: '10px 20px',
                opacity: (submitting || validAffectationsCount >= maxPlaces) ? 0.5 : 1,
                cursor: (submitting || validAffectationsCount >= maxPlaces) ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Chargement...' : 'Affectation semi-auto'}
            </button>
            <button 
              className="cancel-button"
              onClick={handleAutoAffectGroq}
              disabled={submitting || validAffectationsCount >= maxPlaces}
              style={{ 
                padding: '10px 20px',
                opacity: (submitting || validAffectationsCount >= maxPlaces) ? 0.5 : 1,
                cursor: (submitting || validAffectationsCount >= maxPlaces) ? 'not-allowed' : 'pointer',
                backgroundColor: '#ffe4b5',
                color: '#333'
              }}
            >
              {submitting ? 'Chargement...' : 'Affectation auto (Groq)'}
            </button>
            <button 
              className="submit-button"
              onClick={() => handleAffectUsers(onClose)}
              disabled={submitting || selectedUsers.length === 0 || validAffectationsCount >= maxPlaces}
              style={{ 
                padding: '10px 24px',
                opacity: (submitting || selectedUsers.length === 0 || validAffectationsCount >= maxPlaces) ? 0.5 : 1,
                cursor: (submitting || selectedUsers.length === 0 || validAffectationsCount >= maxPlaces) ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Affectation en cours...' : `Affecter ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
