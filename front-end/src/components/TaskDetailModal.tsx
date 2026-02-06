import { useEffect, useState } from 'react';
import { X, Calendar, MapPin, Users, CheckCircle, XCircle, Clock, UserX, FileText, Download, type LucideIcon } from 'lucide-react';
import api from '../services/api';
import '../Styles/TaskFormModal.css';
import '../Styles/TaskDetailModal.css';

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
  fichierJoint?: string;
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
  rapportIA?: string;
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
      <div className="task-detail-modal task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-detail-header task-form-header">
          <div>
            <h1 className="task-detail-title task-form-title">Détails de la tâche</h1>
            <p className="task-detail-subtitle task-form-subtitle">Informations et affectations</p>
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
              <div className="task-detail-section" style={{ marginBottom: '24px' }}>
                <h2 className="task-detail-title" style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                  {task.nom}
                </h2>
                <p className="task-detail-subtitle" style={{ color: '#6b7280', marginBottom: '16px' }}>
                  {task.description}
                </p>
                <div className="task-detail-info-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <div className="task-detail-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="#6b7280" />
                    <span>
                      {new Date(task.dateDebut).toLocaleDateString('fr-FR')} - {new Date(task.dateFin).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {task.directionAssociee && (
                    <div className="task-detail-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="#6b7280" />
                      <span>{task.directionAssociee}</span>
                    </div>
                  )}
                  <div className="task-detail-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} color="#6b7280" />
                    <span>
                      {task.nombrePlaces} place{task.nombrePlaces > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                {/* Fichier joint */}
                {task.fichierJoint && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FileText size={16} color="#1e40af" />
                      <span style={{ color: '#1e40af', fontWeight: '500' }}>
                        Document joint
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '14px' }}>
                      📎 {task.fichierJoint}
                    </p>
                    <a 
                      href={`http://localhost:5000/api/tasks/download/${task.fichierJoint}`}
                      download
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#2563eb', 
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        padding: '6px 12px',
                        backgroundColor: 'white',
                        border: '1px solid #3b82f6',
                        borderRadius: '6px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <Download size={14} />
                      Télécharger le fichier
                    </a>
                  </div>
                )}
              </div>

              {/* Liste des affectations */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Affectations ({affectations.length})
                </h3>
                
                {affectations.length > 0 ? (
                  <div className="task-detail-affectations" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {affectations.map((affectation) => {
                      const config = statutConfig[affectation.statutAffectation] || statutConfig.PROPOSEE;
                      const IconComponent = config.icon;
                      return (
                        <div 
                          key={affectation._id}
                          className="task-detail-affectation-card"
                          style={{
                            padding: '16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: '#fafafa',
                            position: 'relative'
                          }}
                        >
                          <div className="task-detail-affectation-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <div>
                              <h4 className="task-detail-affectation-user" style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>
                                {affectation.auditeur?.prenom} {affectation.auditeur?.nom}
                              </h4>
                              <p className="task-detail-affectation-email" style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>
                                {affectation.auditeur?.email}
                              </p>
                              <p className="task-detail-affectation-specialite" style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>
                                {affectation.auditeur?.specialite} - Grade {affectation.auditeur?.grade}
                              </p>
                            </div>
                            <div className="task-detail-affectation-status" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                          <div className="task-detail-affectation-meta" style={{ fontSize: '12px', color: '#9ca3af' }}>
                            Affecté le {new Date(affectation.dateAffectation).toLocaleDateString('fr-FR')}
                            {' • '}
                            Mode: {affectation.modeAffectation}
                          </div>
                          {/* Justification IA */}
                          {affectation.rapportIA && (
                            <div className="task-detail-rapport-ia">
                              <strong>Justification IA :</strong> {affectation.rapportIA}
                            </div>
                          )}
                          {/* Justificatif */}
                          {affectation.justificatif && (
                            <div className="task-detail-justificatif">
                              <strong>Justificatif:</strong> {affectation.justificatif}
                            </div>
                          )}
                          {/* Bouton supprimer en bas */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button
                              className="task-detail-delete-btn"
                              onClick={() => handleDeleteAffectation(affectation._id)}
                            >
                              Supprimer
                            </button>
                          </div>
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
