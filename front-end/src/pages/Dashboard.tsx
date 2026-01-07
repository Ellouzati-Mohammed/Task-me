import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  CheckCircle, 
  XCircle, 
  ArrowRightLeft, 
  User,
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
  Play,
  UserCheck,
  Ban,
  TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../Styles/Dashboard.css';
import type { StatCardProps,ActivityItem,Task,StatusConfig,TypeLabels } from "../types/Dashboard.d";

interface RecentAffectation {
  id: string;
  userName: string;
  taskName: string;
  status: 'PROPOSEE' | 'ACCEPTEE' | 'REFUSEE' | 'DELEGUEE';
  date: string;
}

// Mapping des statuts API vers les classes CSS
const getStatusClass = (statut: string): string => {
  const mapping: Record<string, string> = {
    'CREEE': 'pending',
    'EN_AFFECTATION': 'affectation',
    'COMPLETEE_AFFECTEE': 'affectee',
    'EN_COURS': 'encours',
    'TERMINEE': 'completed',
    'ANNULEE': 'cancelled'
  };
  return mapping[statut] || 'pending';
};

// Mapping des statuts API vers les labels d'affichage
const getStatusLabel = (statut: string): string => {
  const mapping: Record<string, string> = {
    'CREEE': 'Créé',
    'EN_AFFECTATION': 'En affectation',
    'COMPLETEE_AFFECTEE': 'Complétée/Affectée',
    'EN_COURS': 'En cours',
    'TERMINEE': 'Terminée',
    'ANNULEE': 'Annulée'
  };
  return mapping[statut] || statut;
};

const activityConfig = {
  accepted: { icon: CheckCircle, color: 'success', label: 'a accepté' },
  refused: { icon: XCircle, color: 'destructive', label: 'a refusé' },
  delegated: { icon: ArrowRightLeft, color: 'delegated', label: 'a délégué' },
  created: { icon: Clock, color: 'info', label: 'a créé' },
  assigned: { icon: User, color: 'accent', label: 'a été assigné à' },
};

