import './App.css'
import './Styles/App.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Sidebar } from './components/Sidebar'
import { Navbar } from './components/Navbar'
import { Dashboard } from './pages/Dashboard'
import { AuditorDashboard } from './pages/AuditorDashboard'
import { Tasks } from './pages/Tasks'
import { MyTasks } from './pages/MyTasks'
import { Users } from './pages/Users'
import { Auditeurs } from './pages/Auditeurs'
import { Vehicles } from './pages/Vehicles'
import { Notifications } from './pages/Notifications'
import { Messages } from './pages/Messages'
import { Profile } from './pages/Profile'
import { Login } from './pages/Login'
import type { ReactNode } from 'react'

// Fonction pour obtenir le titre de la page en fonction de la route
function getPageTitle(pathname: string): string {
  const titles: { [key: string]: string } = {
    '/dashboard': 'Tableau de bord',
    '/auditor-dashboard': 'Tableau de bord',
    '/tasks': 'Gestion des tâches',
    '/my-tasks': 'Mes tâches',
    '/users': 'Gestion des utilisateurs',
    '/auditeurs': 'Auditeurs',
    '/vehicles': 'Gestion des véhicules',
    '/notifications': 'Notifications',
    '/messages': 'Messages',
    '/profile': 'Profil',
  };
  return titles[pathname] || 'Tableau de bord';
}

// Composant pour protéger les routes - redirige vers login si non authentifié
function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Afficher un écran de chargement pendant la vérification de l'auth
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#64748b'
      }}>
        Chargement...
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Composant pour protéger les routes avec contrôle de rôle
function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Afficher un écran de chargement pendant la vérification de l'auth
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#64748b'
      }}>
        Chargement...
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user || !allowedRoles.includes(user.role)) {
    // Rediriger vers la page appropriée selon le rôle
    if (user?.role === 'auditeur') {
      return <Navigate to="/auditor-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function LoginRedirect() {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) {
    if (user?.role === 'auditeur') {
      return <Navigate to="/auditor-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
}

// Composant pour afficher le layout avec Navbar dynamique
function AppLayout() {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Navbar title={pageTitle} />
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'coordinateur']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/auditor-dashboard" element={
            <ProtectedRoute allowedRoles={['auditeur']}>
              <AuditorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute allowedRoles={['coordinateur', 'admin']}>
              <Tasks />
            </ProtectedRoute>
          } />
          <Route path="/my-tasks" element={
            <ProtectedRoute allowedRoles={['auditeur']}>
              <MyTasks />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['coordinateur', 'admin']}>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/auditeurs" element={
            <ProtectedRoute allowedRoles={['coordinateur', 'admin']}>
              <Auditeurs />
            </ProtectedRoute>
          } />
          <Route path="/vehicles" element={
            <ProtectedRoute allowedRoles={['coordinateur', 'admin']}>
              <Vehicles />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRedirect />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/*" element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
