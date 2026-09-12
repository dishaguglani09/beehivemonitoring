import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Thermometer,
  Droplets,
  Activity,
  Weight,
  Volume2,
  Wind,
  Gauge,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Camera,
  Play,
  ArrowUpRight,
  Layers,
  Zap,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import StatusBadge from '../components/StatusBadge'
import MetricCard from '../components/MetricCard'
import DetailModal from '../components/DetailModal'
import {
  temperatureHistory,
  humidityHistory,
  weightHistory,
  activityHistory,
} from '../data/mockData'
import { useSimulationContext } from '../context/SimulationContext'

function HealthRing({ score, size = 76 }: { score: number; size?: number }) {
  const r = size / 2 - 6
  const c = 2 * Math.PI * r
  const filled = (score / 100) * c
  const color =
    score >= 90 ? '#4ade80' : score >= 75 ? '#fbbf24' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${filled} ${c}`}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
      />
    </svg>
  )
}

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel-elevated px-4 py-3 rounded-xl text-xs border border-[var(--border-subtle)] min-w-[150px]">
      <div className="text-[var(--text-tertiary)] text-[10px] mb-2 font-medium tracking-wider uppercase">{label}</div>
      <div className="font-mono-data font-bold text-sm text-[#fbbf24]">
        {payload[0].value}
        {payload[0].unit ?? ''}
      </div>
    </div>
  )
}

export default function Overview() {
  const navigate = useNavigate()
  const [activeTrendMetric, setActiveTrendMetric] = useState<'Weight'>('Weight')
  const [timeRange, setTimeRange] = useState('7D')
  const [activeDetailModal, setActiveDetailModal] = useState<string | null>(null)
  const [dismissedAlert, setDismissedAlert] = useState(false)
  const { alerts, currentReading, healthScore } = useSimulationContext()

  // Track real time elapsed since the last simulated reading arrived
  const [lastUpdateLocalTime, setLastUpdateLocalTime] = useState(Date.now())
  const [relativeTime, setRelativeTime] = useState('just now')

  useEffect(() => {
    setLastUpdateLocalTime(Date.now())
    setRelativeTime('just now')
  }, [currentReading?.timestamp])

  useEffect(() => {
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

  const primaryHive = {
    id: 'A01',
    name: 'Alpha Hive Node',
  }
  
  // Filter out the false brood nest temperature alert for the overview
  const primaryAlert = alerts.find(a => a.status === 'active' && a.reason !== 'Brood nest temperature below threshold.')

  return (
    <div className="p-4 lg:p-6 lg:px-8 space-y-6 max-w-[1600px] mx-auto text-gray-200">
      {/* 1. Header & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              SmartHive
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#16a34a]/30 bg-[#16a34a]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] live-dot" />
              <span className="text-[#4ade80] text-[10px] font-bold uppercase tracking-wider">System Online</span>
            </div>
          </div>
          <h3 className="text-[var(--text-secondary)] font-semibold mt-1">Your Apiary</h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5 font-mono-data">
            Last updated {relativeTime}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-4 py-2 rounded-xl glass-panel text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            <strong className="text-[var(--text-primary)]">1 Hive</strong> · <span className={healthScore >= 80 ? "text-[#4ade80]" : "text-[#fbbf24]"}>{healthScore >= 80 ? "1 Healthy" : "1 Needs Attention"}</span>
          </div>
        </div>
      </div>

      {/* 2. Priority Alert Banner (Attention Needed) */}
      {!dismissedAlert && primaryAlert ? (
        <div className="alert-pulse rounded-2xl glass-panel border border-[#fbbf24]/40 bg-[#fbbf24]/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#fbbf24]/20 flex items-center justify-center flex-shrink-0 border-none shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <AlertTriangle size={24} className="text-[#fbbf24]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#fbbf24] uppercase tracking-wider">
                  Attention needed
                </span>
              </div>
              <div className="text-base font-semibold text-[var(--text-primary)] mb-1">
                {primaryAlert.hive}
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {primaryAlert.reason}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/expo')}
              className="px-5 py-2.5 rounded-xl bg-[#fbbf24]/20 hover:bg-[#fbbf24]/30 border border-[#fbbf24]/40 text-[#fbbf24] text-sm font-semibold transition-all shadow-[0_0_10px_rgba(251,191,36,0.2)]"
            >
              View Hive
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl glass-panel border border-[#4ade80]/30 bg-[#16a34a]/10 p-5 flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-[#16a34a]/20 flex items-center justify-center flex-shrink-0 border-none shadow-[0_0_15px_rgba(74,222,128,0.2)]">
            <CheckCircle2 size={24} className="text-[#4ade80]" />
          </div>
          <div>
            <div className="text-base font-semibold text-[#4ade80] mb-1">
              All Systems Nominal
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              All monitored hives are operating within expected conditions.
            </p>
          </div>
        </div>
      )}

      {/* 3. Hive Health & Core Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        
        {/* Hive Health Card */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 lg:p-8 flex flex-col justify-between card-hover-effect relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#4ade80]/10 rounded-full blur-3xl group-hover:bg-[#4ade80]/20 transition-all duration-700" />
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl text-[var(--text-primary)] flex items-center gap-2">
                🐝 Alpha Hive Node
              </h3>
              <div className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border flex items-center gap-1.5 ${healthScore >= 80 ? 'text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/20' : 'text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${healthScore >= 80 ? 'bg-[#4ade80]' : 'bg-[#fbbf24]'} live-dot`}></span> {healthScore >= 80 ? 'HEALTHY' : 'ATTENTION'}
              </div>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 flex items-center justify-center">
                 <HealthRing score={healthScore} size={128} />
                 <div className="absolute flex flex-col items-center justify-center">
                    <span className="font-mono-data text-3xl font-bold text-[var(--text-primary)] tracking-tighter">{Math.round(healthScore)}</span>
                 </div>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] font-medium mb-1">
              Colony conditions are extremely stable.
            </p>
            <p className="text-sm text-[var(--text-tertiary)]">
              No manual intervention required.
            </p>
          </div>
          
          <div className="text-xs text-[var(--text-tertiary)] mt-6 pt-4 border-t border-[var(--border-subtle)] font-mono-data">
            Last checked: 12 sec ago
          </div>
        </div>

        {/* 4 Core Metrics */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          
          {/* Temperature */}
          <div className="glass-panel rounded-3xl p-5 lg:p-6 card-hover-effect relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#fbbf24]/10 rounded-bl-full blur-2xl group-hover:bg-[#fbbf24]/20 transition-all duration-500"/>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Thermometer size={16} className="text-[#fbbf24]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Temperature</span>
              </div>
              <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20">
                Stable
              </div>
            </div>
            <div className="relative z-10">
              <div className="font-mono-data text-4xl font-bold text-[var(--text-primary)] flex items-baseline gap-1">
                {currentReading.brood_temp.toFixed(1)} <span className="text-lg text-[var(--text-tertiary)] font-normal">°C</span>
              </div>
            </div>
          </div>

          {/* Humidity */}
          <div className="glass-panel rounded-3xl p-5 lg:p-6 card-hover-effect relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#60a5fa]/10 rounded-bl-full blur-2xl group-hover:bg-[#60a5fa]/20 transition-all duration-500"/>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Droplets size={16} className="text-[#60a5fa]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Humidity</span>
              </div>
               <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20">
                Normal
              </div>
            </div>
            <div className="relative z-10">
              <div className="font-mono-data text-4xl font-bold text-[var(--text-primary)] flex items-baseline gap-1">
                {currentReading.humidity.toFixed(0)} <span className="text-lg text-[var(--text-tertiary)] font-normal">%</span>
              </div>
            </div>
          </div>

          {/* Hive Weight */}
          <div className="glass-panel rounded-3xl p-5 lg:p-6 card-hover-effect relative overflow-hidden group flex flex-col justify-between">
             <div className="absolute right-0 top-0 w-24 h-24 bg-[#a78bfa]/10 rounded-bl-full blur-2xl group-hover:bg-[#a78bfa]/20 transition-all duration-500"/>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Weight size={16} className="text-[#a78bfa]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Hive Weight</span>
              </div>
              <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-[#fbbf24] bg-[#fbbf24]/10 border border-[#fbbf24]/20">
                ↑ 1.2 kg this week
              </div>
            </div>
            <div className="relative z-10">
              <div className="font-mono-data text-4xl font-bold text-[var(--text-primary)] flex items-baseline gap-1">
                {currentReading.weight_kg.toFixed(1)} <span className="text-lg text-[var(--text-tertiary)] font-normal">kg</span>
              </div>
            </div>
          </div>

          {/* Bee Activity */}
          <div className="glass-panel rounded-3xl p-5 lg:p-6 card-hover-effect relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#4ade80]/10 rounded-bl-full blur-2xl group-hover:bg-[#4ade80]/20 transition-all duration-500"/>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Activity size={16} className="text-[#4ade80]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Bee Activity</span>
              </div>
              <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20">
                Active
              </div>
            </div>
            <div className="relative z-10">
              <div className="font-mono-data text-4xl font-bold text-[var(--text-primary)] flex items-baseline gap-1">
                Normal
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Insights & Trends Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        
        {/* Weight Trend Chart */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-5 lg:p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display font-semibold text-sm text-[var(--text-secondary)] tracking-wide uppercase">
                Weight Trend
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Nectar flow rate and mass progression
              </p>
            </div>

            <div className="flex glass-panel rounded-xl p-1 border border-[var(--border-subtle)]">
              {['24H', '7D', '30D'].map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${
                    timeRange === r
                      ? 'bg-[var(--bg-card-hover)] text-[var(--text-primary)] shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGradDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  unit=" kg"
                  stroke="#a78bfa"
                  strokeWidth={3}
                  fill="url(#weightGradDark)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#090a0f', stroke: '#a78bfa', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Smart Insights & Recent Activity */}
        <div className="space-y-5 lg:space-y-6">
          {/* Smart Insights */}
          <div className="glass-panel-elevated rounded-3xl p-6 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-[#d97706]/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-2 mb-5 text-[#fbbf24]">
              <Sparkles size={18} />
              <h3 className="font-display font-semibold tracking-wide uppercase text-sm ai-glow-text">
                Smart Insights
              </h3>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#4ade80] flex-shrink-0 shadow-[0_0_5px_#4ade80]" />
                <span className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                  Steady weight gain indicates a successful nectar flow.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#4ade80] flex-shrink-0 shadow-[0_0_5px_#4ade80]" />
                <span className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                  Internal temperature remains optimally stable for brood rearing.
                </span>
              </li>
            </ul>
          </div>

          {/* Recent Activity */}
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="font-display font-semibold tracking-wide uppercase text-sm text-[var(--text-secondary)] mb-5">
              Recent Activity
            </h3>
            
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] shadow-[0_0_8px_#fbbf24]" />
                  <div className="w-px h-full bg-[var(--bg-card-hover)] mt-2" />
                </div>
                <div className="pb-4">
                  <div className="text-xs text-[var(--text-tertiary)] mb-1 font-mono-data">Today, 8:45 AM</div>
                  <div className="text-sm text-[var(--text-primary)] font-medium">Hive inspection completed</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">Queen spotted. Added new super.</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]" />
                </div>
                <div>
                  <div className="text-xs text-[var(--text-tertiary)] mb-1 font-mono-data">Yesterday, 6:00 PM</div>
                  <div className="text-sm text-[var(--text-primary)] font-medium">Weekly sensor sync</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">All telemetry verified.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Interactive Detail Modal (For drill-down on tap) */}
      <DetailModal
        isOpen={!!activeDetailModal}
        onClose={() => setActiveDetailModal(null)}
        title={`${activeDetailModal} Telemetry`}
        subtitle="Live IoT sensor reading from Hive A-01"
        badge={<div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20">✓ NORMAL</div>}
        footerActions={
          <>
            <button
              onClick={() => {
                setActiveDetailModal(null)
                navigate('/analytics')
              }}
              className="px-5 py-2.5 rounded-xl bg-[#d97706]/20 border border-[#d97706]/40 text-[#fbbf24] text-sm font-semibold transition-all hover:bg-[#d97706]/30 shadow-[0_0_10px_rgba(217,119,6,0.15)]"
            >
              Open Full Analytics →
            </button>
          </>
        }
      >
        {activeDetailModal && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl glass-panel border border-[var(--border-subtle)]">
              <div className="text-xs text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">Current Measurement</div>
              <div className="font-mono-data text-4xl font-bold text-[var(--text-primary)]">
                {activeDetailModal === 'Temperature'
                  ? '34.2°C'
                  : activeDetailModal === 'Humidity'
                  ? '62%'
                  : activeDetailModal === 'Activity'
                  ? '87%'
                  : activeDetailModal === 'Weight'
                  ? '42.8 kg'
                  : activeDetailModal === 'Buzzing'
                  ? '67 dB'
                  : '78 index'}
              </div>
              <div className="text-xs text-[#4ade80] font-medium mt-2">
                ✓ Value is inside healthy baseline threshold
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-[#a78bfa] mb-3 uppercase tracking-wider flex items-center gap-1.5 ai-glow-text">
                ✦ AI Clinical Interpretation
              </h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed glass-panel p-4 rounded-2xl border border-[#7c3aed]/20 bg-[#7c3aed]/5">
                The readings for {activeDetailModal} show minimal thermal and acoustic volatility. The colony is regulating its internal environment autonomously without requiring feeder or ventilation modifications.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] mb-3 uppercase tracking-wider">
                Hardware Device Info
              </h4>
              <div className="text-xs text-[var(--text-secondary)] space-y-2.5 glass-panel border border-[var(--border-subtle)] rounded-2xl p-4">
                <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                  <span>Hardware Sensor:</span>
                  <span className="font-medium text-[var(--text-primary)]">Bosch Sensortec BME680 / LIS3DH</span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-subtle)] pb-2">
                  <span>Sampling Frequency:</span>
                  <span className="font-medium text-[var(--text-primary)]">Every 10 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence Rating:</span>
                  <span className="font-medium text-[#4ade80]">98.2% calibrated</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  )
}
