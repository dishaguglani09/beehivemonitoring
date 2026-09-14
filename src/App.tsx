import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Overview from './pages/Overview'
import MyHives from './pages/MyHives'
import HiveDetails from './pages/HiveDetails'
import Alerts from './pages/Alerts'
import Insights from './pages/Insights'
import System from './pages/System'
import ExpoDashboard from './pages/ExpoDashboard'
import { ThemeProvider } from './components/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { SimulationProvider } from './context/SimulationContext'
import IntroOverlay from './components/IntroOverlay'

function AppRoutes() {
  return (
    <ThemeProvider>
      <Layout>
          <Routes>
            {/* Overview page hidden for now — route disabled; redirects to Expo Demo */}
            <Route path="/overview" element={<Navigate to="/expo" replace />} />
            <Route path="/hives" element={<MyHives />} />
            <Route path="/hives/:id" element={<HiveDetails />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/system" element={<System />} />
            <Route path="/expo" element={<ExpoDashboard />} />
            <Route path="*" element={<Navigate to="/expo" replace />} />
          </Routes>
      </Layout>
    </ThemeProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <IntroOverlay />
      <AuthProvider>
        <SimulationProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/expo" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </SimulationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

