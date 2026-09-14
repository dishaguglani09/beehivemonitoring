import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from './ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useSimulationContext } from '../context/SimulationContext'
import {
  LayoutDashboard,
  Grid3x3,
  BarChart2,
  Bell,
  Camera,
  BrainCircuit,
  FileText,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Radio,
  ChevronDown,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Sun,
  Moon,
} from 'lucide-react'

const mainNavItems = [
  { path: '/expo', label: 'Expo Demo', icon: Radio },
  { path: '/hives', label: 'Hives', icon: Grid3x3 },
  { path: '/alerts', label: 'Alerts', icon: Bell, badge: 2 },
  { path: '/insights', label: 'Insights', icon: BrainCircuit },
  { path: '/system', label: 'System', icon: Settings },
]

const allNavItems = [...mainNavItems]

function HiveSenseLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex-shrink-0 w-8 h-8 rounded-xl bg-[#d97706]/20 flex items-center justify-center border border-[#d97706]/40 amber-glow-border">
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <polygon
            points="16,2 28,9 28,23 16,30 4,23 4,9"
            fill="#d97706"
            opacity="0.35"
            stroke="#d97706"
            strokeWidth="1.8"
          />
          <polygon
            points="16,7 23,11 23,19 16,23 9,19 9,11"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.2"
          />
          <circle cx="16" cy="15" r="3.2" fill="#d97706" />
        </svg>
      </div>
      {!collapsed && (
        <div>
          <div className="font-display font-bold text-[var(--text-primary)] text-[15px] leading-tight tracking-tight flex items-center gap-1.5">
            <span>HiveSense</span>
            <span className="bg-[#d97706] text-[var(--text-primary)] text-[9px] font-black px-1 py-0.5 rounded uppercase shadow-[0_0_8px_rgba(217,119,6,0.6)]">
              AI
            </span>
          </div>
          <div className="text-[var(--text-tertiary)] text-[10px] tracking-wide">Smart Apiary Platform</div>
        </div>
      )}
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSynced, setLastSynced] = useState('10s ago')
  const [showNotifications, setShowNotifications] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const { playing, alerts } = useSimulationContext()

  const location = useLocation()
  const navigate = useNavigate()

  const currentPage =
    allNavItems.find(n => location.pathname === n.path || location.pathname.startsWith(n.path + '/'))?.label ??
    'Dashboard'

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastSynced('Just now')
    }, 800)
  }

  return (
    <div className="flex h-screen overflow-hidden text-gray-200">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 glass-panel-elevated border-r border-[var(--border-subtle)] transition-all duration-250 z-30 print:hidden ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Logo header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--border-subtle)]">
          <HiveSenseLogo collapsed={collapsed} />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)]"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          <div className="space-y-1.5">
            {!collapsed && (
              <div className="px-3 text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase mb-3">
                Core Platform
              </div>
            )}
            {mainNavItems.map(({ path, label, icon: Icon, badge }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative group
                  ${
                    isActive
                      ? 'bg-[#d97706]/15 text-[#fbbf24] shadow-[0_0_15px_rgba(217,119,6,0.15)] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#d97706] before:rounded-r'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] hover:translate-x-1'
                  }`
                }
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && badge && (
                  <span className="ml-auto bg-[#dc2626] text-[var(--text-primary)] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-[0_0_8px_rgba(220,38,38,0.5)]">
                    {badge}
                  </span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 glass-panel text-[var(--text-primary)] text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {label}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-[var(--border-subtle)]">
          {!collapsed ? (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-[#d97706]/20 flex items-center justify-center flex-shrink-0 amber-glow-border">
                <User size={16} className="text-[#fbbf24]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[var(--text-primary)] text-xs font-semibold truncate">{user?.name}</div>
                <div className="text-[var(--text-tertiary)] text-[10px] truncate">{user?.role} · {user?.plan}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/login'); }}
                className="text-[var(--text-tertiary)] hover:text-[#dc2626] transition-colors p-1.5 rounded-lg hover:bg-[#dc2626]/10"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#d97706]/20 flex items-center justify-center amber-glow-border cursor-pointer" onClick={() => navigate('/login')} title="Logout">
                <LogOut size={15} className="text-[#fbbf24]" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#090a0f]/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 glass-panel-elevated flex flex-col z-50 p-4 animate-in slide-in-from-left duration-250 border-r border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
              <HiveSenseLogo />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 rounded-lg bg-[var(--bg-card-hover)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <div className="px-3 text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase mb-2">
                  Navigation
                </div>
                {allNavItems.map(({ path, label, icon: Icon, badge }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-[#d97706]/15 text-[#fbbf24] shadow-[0_0_15px_rgba(217,119,6,0.15)] border-l-2 border-[#d97706]'
                          : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span className="flex-1">{label}</span>
                    {badge && (
                      <span className="bg-[#dc2626] text-[var(--text-primary)] text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]">
                        {badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#d97706]/20 flex items-center justify-center amber-glow-border">
                  <User size={16} className="text-[#fbbf24]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[var(--text-primary)] text-xs font-semibold">{user?.name}</div>
                  <div className="text-[var(--text-tertiary)] text-[10px]">{user?.organization}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigate('/login')
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] text-xs font-medium transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="glass-panel border-b border-[var(--border-subtle)] px-4 lg:px-6 h-16 flex items-center justify-between gap-3 flex-shrink-0 z-20 sticky top-0 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
              title="Open Navigation"
            >
              <Menu size={18} />
            </button>

            {/* Current Page or Hive Selector */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base sm:text-lg text-[var(--text-primary)] truncate">
                  {currentPage}
                </h1>
              </div>
              <p className="hidden sm:block text-[11px] text-[var(--text-tertiary)] truncate">
                AI + IoT Apiary Management System
              </p>
            </div>
          </div>

          {/* Right Header Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hive Node Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)]">
              <span className={`w-2 h-2 rounded-full ${playing ? 'bg-[#16a34a] live-dot' : 'bg-[var(--text-muted)]'}`} />
              <span className="text-[var(--text-primary)] text-xs font-semibold">Alpha Hive Node</span>
            </div>

            {/* Real-time Telemetry Status */}
            <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${playing ? 'bg-[#16a34a]/10 border-[#16a34a]/30 shadow-[0_0_10px_rgba(22,163,74,0.15)]' : 'bg-[var(--bg-card-hover)] border-[var(--border-subtle)]'}`}>
              <span className={`w-2 h-2 rounded-full ${playing ? 'bg-[#16a34a] live-dot' : 'bg-[#dc2626]'}`} />
              <span className={`${playing ? 'text-[#4ade80]' : 'text-[var(--text-tertiary)]'} text-xs font-semibold tracking-wide`}>
                {playing ? 'Live Telemetry' : 'Paused'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className={`w-9 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all neu-control
              ${isRefreshing ? 'animate-spin text-[#fbbf24] border-[#fbbf24]/50' : ''}`}
              title={`Last synced: ${lastSynced}. Click to refresh`}
            >
              <RefreshCw size={14} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-hover)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all neu-control"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Notification Bell with Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="neu-control w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative"
              >
                <Bell size={18} />
                {alerts.filter(a => a.status === 'active').length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel-elevated rounded-2xl border border-[var(--border-subtle)] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-3">
                      <div className="flex items-center gap-1.5">
                        <Bell size={14} className="text-[#fbbf24]" />
                        <span className="font-display font-semibold text-sm text-[var(--text-primary)]">
                          Active Alerts & Insights
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setShowNotifications(false)
                          navigate('/alerts')
                        }}
                        className="text-[11px] text-[#fbbf24] hover:text-[var(--text-primary)] transition-colors font-medium"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto">
                      {alerts.length === 0 ? (
                        <div className="text-center py-6 text-sm text-[var(--text-tertiary)]">
                           No active alerts.
                        </div>
                      ) : (
                        alerts.filter(a => a.status === 'active').slice(0, 3).map(a => (
                          <div
                            key={a.id}
                            onClick={() => {
                              setShowNotifications(false)
                              navigate('/alerts')
                            }}
                            className="p-2.5 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[#d97706]/40 hover:bg-[var(--bg-card-hover)] cursor-pointer transition-all"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shadow-sm
                                ${
                                  a.severity === 'critical'
                                    ? 'bg-[#dc2626]/20 text-[#fca5a5] border border-[#dc2626]/40'
                                    : 'bg-[#d97706]/20 text-[#fcd34d] border border-[#d97706]/40'
                                }`}
                              >
                                {a.severity}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-[var(--text-primary)]">{a.type}</div>
                            <div className="text-[11px] text-[var(--text-tertiary)] line-clamp-1 mt-0.5">
                              {a.reason}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto pb-mobile-nav relative z-10">
          {children}
        </main>

        {/* Dedicated Mobile Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 dark-glass border-t border-[var(--border-subtle)] px-2 py-1.5 flex items-center justify-around shadow-2xl pb-[env(safe-area-inset-bottom)]">
          {mainNavItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300
                ${
                  isActive
                    ? 'text-[#fbbf24] font-semibold scale-105'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] font-medium'
                }`
              }
            >
              <Icon size={19} className="mb-1" />
              <span className="text-[10px] leading-tight tracking-tight">{label}</span>
            </NavLink>
          ))}

          {/* More menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] font-medium transition-colors"
          >
            <Menu size={19} className="mb-1" />
            <span className="text-[10px] leading-tight tracking-tight">More</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

