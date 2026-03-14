import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Calendar,
  MapPin,
  TrendingUp,
  ArrowRightLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../Styles/Dashboard.css';
import type { StatCardProps } from '../types/Dashboard.d';
import { useAuditeurs } from '../hooks/useAuditeurs';

function StatCard({ title, value, icon: Icon, iconColor = '#14b8a6' }: StatCardProps) {
  return (
    <div className="stat-card card-hover animate-fade-in">
      <div className="stat-card-container">
        <div className="stat-card-info">
          <p className="stat-card-title">{title}</p>
          <p className="stat-card-value">{value}</p>
        </div>
        <div 
          className="stat-card-icon-wrapper" 
          style={{ 
            backgroundColor: `${iconColor}1A`,
            color: iconColor 
          }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

const getStatusLabel = (statut: string): string => {
  const mapping: Record<string, string> = {
    'PROPOSEE': 'En attente',
    'ACCEPTEE': 'Acceptée',
    'REFUSEE': 'Refusée',
    'DELEGUEE': 'Déléguée'
  };
  return mapping[statut] || statut;
};

const getStatusClass = (statut: string): string => {
  const mapping: Record<string, string> = {
    'PROPOSEE': 'pending',
    'ACCEPTEE': 'affectee',
    'REFUSEE': 'cancelled',
    'DELEGUEE': 'affectation'
  };
  return mapping[statut] || 'pending';
};

export function AuditorDashboard() {
  const { user } = useAuth();
  const { stats, myTasks, loading, error } = useAuditeurs({ mode: 'dashboard' });

  return (
    <div className="dashboard-content">
      <div className="dashboard-welcome">
        <h1 className="welcome-title">Bonjour, {user?.prenom}!</h1>
        <p className="welcome-subtitle">Voici un aperçu de vos tâches et missions</p>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Chargement...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
          {error}
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              title="Total affectations"
              value={stats.totalAffectations}
              icon={ClipboardList}
              iconColor="#64748b"
            />
            <StatCard
              title="En attente"
              value={stats.pendingTasks}
              icon={Clock}
              iconColor="#f59e0b"
            />
            <StatCard
              title="Acceptées"
              value={stats.acceptedTasks}
              icon={CheckCircle2}
              iconColor="#22c55e"
            />
            <StatCard
              title="Refusées"
              value={stats.refusedTasks}
              icon={XCircle}
              iconColor="#ef4444"
            />
            <StatCard
              title="Déléguées"
              value={stats.delegatedTasks}
              icon={ArrowRightLeft}
              iconColor="#8b5cf6"
            />
            <StatCard
              title="Taux d'acceptation"
              value={stats.totalAffectations > 0 
                ? `${Math.round((stats.acceptedTasks / stats.totalAffectations) * 100)}%` 
                : '0%'}
              icon={TrendingUp}
              iconColor="#10b981"
            />
          </div>

          <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="tasks-section">
              <div className="tasks-header">
                <h2 className="tasks-title">Mes dernières affectations</h2>
              </div>
              
              {myTasks.length === 0 ? (
                <div className="task-card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Aucune tâche affectée
                </div>
              ) : (
                <div className="task-list">
                  {myTasks.map((affectation, index) => {
                    // Vérification de sécurité pour éviter les erreurs
                    if (!affectation || !affectation.tache) {
                      return null;
                    }
                    
                    return (
                    <div
                      key={affectation._id}
                      className="task-item-card card-hover animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="task-item-header">
                        <div className="task-item-title-section">
                          <h3 className="task-item-title">{affectation.tache.nom || 'Sans titre'}</h3>
                          <span className={`task-status-badge ${getStatusClass(affectation.statutAffectation)}`}>
                            {getStatusLabel(affectation.statutAffectation)}
                          </span>
                        </div>
                        <div className="task-item-badges">
                          {affectation.tache.remuneree && (
                            <span className="task-remunerated-badge-small">
                              Rémunérée
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="task-item-description">
                        {affectation.tache.description || 'Pas de description'}
                      </p>

                      <div className="task-item-meta">
                        <div className="task-meta-item">
                          <Calendar size={14} />
                          <span>
                            {affectation.tache.dateDebut ? new Date(affectation.tache.dateDebut).toLocaleDateString('fr-FR') : 'N/A'} - {affectation.tache.dateFin ? new Date(affectation.tache.dateFin).toLocaleDateString('fr-FR') : 'N/A'}
                          </span>
                        </div>
                        {affectation.tache.directionAssociee && (
                          <div className="task-meta-item">
                            <MapPin size={14} />
                            <span>{String(affectation.tache.directionAssociee).replace('_', ' - ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
