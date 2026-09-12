import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Plus,
  SlidersHorizontal,
  Thermometer,
  Droplets,
  Weight,
  Activity,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { hives } from '../data/mockData'
import { useSimulationContext } from '../context/SimulationContext'
import useAnimatedValue from '../hooks/useAnimatedValue'
import StatusBadge from '../components/StatusBadge'

function HealthRing({ score, finalScore, size = 56 }: { score: number; finalScore: number; size?: number }) {
  const r = size / 2 - 5
  const c = 2 * Math.PI * r
  const filled = (score / 100) * c
  const color = finalScore >= 90 ? '#4ade80' : finalScore >= 75 ? '#fbbf24' : finalScore >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-strong)" strokeWidth="4.5" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4.5"
          strokeDasharray={`${filled} ${c}`}
          strokeLinecap="round"
          className="transition-all duration-75 ease-out"
        />
      </svg>
      {/* Subtle glow behind the ring */}
      <div 
        className="absolute inset-0 rounded-full blur-[10px] opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

}

export default function MyHives() {
  const { currentReading, currentSwarmEvent, weightDelta } = useSimulationContext()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('health')
  const [statusFilter, setStatusFilter] = useState('all')

  // Dynamic relative time based on local elapsed time
  const [lastUpdateLocalTime, setLastUpdateLocalTime] = React.useState(Date.now())
  const [relativeTime, setRelativeTime] = React.useState('just now')

  React.useEffect(() => {
    setLastUpdateLocalTime(Date.now())
    setRelativeTime('just now')
  }, [currentReading?.timestamp])

  React.useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastUpdateLocalTime) / 1000)
      if (seconds < 5) {
        setRelativeTime('just now')
      } else if (seconds < 60) {
        setRelativeTime(`${seconds} sec ago`)
      } else {
        const mins = Math.floor(seconds / 60)
        setRelativeTime(`${mins} min ago`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [lastUpdateLocalTime])

  // Calculate Health Score (0-100)
  const healthScore = useMemo(() => {
    let score = 100
    if (currentReading.brood_temp < 34.5 || currentReading.brood_temp > 35.5) score -= 15
    if (currentReading.humidity < 50 || currentReading.humidity > 65) score -= 10
    if (currentSwarmEvent) score -= 40
    return Math.max(0, score)
  }, [currentReading.brood_temp, currentReading.humidity, currentSwarmEvent])

  const status = healthScore >= 90 ? 'healthy' : healthScore >= 75 ? 'attention' : 'critical'

  // Animation values
  const [animHealth, isHealthAnimating] = useAnimatedValue(healthScore);
  const [animBroodTemp] = useAnimatedValue(currentReading.brood_temp);
  const [animHumidity] = useAnimatedValue(currentReading.humidity);
  const [animWeight] = useAnimatedValue(currentReading.weight_kg);

  // We only display the one real hive mapped from backend/simulation state
  const hive = {
    id: 'A01', // Real ID from the single hive system
    name: 'Alpha Hive Node',
    location: 'North Field',
    status: isHealthAnimating ? 'analyzing' : status,
    lastUpdated: relativeTime,
    weightChange: weightDelta,
    beeActivity: currentSwarmEvent ? 'Swarming' : 'High',
    swarmingRisk: currentSwarmEvent ? 'High' : 'Low'
  }

  // Determine if it matches search/filter (even though there's only one, keep UI working)
  const matchesSearch = hive.name.toLowerCase().includes(search.toLowerCase()) || hive.location.toLowerCase().includes(search.toLowerCase())
  const matchesFilter = statusFilter === 'all' || 
                        (statusFilter === 'healthy' && status === 'healthy') ||
                        (statusFilter === 'attention' && (status === 'attention' || status === 'warning')) ||
                        (statusFilter === 'critical' && status === 'critical')
  
  const showHive = matchesSearch && matchesFilter;

  return (
    <div className="p-4 lg:p-6 max-w-[1500px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel-elevated rounded-3xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbbf24]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-[var(--text-primary)] ai-glow-text mb-1">
            My Connected Apiaries
          </h2>
          <p className="text-sm text-[var(--text-tertiary)] font-medium">
            Monitor colony health, sensor telemetry, and honey production across all locations.
          </p>
        </div>

        <button 
          onClick={() => window.alert('Add Hive Node\n\nNo additional hive devices are currently connected. Connect a new sensor node to add another hive.')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#fbbf24]/20 hover:bg-[#fbbf24]/30 border border-[#fbbf24]/40 text-[#fbbf24] text-sm font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(251,191,36,0.15)] transition-all self-start sm:self-auto relative z-10"
        >
          <Plus size={16} /> Add New Hive Node
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel border border-[var(--border-subtle)] rounded-2xl p-4 relative z-10">
        <div className="relative w-full lg:w-96">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search hive name or location…"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#fbbf24]/50 focus:bg-[#fbbf24]/5 transition-all shadow-inner"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
          {/* Status Filter buttons */}
          <div className="flex bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl p-1 shadow-inner w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: `All (1)` },
              { id: 'healthy', label: 'Healthy' },
              { id: 'attention', label: 'Attention' },
              { id: 'critical', label: 'Critical' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
                ${statusFilter === f.id ? 'bg-[var(--bg-card-hover)] text-[var(--text-primary)] shadow-[0_0_10px_rgba(255,255,255,0.1)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="glass-panel border border-[var(--border-subtle)] rounded-xl px-4 py-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] outline-none cursor-pointer appearance-none w-full custom-select"
            >
              <option value="health" className="text-[var(--bg-main)]">Sort: Health Score</option>
              <option value="weight" className="text-[var(--bg-main)]">Sort: Weight</option>
              <option value="temperature" className="text-[var(--bg-main)]">Sort: Temperature</option>
              <option value="name" className="text-[var(--bg-main)]">Sort: Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {showHive && (
          <div
            className="glass-panel rounded-3xl border border-[var(--border-subtle)] p-6 hover:border-[var(--border-medium)] hover:bg-[var(--bg-card-hover)] transition-all duration-300 group flex flex-col justify-between relative overflow-hidden"
          >
            {hive.status === 'critical' && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef4444]/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#ef4444]/20 transition-all" />
            )}
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="font-display font-bold text-lg text-[var(--text-primary)] group-hover:text-[#fbbf24] transition-colors tracking-wide">
                    {hive.name}
                  </div>
                  <div className="text-[var(--text-tertiary)] text-xs font-medium uppercase tracking-wider mt-1">{hive.location}</div>
                </div>
                {isHealthAnimating ? (
                  <div className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-[var(--border-medium)] bg-[var(--bg-card-hover)] text-[var(--text-secondary)]">
                    Analyzing
                  </div>
                ) : (
                  <StatusBadge status={hive.status} size="sm" />
                )}
              </div>

              {/* Health Score Overview */}
              <div className="flex items-center gap-5 mb-6 p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)] shadow-inner">
                <div className="relative flex-shrink-0">
                  <HealthRing score={animHealth} finalScore={healthScore} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono-data text-sm font-bold text-[var(--text-primary)]">
                      {Math.round(animHealth)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Colony Health Index</div>
                  <div className="font-bold text-sm text-[var(--text-secondary)] mt-1 leading-snug">
                    {isHealthAnimating ? 'Analyzing Data...' : hive.status === 'healthy' ? 'Optimal Brood Homeostasis' : hive.status === 'critical' ? 'Urgent Intervention Needed' : 'Monitoring Thermal Fluctuation'}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mt-1.5 flex items-center gap-1.5">
                    Swarm Risk: <strong className={hive.swarmingRisk === 'High' ? "text-[#ef4444] bg-[#ef4444]/10 px-1.5 py-0.5 rounded" : "text-[#4ade80] bg-[#4ade80]/10 px-1.5 py-0.5 rounded"}>{hive.swarmingRisk}</strong>
                  </div>
                </div>
              </div>

              {/* Sensor Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: Thermometer, label: 'Brood Temp', value: `${animBroodTemp.toFixed(1)}°C`, color: '#fbbf24' },
                  { icon: Droplets, label: 'Humidity', value: `${animHumidity.toFixed(1)}%`, color: '#60a5fa' },
                  { icon: Weight, label: 'Total Weight', value: `${animWeight.toFixed(1)} kg`, color: '#a78bfa' },
                  { icon: Activity, label: 'Bee Activity', value: hive.beeActivity, color: '#4ade80' },
                ].map(m => (
                  <div key={m.label} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] group-hover:bg-[var(--bg-card-hover)] transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${m.color}15` }}>
                      <m.icon size={14} style={{ color: m.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-wider truncate">{m.label}</div>
                      <div className="font-mono-data text-sm font-bold text-[var(--text-primary)] mt-0.5">{m.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] relative z-10">
              <div>
                <div className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider">Synced {hive.lastUpdated}</div>
                <div
                  className="text-xs font-bold mt-1 tracking-wide"
                  style={{ color: hive.weightChange >= 0 ? '#4ade80' : '#ef4444' }}
                >
                  {hive.weightChange > 0 ? '+' : ''}{hive.weightChange} kg this week
                </div>
              </div>

              <button
                onClick={() => navigate(`/expo`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-card-hover)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-medium)] text-[var(--text-primary)] text-xs font-bold uppercase tracking-wider transition-all"
              >
                <span>View Node</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
