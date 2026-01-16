import { useEffect, useState } from 'react';
import { X, Calendar, MapPin, Users, CheckCircle, XCircle, Clock, UserX, type LucideIcon } from 'lucide-react';
import api from '../services/api';
import '../Styles/TaskFormModal.css';

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
}

interface Task {
  _id: string;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  directionAssociee?: string;
  nombrePlaces: number;
  typeTache: string;
  statutTache: string;
}

interface Affectation {
  _id: string;
  statutAffectation: string;
  auditeur: {
    _id: string;
    prenom: string;
    nom: string;
    email: string;
    specialite: string;
    grade: string;
  };
  dateAffectation: string;
  modeAffectation: string;
  justificatif?: string;
}

const statutConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  PROPOSEE: { label: 'Proposée', color: '#f59e0b', icon: Clock },
  ACCEPTEE: { label: 'Acceptée', color: '#10b981', icon: CheckCircle },
  REFUSEE: { label: 'Refusée', color: '#ef4444', icon: XCircle },
  DELEGUEE: { label: 'Déléguée', color: '#3b82f6', icon: Users },
  ANNULEE: { label: 'Annulée', color: '#6b7280', icon: UserX }
};

export function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        // Récupérer les détails de la tâche
        const taskResponse = await api.get(`/tasks/${taskId}`);
        setTask(taskResponse.data.data || taskResponse.data);
        // Récupérer les affectations de cette tâche via la nouvelle API
        const affectationsResponse = await api.get(`/affectations/task/${taskId}`);
        setAffectations(affectationsResponse.data.data || affectationsResponse.data);
      } catch {
        // Erreur lors de la récupération des détails
      } finally {
        setLoading(false);
      }
    };
    fetchTaskDetails();
  }, [taskId]);

  const handleDeleteAffectation = async (affectationId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette affectation ?')) return;
    try {
      await api.delete(`/affectations/${affectationId}`);
      setAffectations(prev => prev.filter(a => a._id !== affectationId));
    } catch (error) {
      alert("Erreur lors de la suppression de l'affectation "+error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="task-form-header">
          <div>
            <h1 className="task-form-title">Détails de la tâche</h1>
            <p className="task-form-subtitle">Informations et affectations</p>
          </div>
          <button type="button" className="cancel-button" onClick={onClose}>
            <X size={18} />
            Fermer
          </button>
        </div>
        
        <div className="task-form" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Chargement...</p>
          ) : task ? (
            <>
              {/* Informations de la tâche */}
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                  {task.nom}
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                  {task.description}
                </p>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="#6b7280" />
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      {new Date(task.dateDebut).toLocaleDateString('fr-FR')} - {new Date(task.dateFin).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {task.directionAssociee && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="#6b7280" />
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {task.directionAssociee}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} color="#6b7280" />
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      {task.nombrePlaces} place{task.nombrePlaces > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Liste des affectations */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Affectations ({affectations.length})
                </h3>
                
                {affectations.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {affectations.map((affectation) => {
                      const config = statutConfig[affectation.statutAffectation] || statutConfig.PROPOSEE;
                      const IconComponent = config.icon;
                      return (
                        <div 
                          key={affectation._id}
                          style={{
                            padding: '16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: '#fafafa',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>
                                {affectation.auditeur?.prenom} {affectation.auditeur?.nom}
                              </h4>
                              <p style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>
                                {affectation.auditeur?.email}
                              </p>
                              <p style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>
                                {affectation.auditeur?.specialite} - Grade {affectation.auditeur?.grade}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <IconComponent size={16} color={config.color} />
                              <span 
                                style={{ 
                                  fontSize: '13px', 
                                  fontWeight: '600',
                                  color: config.color
                                }}
                              >
                                {config.label}
                              </span>
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            Affecté le {new Date(affectation.dateAffectation).toLocaleDateString('fr-FR')}
                            {' • '}
                            Mode: {affectation.modeAffectation}
                          </div>
                          {affectation.justificatif && (
                            <div style={{ 
                              marginTop: '8px', 
                              padding: '8px', 
                              backgroundColor: '#f3f4f6', 
                              borderRadius: '4px',
                              fontSize: '13px',
                              color: '#4b5563'
                            }}>
                              <strong>Justificatif:</strong> {affectation.justificatif}
                            </div>
                          )}
                          <button
                            onClick={() => handleDeleteAffectation(affectation._id)}
                            style={{
                              position: 'absolute',
                              right: 24,
                              bottom: 16,
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 18px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ 
                    textAlign: 'center', 
                    padding: '32px', 
                    color: '#9ca3af',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    Aucune affectation pour cette tâche
                  </p>
                )}
              </div>
            </>
          ) : (
            <p style={{ textAlign: 'center', padding: '20px' }}>Erreur lors du chargement</p>
          )}
        </div>
      </div>
    </div>
  );
}