function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  iconColor = '#14b8a6'
}: StatCardProps) {
  return (
    <div className="stat-card card-hover animate-fade-in">
      <div className="stat-card-container">
        <div className="stat-card-info">
          <p className="stat-card-title">{title}</p>
          <p className="stat-card-value">{value}</p>
          {change && (
            <p className={`stat-card-change ${changeType}`}>
              {change}
            </p>
          )}
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

// Recent Activity Component

interface RecentActivityProps {
  affectations: RecentAffectation[];
}

function RecentActivity({ affectations }: RecentActivityProps) {
  
  if (affectations.length === 0) {
    return (
      <div className="recent-activity">
        <h3 className="recent-activity-title">Activité récente</h3>
        <div className="activity-list" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
          Aucune activité récente
        </div>
      </div>
    );
  }

  const getActivityConfig = (status: string) => {
    const configs: Record<string, { icon: typeof CheckCircle, color: string, label: string }> = {
      'ACCEPTEE': { icon: CheckCircle, color: 'success', label: 'a accepté' },
      'REFUSEE': { icon: XCircle, color: 'destructive', label: 'a refusé' },
      'DELEGUEE': { icon: ArrowRightLeft, color: 'delegated', label: 'a délégué' },
      'PROPOSEE': { icon: Clock, color: 'info', label: 'a été assigné' },
    };
    return configs[status] || configs['PROPOSEE'];
  };

  return (
    <div className="recent-activity">
      <h3 className="recent-activity-title">Activité récente</h3>
      <div className="activity-list">
        {affectations.map((affectation, index) => {
          const config = getActivityConfig(affectation.status);
          const Icon = config.icon;
          return (
            <div 
              key={affectation.id} 
              className="activity-item animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`activity-icon ${config.color}`}>
                <Icon size={14} />
              </div>
              <div className="activity-content">
                <p className="activity-text">
                  <span className="activity-user">{affectation.userName}</span> {config.label} la tâche <strong>{affectation.taskName}</strong>
                </p>
                <p className="activity-time">{new Date(affectation.date).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Task List Component

interface TaskListProps {
  tasks: Task[];
}

function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="task-card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        Aucune tâche récente
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className="task-card card-hover animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="task-card-inner">
            <div className="task-main">
              <div className="task-header">
                <h3 className="task-name">{task.name}</h3>
                <span className={`task-badge ${getStatusClass(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>
              
              <p className="task-description">
                {task.description}
              </p>

              <div className="task-meta">
                <span className="task-meta-item">
                  <Calendar size={14} />
                  {new Date(task.startDate).toLocaleDateString('fr-FR')} - {new Date(task.endDate).toLocaleDateString('fr-FR')}
                </span>
                {task.direction && (
                  <span className="task-meta-item">
                    <MapPin size={14} />
                    {task.direction.replace('_', ' - ')}
                  </span>
                )}
                <span className="task-meta-item">
                  <Users size={14} />
                  {task.placesCount} place{task.placesCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="task-actions">
              <span className="task-type-badge">
                {task.type}
              </span>
              {task.isRemunerated && (
                <span className="task-remunerated-badge">
                  Rémunérée
                </span>
              )}
              <button className="task-menu-btn">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentAffectations, setRecentAffectations] = useState<RecentAffectation[]>([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    activeAuditors: 0,
    inProgressTasks: 0,
    assignedTasks: 0,
    cancelledTasks: 0,
    acceptanceRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les statistiques depuis l'API
        const statsResponse = await api.get('/tasks/stats');
        const statsData = statsResponse.data.data;
        
        setStats(statsData);
        
        // Récupérer les tâches récentes
        const tasksResponse = await api.get('/tasks');
        const apiTasks = tasksResponse.data.data || tasksResponse.data;
        
        // Mapper les tâches
        const mappedTasks = apiTasks.map((task: Record<string, unknown>) => ({
          id: task._id as string,
          name: task.nom as string,
          description: task.description as string,
          status: task.statutTache as string,
          type: task.typeTache as string,
          startDate: task.dateDebut as string,
          endDate: task.dateFin as string,
          direction: task.directionAssociee as string,
          placesCount: task.nombrePlaces as number,
          isRemunerated: task.remuneree as boolean
        }));
        
        // Prendre les 5 tâches les plus récentes
        const recentTasks = mappedTasks.slice(0, 5);
        setTasks(recentTasks);
        
        // Récupérer les affectations récentes
        const affectationsResponse = await api.get('/affectations/recent?limit=5');
        const apiAffectations = affectationsResponse.data.data || affectationsResponse.data;
        
        console.log('API Affectations:', apiAffectations);
        
        // Mapper les affectations (même si tache est null)
        const mappedAffectations = apiAffectations
          .filter((aff: any) => aff.auditeur) // Filtrer seulement si auditeur existe
          .map((aff: any) => ({
            id: aff._id,
            userName: `${aff.auditeur.prenom} ${aff.auditeur.nom}`,
            taskName: aff.tache?.nom || 'Tâche supprimée',
            status: aff.statutAffectation,
            date: aff.updatedAt || aff.createdAt
          }));
        
        console.log('Mapped Affectations:', mappedAffectations);
        
        setRecentAffectations(mappedAffectations);
        
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-content">
      <div className="dashboard-welcome">
        <h1 className="welcome-title">Bonjour, {user?.prenom}!</h1>
        <p className="welcome-subtitle">Voici un aperçu de votre activité</p>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Chargement...
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              title="Tâches totales"
              value={stats.totalTasks}
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
              title="En cours"
              value={stats.inProgressTasks}
              icon={Play}
              iconColor="#3b82f6"
            />
            <StatCard
              title="Complétées"
              value={stats.completedTasks}
              icon={CheckCircle2}
              iconColor="#22c55e"
            />
            <StatCard
              title="Affectées"
              value={stats.assignedTasks}
              icon={UserCheck}
              iconColor="#14b8a6"
            />
            <StatCard
              title="Annulées"
              value={stats.cancelledTasks}
              icon={Ban}
              iconColor="#ef4444"
            />
            <StatCard
              title="Taux d'acceptation"
              value={`${stats.acceptanceRate}%`}
              icon={TrendingUp}
              iconColor="#10b981"
            />
            <StatCard
              title="Auditeurs actifs"
              value={stats.activeAuditors}
              icon={Users}
              iconColor="#8b5cf6"
            />
          </div>

          <div className="content-grid">
            <div className="tasks-section">
              <div className="tasks-header">
                <h2 className="tasks-title">Tâches récentes</h2>
              </div>
              <TaskList tasks={tasks} />
            </div>
            <div className="right-column">
              <RecentActivity affectations={recentAffectations} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
