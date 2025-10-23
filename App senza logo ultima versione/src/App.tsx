import './index.css'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Verbali from './pages/Verbali'
import Anagrafica from './pages/Anagrafica'
import Analytics from './pages/Analytics'
import GeneratoreVerbali from './pages/GeneratoreVerbali'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="verbali" element={<Verbali />} />
            <Route path="anagrafica" element={<Anagrafica />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="generatore" element={<GeneratoreVerbali />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
