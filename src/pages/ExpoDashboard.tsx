import { useMemo } from "react"
import {
  Thermometer,
  Droplets,
  Weight,
  Wind,
  Gauge,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Cpu,
  Radio,
  Zap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Settings2,
  Hexagon,
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
} from "recharts"
import { useSimulationContext } from '../context/SimulationContext'
import type { TelemetryReading } from "../hooks/useSimulation"
import useAnimatedValue from "../hooks/useAnimatedValue"

/* ─────────────────── Helpers ─────────────────── */

function formatTimestamp(ts: string) {
  const d = new Date(ts)
  return d.toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function shortTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function broodStatus(temp: number): {
  label: string
  color: string
  bg: string
} {
  if (temp >= 34.5 && temp <= 35.5)
    return { label: "Optimal", color: "#4ade80", bg: "rgba(74, 222, 128, 0.15)" } // Green
  if (temp < 34.5)
    return { label: "Chilled", color: "#60a5fa", bg: "rgba(96, 165, 250, 0.15)" } // Blue
  return { label: "Overheating", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" } // Red
}

function humidityStatus(h: number): {
  label: string
  color: string
  bg: string
} {
  if (h >= 50 && h <= 65)
    return { label: "Optimal", color: "#4ade80", bg: "rgba(74, 222, 128, 0.15)" }
  if (h < 50) return { label: "Low", color: "#fbbf24", bg: "rgba(251, 191, 36, 0.15)" }
  return { label: "High", color: "#60a5fa", bg: "rgba(96, 165, 250, 0.15)" }
}

/* ─────────────────── Tooltip ─────────────────── */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const fullTime = payload[0]?.payload?.fullTimestamp || label;
  return (
    <div className="glass-panel-elevated px-4 py-3 rounded-xl text-xs border border-[var(--border-subtle)] min-w-[150px]">
      <div className="text-[var(--text-tertiary)] text-[10px] mb-2 font-medium tracking-wider uppercase">
        {fullTime}
      </div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: p.color, boxShadow: `0 0 5px ${p.color}` }}
            />
            <span className="text-[var(--text-secondary)] font-medium">{p.name}</span>
          </div>
          <span className="font-mono-data font-bold text-sm text-[var(--text-primary)]">
            {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────── Main Component ─────────────────── */

export default function ExpoDashboard() {
  const sim = useSimulationContext()
  const { currentReading: r, previousReading: prev, history } = sim

  const chartData = useMemo(() => {
    // Rolling window of the last 24 hours
    const slice = history.slice(-24)
    return slice.map((d: TelemetryReading) => ({
      time: shortTime(d.timestamp),
      fullTimestamp: formatTimestamp(d.timestamp),
      brood_temp: d.brood_temp,
      ambient_temp: d.ambient_temp,
      t_i_1: d.t_i_1,
      t_i_2: d.t_i_2,
      t_i_3: d.t_i_3,
      t_i_4: d.t_i_4,
      t_i_5: d.t_i_5,
      weight_kg: d.weight_kg,
      humidity: d.humidity,
      pressure: d.pressure,
    }))
  }, [history])

  const brood = broodStatus(r.brood_temp)
  const humid = humidityStatus(r.humidity)

  // Calculate Health Score (0-100)
  const healthScore = useMemo(() => {
    let score = 100
    if (r.brood_temp < 34.5 || r.brood_temp > 35.5) score -= 15
    if (r.humidity < 50 || r.humidity > 65) score -= 10
    if (sim.currentSwarmEvent) score -= 40
    return Math.max(0, score)
  }, [r.brood_temp, r.humidity, sim.currentSwarmEvent])

  const isHealthy = healthScore >= 80

  const [animHealth, isHealthAnimating] = useAnimatedValue(healthScore);
  const [animBroodTemp] = useAnimatedValue(r.brood_temp);
  const [animAmbientTemp] = useAnimatedValue(r.ambient_temp);
  const [animWeight] = useAnimatedValue(r.weight_kg);
  const [animHumidity] = useAnimatedValue(r.humidity);
  const [animTi1] = useAnimatedValue(r.t_i_1);
  const [animTi2] = useAnimatedValue(r.t_i_2);

  return (
    <div className="p-4 lg:p-6 lg:px-8 space-y-6 max-w-[1600px] mx-auto pb-mobile-nav text-gray-200">
      
      {/* ════════════════ Header & Controls ════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:mb-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            Alpha Hive Node
            <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${isHealthAnimating ? 'bg-[var(--bg-card-hover)] border-[var(--border-medium)]' : sim.currentSwarmEvent ? 'bg-[#dc2626]/10 border-[#dc2626]/30' : 'bg-[#16a34a]/10 border-[#16a34a]/30'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isHealthAnimating ? 'bg-white/50 animate-pulse' : sim.currentSwarmEvent ? 'bg-[#ef4444] animate-pulse' : 'bg-[#4ade80] live-dot'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isHealthAnimating ? 'text-[var(--text-secondary)]' : sim.currentSwarmEvent ? 'text-[#ef4444]' : 'text-[#4ade80]'}`}>
                {isHealthAnimating ? 'Analyzing' : sim.currentSwarmEvent ? 'Attention Req' : 'Normal State'}
              </span>
            </div>
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Real-time multisensor stream · <span className="font-mono-data text-[var(--text-secondary)]">{formatTimestamp(r.timestamp)}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Simulation Toggle */}
          <div className="glass-panel rounded-xl p-1 flex">
            <button
              onClick={() => sim.setMode("normal")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                sim.mode === "normal"
                  ? "bg-[#d97706]/20 text-[#fbbf24] shadow-[0_0_10px_rgba(217,119,6,0.15)] border border-[#d97706]/30"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Normal State
            </button>
            <button
              onClick={() => sim.simulateSwarm()}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                sim.currentSwarmEvent?.simulated
                  ? "bg-[#dc2626]/20 text-[#fca5a5] shadow-[0_0_10px_rgba(220,38,38,0.2)] border border-[#dc2626]/30"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Simulate Swarm Event
            </button>
          </div>

          <div className="glass-panel flex items-center gap-1 p-1 rounded-xl">
            <button onClick={() => (sim.playing ? sim.pause() : sim.play())} className="neu-control w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-primary)]">
              {sim.playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button onClick={sim.reset} className="neu-control w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════ Alert Banner (Conditional) ════════════════ */}
      {sim.currentSwarmEvent && (
        <div className="alert-pulse rounded-2xl glass-panel border border-[#ef4444]/40 bg-[#dc2626]/10 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#dc2626]/20 flex items-center justify-center flex-shrink-0 amber-glow-border border-none">
            <AlertTriangle size={24} className="text-[#ef4444]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-[#fca5a5]">
              Swarming Event Detected
            </div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">
              Swarming activity detected on {formatTimestamp(sim.currentSwarmEvent.timestamp)}. AI confidence: {sim.currentSwarmEvent.confidence}%.
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ BENTO GRID LAYOUT ════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-5 lg:gap-6">
        
        {/* ROW 1: Hive Health (Left) + Sensor Cards (Right) */}
        
        {/* Large Hive Health Card */}
        <div className="md:col-span-4 lg:col-span-4 glass-panel rounded-3xl p-6 lg:p-8 card-hover-effect flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#d97706]/10 rounded-full blur-3xl group-hover:bg-[#d97706]/20 transition-all duration-700" />
          
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Activity className="text-[#fbbf24]" size={18} />
              <h2 className="font-display font-semibold text-[var(--text-secondary)] tracking-wide uppercase text-sm">Colony Health</h2>
            </div>
            
            <div className="flex flex-col items-center justify-center my-6 relative">
              {/* Radial Health Indicator */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-strong)" strokeWidth="8" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke={isHealthy ? "#4ade80" : "#fbbf24"} 
                    strokeWidth="8" 
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * animHealth) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-75 ease-out drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-mono-data text-5xl font-bold text-[var(--text-primary)] tracking-tighter">
                    {Math.round(animHealth)}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider mt-1 ${isHealthAnimating ? 'text-[var(--text-tertiary)]' : isHealthy ? 'text-[#4ade80]' : 'text-[#fbbf24]'}`}>
                    {isHealthAnimating ? 'Analyzing' : isHealthy ? 'Optimal' : 'Warning'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center">
            <div className="text-xs text-[var(--text-tertiary)]">Last diagnostic run</div>
            <div className="text-xs font-mono-data text-[var(--text-secondary)]">{formatTimestamp(r.timestamp)}</div>
          </div>
        </div>

        {/* 4 Medium Sensor Cards */}
        <div className="md:col-span-4 lg:col-span-8 grid grid-cols-2 gap-5 lg:gap-6">
          
          <div className="glass-panel rounded-3xl p-5 card-hover-effect flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#d97706]/10 rounded-bl-full blur-2xl group-hover:bg-[#d97706]/20 transition-all duration-500"/>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Thermometer size={16} className="text-[#fbbf24]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Brood Temp</span>
              </div>
              <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider" style={{ color: brood.color, backgroundColor: brood.bg }}>
                {brood.label}
              </div>
            </div>
            <div className="relative z-10">
              <div className="font-mono-data text-4xl font-bold text-[var(--text-primary)] flex items-baseline gap-1">
                {animBroodTemp.toFixed(1)} <span className="text-lg text-[var(--text-tertiary)] font-normal">°C</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-2">Target range: 34.5 - 35.5°C</div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5 card-hover-effect flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#60a5fa]/10 rounded-bl-full blur-2xl group-hover:bg-[#60a5fa]/20 transition-all duration-500"/>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Wind size={16} className="text-[#60a5fa]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Ambient Temp</span>
              </div>
            </div>
            <div className="relative z-10">
              <div className="font-mono-data text-4xl font-bold text-[var(--text-primary)] flex items-baseline gap-1">
                {animAmbientTemp.toFixed(1)} <span className="text-lg text-[var(--text-tertiary)] font-normal">°C</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-2">External microclimate</div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5 card-hover-effect flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#a78bfa]/10 rounded-bl-full blur-2xl group-hover:bg-[#a78bfa]/20 transition-all duration-500"/>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Weight size={16} className="text-[#a78bfa]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Hive Weight</span>
              </div>
              {sim.weightDelta !== 0 && (
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${sim.weightDelta > 0 ? 'bg-[#4ade80]/10 text-[#4ade80]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
                  {sim.weightDelta > 0 ? "↑" : "↓"} {Math.abs(sim.weightDelta).toFixed(2)} kg
                </div>
              )}
            </div>
            <div className="relative z-10">
              <div className="font-mono-data text-4xl font-bold text-[var(--text-primary)] flex items-baseline gap-1">
                {animWeight.toFixed(1)} <span className="text-lg text-[var(--text-tertiary)] font-normal">kg</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-2">Nectar influx / population mass</div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-5 card-hover-effect flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#38bdf8]/10 rounded-bl-full blur-2xl group-hover:bg-[#38bdf8]/20 transition-all duration-500"/>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Droplets size={16} className="text-[#38bdf8]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Humidity</span>
              </div>
              <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider" style={{ color: humid.color, backgroundColor: humid.bg }}>
                {humid.label}
              </div>
            </div>
            <div className="relative z-10">
              <div className="font-mono-data text-4xl font-bold text-[var(--text-primary)] flex items-baseline gap-1">
                {animHumidity.toFixed(1)} <span className="text-lg text-[var(--text-tertiary)] font-normal">%</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-2">Target range: 50 - 65%</div>
            </div>
          </div>

        </div>

        {/* ROW 2: Central Visualization + AI Insights */}
        
        {/* Central Hive Visualization (Large Span) */}
        <div className="md:col-span-4 lg:col-span-8 glass-panel-elevated rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[350px]">
          {/* Depth/Parallax Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#d97706]/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="absolute top-4 left-6 text-[var(--text-tertiary)] text-xs font-semibold tracking-widest uppercase z-10">
            Spatial Array
          </div>

          {/* Visualization Container */}
          <div className="relative w-full flex-1 flex items-center justify-center mt-4">
            {/* The Hive Model / Representation */}
            <div className="relative w-48 h-56 float-animation z-20">
              {/* Layered Hexagons to simulate 3D hive */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e212b] to-[#12141a] rounded-xl border border-[var(--border-subtle)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-around py-4">
                <div className="w-[85%] h-1 bg-[#d97706]/30 mx-auto rounded-full shadow-[0_0_10px_rgba(217,119,6,0.5)]" />
                <div className="w-[85%] h-1 bg-[#d97706]/30 mx-auto rounded-full" />
                <div className="w-[85%] h-1 bg-[#d97706]/30 mx-auto rounded-full" />
                <div className="w-[85%] h-1 bg-[#d97706]/30 mx-auto rounded-full" />
                <div className="w-[85%] h-1 bg-[#d97706]/30 mx-auto rounded-full shadow-[0_0_10px_rgba(217,119,6,0.5)]" />
              </div>
              
              {/* Glowing Core (Brood) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-24 bg-[#fbbf24]/10 rounded-full blur-xl health-ring-pulse" />
              
              <Hexagon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-[#fbbf24]/20 stroke-[1]" />
            </div>

            {/* Connecting Lines and Floating Nodes (Obscuration & Depth) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              
              {/* Top Left Node - Temp */}
              <div className="absolute top-[10%] left-[15%] float-medium flex items-center gap-2">
                <div className="text-right">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">Zone 1</div>
                  <div className="font-mono-data font-bold text-[#fbbf24]">{animTi1.toFixed(1)}°</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#fbbf24] shadow-[0_0_8px_#fbbf24]" />
                <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-white/10 absolute top-3 left-full hidden md:block" />
              </div>

              {/* Top Right Node - Temp */}
              <div className="absolute top-[15%] right-[15%] float-animation flex flex-row-reverse items-center gap-2" style={{ animationDelay: '1s' }}>
                <div className="text-left">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">Zone 2</div>
                  <div className="font-mono-data font-bold text-[#fbbf24]">{animTi2.toFixed(1)}°</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#fbbf24] shadow-[0_0_8px_#fbbf24]" />
              </div>

              {/* Bottom Left Node - Acoustic (Fake for viz) */}
              <div className="absolute bottom-[20%] left-[15%] float-animation flex items-center gap-2" style={{ animationDelay: '2s' }}>
                <div className="text-right">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">Acoustic</div>
                  <div className="font-mono-data font-bold text-[#a78bfa]">420Hz</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#a78bfa] shadow-[0_0_8px_#a78bfa]" />
              </div>

              {/* Bottom Right Node - Activity */}
              <div className="absolute bottom-[15%] right-[15%] float-medium flex flex-row-reverse items-center gap-2" style={{ animationDelay: '1.5s' }}>
                <div className="text-left">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">Activity</div>
                  <div className="font-mono-data font-bold text-[#38bdf8]">High</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]" />
              </div>
              
              {/* Subtle Bees (SVG) overlapping the glass */}
              <div className="absolute top-[40%] right-[30%] w-3 h-3 text-[#d97706]/60 animate-pulse-slow">
                 <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 2a3 3 0 0 1 3 3v1h1a3 3 0 0 1 3 3v2.24a4.98 4.98 0 0 1 1.95 2.14 5 5 0 0 1-.22 4.67l-.23.4a3 3 0 0 1-5.06-1.57l-.14-.58a3 3 0 0 0-3.3-2.3h-.99a3 3 0 0 0-3.3 2.3l-.14.58a3 3 0 0 1-5.06 1.57l-.23-.4a5 5 0 0 1-.22-4.67A4.98 4.98 0 0 1 6 11.24V9a3 3 0 0 1 3-3h1V5a3 3 0 0 1 3-3Zm0 13a5 5 0 0 1 4.7 3.32l.14.58a1 1 0 0 0 1.68.52l.23-.4a3 3 0 0 0 .14-2.8 2.99 2.99 0 0 0-1.17-1.28L15 14v4a1 1 0 0 1-2 0v-4h-2v4a1 1 0 0 1-2 0v-4l-1.72.84a2.99 2.99 0 0 0-1.17 1.28 3 3 0 0 0 .14 2.8l.23.4a1 1 0 0 0 1.68-.52l.14-.58A5 5 0 0 1 11 15Zm3-7H8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1Zm-3-4a1 1 0 0 0-1 1v1h2V5a1 1 0 0 0-1-1Z"/></svg>
              </div>
              <div className="absolute bottom-[35%] left-[25%] w-2 h-2 text-[#d97706]/40 float-medium" style={{ animationDelay: '0.5s' }}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 2a3 3 0 0 1 3 3v1h1a3 3 0 0 1 3 3v2.24a4.98 4.98 0 0 1 1.95 2.14 5 5 0 0 1-.22 4.67l-.23.4a3 3 0 0 1-5.06-1.57l-.14-.58a3 3 0 0 0-3.3-2.3h-.99a3 3 0 0 0-3.3 2.3l-.14.58a3 3 0 0 1-5.06 1.57l-.23-.4a5 5 0 0 1-.22-4.67A4.98 4.98 0 0 1 6 11.24V9a3 3 0 0 1 3-3h1V5a3 3 0 0 1 3-3Zm0 13a5 5 0 0 1 4.7 3.32l.14.58a1 1 0 0 0 1.68.52l.23-.4a3 3 0 0 0 .14-2.8 2.99 2.99 0 0 0-1.17-1.28L15 14v4a1 1 0 0 1-2 0v-4h-2v4a1 1 0 0 1-2 0v-4l-1.72.84a2.99 2.99 0 0 0-1.17 1.28 3 3 0 0 0 .14 2.8l.23.4a1 1 0 0 0 1.68-.52l.14-.58A5 5 0 0 1 11 15Zm3-7H8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1Zm-3-4a1 1 0 0 0-1 1v1h2V5a1 1 0 0 0-1-1Z"/></svg>
              </div>

            </div>
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="md:col-span-4 lg:col-span-4 glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between card-hover-effect group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/5 to-transparent pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-6 text-[#a78bfa]">
              <BrainCircuit size={18} />
              <h2 className="font-display font-semibold tracking-wide uppercase text-sm ai-glow-text">AI HIVE INSIGHT</h2>
            </div>

            <div className="space-y-4">
              <p className="text-[var(--text-secondary)] text-lg font-medium leading-tight">
                {sim.currentSwarmEvent 
                  ? "Anomalous mass reduction detected alongside interior temperature spike. High probability of swarming preparation." 
                  : "Stable internal microclimate maintained despite external temperature drop. Foraging activity normal."}
              </p>
              
              <div className="flex items-center gap-4 mt-6">
                <div className="glass-panel px-3 py-2 rounded-xl border border-[var(--border-subtle)] ai-glow-border">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Confidence</div>
                  <div className="font-mono-data text-xl font-bold text-[var(--text-primary)]">
                    {sim.currentSwarmEvent ? `${sim.currentSwarmEvent.confidence}%` : '98%'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest mb-1.5">Recommendation</div>
            <div className="text-sm font-semibold text-[#fbbf24]">
              {sim.currentSwarmEvent ? 'Immediate visual inspection recommended.' : 'No intervention required.'}
            </div>
          </div>
        </div>

        {/* ROW 3: Charts */}
        
        {/* Chart 1: Thermoregulation */}
        <div className="md:col-span-4 lg:col-span-6 glass-panel rounded-3xl p-5 relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-sm text-[var(--text-secondary)] tracking-wide uppercase">Thermoregulation</h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[var(--text-tertiary)] font-medium tracking-wide">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#fbbf24] rounded-full shadow-[0_0_5px_#fbbf24]" /> Brood
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#60a5fa] rounded-full" /> Ambient
              </span>
            </div>
          </div>
          <div className="h-64 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={sim.currentIndex} data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="broodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={["dataMin - 3", "dataMax + 3"]} tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border-medium)', strokeWidth: 1 }} />
                
                {/* Optimal zone */}
                {chartData.length > 1 && (
                  <ReferenceArea y1={34.5} y2={35.5} fill="#4ade80" fillOpacity={0.05} />
                )}

                <Line type="monotone" dataKey="t_i_1" name="Probe 1" stroke="#fbbf24" strokeWidth={2} dot={false} strokeDasharray="3 3" isAnimationActive={false} />
                <Line type="monotone" dataKey="t_i_2" name="Probe 2" stroke="#60a5fa" strokeWidth={2} dot={false} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="ambient_temp" name="Ambient" stroke="#60a5fa" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="brood_temp" name="Brood Core" stroke="#fbbf24" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#090a0f", stroke: "#fbbf24", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weight Activity */}
        <div className="md:col-span-4 lg:col-span-6 glass-panel rounded-3xl p-5 relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-sm text-[var(--text-secondary)] tracking-wide uppercase">Mass Analytics</h3>
            </div>
          </div>
          <div className="h-64 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border-medium)', strokeWidth: 1 }} />
                
                <Area type="monotone" dataKey="weight_kg" name="Weight" stroke="#a78bfa" strokeWidth={3} fill="url(#weightArea)" dot={false} activeDot={{ r: 6, fill: "#090a0f", stroke: "#a78bfa", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
