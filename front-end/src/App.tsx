import './App.css'
import './Styles/App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Navbar } from './components/Navbar'
import { Dashboard } from './pages/Dashboard'
import { Tasks } from './pages/Tasks'
import { Users } from './pages/Users'
import { Vehicles } from './pages/Vehicles'
import { Notifications } from './pages/Notifications'
import { Messages } from './pages/Messages'
import { Profile } from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Navbar title="Tableau de bord" />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/users" element={<Users />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
