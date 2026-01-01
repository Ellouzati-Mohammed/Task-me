import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
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
  MoreHorizontal
} from 'lucide-react';
import '../Styles/Dashboard.css';
import type { StatCardProps,ActivityItem,Task,StatusConfig,TypeLabels } from "../types/Dashboard.d";


const statusConfig: StatusConfig = {
  pending: { label: 'En attente', className: 'pending' },
  accepted: { label: 'Acceptée', className: 'accepted' },
  refused: { label: 'Refusée', className: 'refused' },
  delegated: { label: 'Déléguée', className: 'delegated' },
  completed: { label: 'Terminée', className: 'completed' },
};


const typeLabels: TypeLabels = {
  formateur: 'Formateur',
  membre_jury: 'Membre de jury',
  beneficiaire_formation: 'Bénéficiaire',
  observateur: 'Observateur',
  concepteur_evaluation: 'Concepteur',
};

const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Formation React Avancé',
    description: 'Formation sur les concepts avancés de React incluant hooks personnalisés, performance et patterns de conception.',
    status: 'pending',
    type: 'formateur',
    startDate: '2024-02-15',
    endDate: '2024-02-17',
    direction: 'rabat_casa',
    placesCount: 2,
    isRemunerated: true
  },
  {
    id: '2',
    name: 'Jury Certification Dev',
    description: 'Participation au jury de certification pour développeurs web niveau 5.',
    status: 'accepted',
    type: 'membre_jury',
    startDate: '2024-02-20',
    endDate: '2024-02-20',
    placesCount: 1,
    isRemunerated: true
  },
  {
    id: '3',
    name: 'Audit Pédagogique Q1',
    description: 'Audit des pratiques pédagogiques du premier trimestre.',
    status: 'delegated',
    type: 'observateur',
    startDate: '2024-02-25',
    endDate: '2024-02-28',
    direction: 'rabat_casa',
    placesCount: 3,
    isRemunerated: false
  }
];

const activityConfig = {
  accepted: { icon: CheckCircle, color: 'success', label: 'a accepté' },
  refused: { icon: XCircle, color: 'destructive', label: 'a refusé' },
  delegated: { icon: ArrowRightLeft, color: 'delegated', label: 'a délégué' },
  created: { icon: Clock, color: 'info', label: 'a créé' },
  assigned: { icon: User, color: 'accent', label: 'a été assigné à' },
};

const mockActivities: ActivityItem[] = [
  { id: '1', type: 'accepted', user: 'Ahmed Benali', task: 'Formation React Avancé', time: 'Il y a 5 min' },
  { id: '2', type: 'delegated', user: 'Fatima Zahra', task: 'Audit Pédagogique Q1', time: 'Il y a 15 min' },
  { id: '3', type: 'created', user: 'Mohammed Alami', task: 'Jury Certification Dev', time: 'Il y a 1h' },
  { id: '4', type: 'refused', user: 'Sara Idrissi', task: 'Observation Stage', time: 'Il y a 2h' },
  { id: '5', type: 'assigned', user: 'Youssef Bennani', task: 'Conception Évaluation', time: 'Il y a 3h' },
];

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

function RecentActivity() {
  return (
    <div className="recent-activity">
      <h3 className="recent-activity-title">Activité récente</h3>
      <div className="activity-list">
        {mockActivities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          
          return (
            <div 
              key={activity.id} 
              className="activity-item animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`activity-icon ${config.color}`}>
                <Icon size={14} />
              </div>
              <div className="activity-content">
                <p className="activity-text">
                  <span className="activity-user">{activity.user}</span>
                  {' '}{config.label}{' '}
                  <span className="activity-user">{activity.task}</span>
                </p>
                <p className="activity-time">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Task List Component

function TaskList() {
  return (
    <div className="task-list">
      {mockTasks.map((task, index) => (
        <div
          key={task.id}
          className="task-card card-hover animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="task-card-inner">
            <div className="task-main">
              <div className="task-header">
                <h3 className="task-name">{task.name}</h3>
                <span className={`task-badge ${statusConfig[task.status].className}`}>
                  {statusConfig[task.status].label}
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
                {typeLabels[task.type]}
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
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Navbar
          title="Tableau de bord"
          subtitle="Bonjour, Mohammed! Voici un aperçu de votre activité."
        />

        <div className="dashboard-content">
          <div className="stats-grid">
            <StatCard
              title="Tâches totales"
              value={24}
              change="+12% ce mois"
              icon={ClipboardList}
              iconColor="#64748b"
              changeType="positive"
            />
            <StatCard
              title="En attente"
              value={8}
              change="3 urgentes"
              icon={Clock}
              iconColor="#f59e0b"
              changeType="negative"
            />
            <StatCard
              title="Complétées"
              value={16}
              change="+5 cette semaine"
              icon={CheckCircle2}
              iconColor="#22c55e"
              changeType="positive"
            />
          </div>

          <div className="content-grid">
            <div className="tasks-section">
              <div className="tasks-header">
                <h2 className="tasks-title">Tâches récentes</h2>
              </div>
              <TaskList />
            </div>
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
}
