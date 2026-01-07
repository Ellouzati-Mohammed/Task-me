import './App.css'
import './Styles/App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Sidebar } from './components/Sidebar'
import { Navbar } from './components/Navbar'
import { Dashboard } from './pages/Dashboard'
import { Tasks } from './pages/Tasks'
import { MyTasks } from './pages/MyTasks'
import { Users } from './pages/Users'
import { Vehicles } from './pages/Vehicles'
import { Notifications } from './pages/Notifications'
import { Messages } from './pages/Messages'
import { Profile } from './pages/Profile'
import { Login } from './pages/Login'
import type { ReactNode } from 'react'

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
    return <Navigate to="/my-tasks" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/*" element={
            <PrivateRoute>
              <div className="app-layout">
                <Sidebar />
                <main className="app-main">
                  <Navbar title="Tableau de bord" />
                  <Routes>
                    <Route path="/dashboard" element={
                      <ProtectedRoute allowedRoles={['coordinateur', 'admin']}>
                        <Dashboard />
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
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
