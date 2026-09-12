import React, { useState } from 'react'
import {
  Thermometer,
  Droplets,
  Weight,
  Activity,
  Volume2,
  Wind,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import StatusBadge from '../components/StatusBadge'
import {
  temperatureHistory,
  humidityHistory,
  weightHistory,
  activityHistory,
  hives,
} from '../data/mockData'

const CustomChartTooltip = ({ active, payload, label, unit, color }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-xl text-xs shadow-2xl border border-[var(--border-subtle)]">
      <div className="text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-widest mb-1.5">{label}</div>
      <div className="font-mono-data font-bold text-lg" style={{ color: color || '#fbbf24' }}>
        {payload[0].value} <span className="text-sm text-[var(--text-tertiary)]">{unit || ''}</span>
      </div>
    </div>
  )
}

export default function Analytics() {
  const [selectedHive, setSelectedHive] = useState('A01')
  const [timeRange, setTimeRange] = useState('24H')
  const [activeMetric, setActiveMetric] = useState<'temp' | 'humidity' | 'weight' | 'activity' | 'audio'>('temp')

  const metricConfigs = {
    temp: {
      title: 'Brood Nest Thermoregulation',
      question: 'Is brood nest thermoregulation steady within the optimal larval zone?',
      color: '#fbbf24',
      gradient: ['#fbbf24', '#d97706'],
      unit: '°C',
      data: temperatureHistory,
      minRef: 32,
      maxRef: 36,
      refLabel: 'Brood Target (32–36°C)',
      status: 'Normal · Stable',
      summary: 'Colony maintains tight internal climate control despite external ambient variations.',
    },
    humidity: {
      title: 'Internal Colony Humidity',
      question: 'Is relative humidity avoiding mold risks while maintaining larval hydration?',
      color: '#60a5fa',
      gradient: ['#60a5fa', '#3b82f6'],
      unit: '%',
      data: humidityHistory,
      minRef: 50,
      maxRef: 75,
      refLabel: 'Safe RH Band (50–75%)',
      status: 'Optimal',
      summary: 'Moisture levels indicate normal evaporative honey curing with no condensation danger.',
    },
    weight: {
      title: 'Hive Weight & Nectar Accumulation',
      question: 'How much honey has the colony accumulated this week?',
      color: '#a78bfa',
      gradient: ['#a78bfa', '#8b5cf6'],
      unit: 'kg',
      data: weightHistory.map(w => ({ time: w.date, value: w.value })),
      minRef: 35,
      maxRef: 50,
      refLabel: 'Harvestable Baseline (45 kg)',
      status: 'Growing (+1.2 kg)',
      summary: 'Continuous positive weight gain aligns with peak mustard bloom availability.',
    },
    activity: {
      title: 'Foraging Flight Dynamics',
      question: 'What are the peak forager traffic hours at the hive entrance?',
      color: '#4ade80',
      gradient: ['#4ade80', '#22c55e'],
      unit: '%',
      data: activityHistory,
      minRef: 60,
      maxRef: 95,
      refLabel: 'Active Flight Range',
      status: 'High Throughput',
      summary: 'Forager traffic peaks between 9:00 AM and 1:00 PM matching high solar irradiance.',
    },
    audio: {
      title: 'Acoustic Power & Frequency Spectrum',
      question: 'Are there acoustic signs of queen piping, queenlessness, or swarming preparation?',
      color: '#22d3ee',
      gradient: ['#22d3ee', '#06b6d4'],
      unit: 'dB',
      data: [
        { time: '00:00', value: 58 },
        { time: '04:00', value: 56 },
        { time: '08:00', value: 64 },
        { time: '12:00', value: 72 },
        { time: '16:00', value: 68 },
        { time: '20:00', value: 61 },
      ],
      minRef: 50,
      maxRef: 80,
      refLabel: 'Nominal Buzzing Band',
      status: 'Calm Baseline',
      summary: 'Dominant frequency rests at 210–240 Hz. Swarm piping frequencies (450 Hz) are absent.',
    },
  }

  const current = metricConfigs[activeMetric]

  return (
    <div className="space-y-6">

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="glass-panel border border-[var(--border-subtle)] rounded-2xl px-3 py-1.5 w-fit">
            <select
              value={selectedHive}
              onChange={e => setSelectedHive(e.target.value)}
              className="bg-transparent text-sm font-bold tracking-wide text-[var(--text-primary)] outline-none cursor-pointer appearance-none pr-6 custom-select"
            >
              {hives.map(h => (
                <option key={h.id} value={h.id} className="text-[var(--bg-main)]">
                  {h.name} ({h.location})
                </option>
              ))}
            </select>
          </div>

          <div className="flex glass-panel border border-[var(--border-subtle)] rounded-xl p-1 w-fit">
            {['24H', '7D', '30D', 'Season'].map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all
                ${timeRange === r ? 'bg-[var(--bg-card-hover)] text-[var(--text-primary)] shadow-[0_0_10px_rgba(255,255,255,0.1)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

      {/* Metric Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { id: 'temp', label: 'Temperature', icon: Thermometer, color: '#fbbf24', val: '34.2°C' },
          { id: 'humidity', label: 'Humidity', icon: Droplets, color: '#60a5fa', val: '62%' },
          { id: 'weight', label: 'Hive Weight', icon: Weight, color: '#a78bfa', val: '42.8 kg' },
          { id: 'activity', label: 'Foraging Traffic', icon: Activity, color: '#4ade80', val: '87%' },
          { id: 'audio', label: 'Audio Frequency', icon: Volume2, color: '#22d3ee', val: '67 dB' },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeMetric === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMetric(tab.id as any)}
              className={`p-4 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden group
              ${
                isActive
                  ? 'glass-panel-elevated border-[var(--border-medium)] shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                  : 'glass-panel border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
              }`}
            >
              {isActive && (
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none transition-all duration-500" 
                  style={{ background: `linear-gradient(to bottom right, ${tab.color}, transparent)` }} 
                />
              )}
              
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110 shadow-lg' : 'group-hover:scale-105'}`}
                  style={{ backgroundColor: `${tab.color}20`, border: `1px solid ${tab.color}40` }}
                >
                  <Icon size={18} style={{ color: tab.color }} />
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full live-dot" style={{ backgroundColor: tab.color, boxShadow: `0 0 8px ${tab.color}` }} />
                )}
              </div>
              <div className="text-xs font-bold tracking-widest uppercase text-[var(--text-tertiary)] relative z-10">{tab.label}</div>
              <div className="font-mono-data text-xl font-bold text-[var(--text-primary)] mt-1 relative z-10">{tab.val}</div>
            </button>
          )
        })}
      </div>

      {/* Main Focus Chart Card */}
      <div className="glass-panel-elevated rounded-3xl border border-[var(--border-subtle)] p-6 lg:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-20" style={{ backgroundColor: current.color }} />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-display font-bold text-xl lg:text-2xl text-[var(--text-primary)] tracking-wide">{current.title}</h3>
              <StatusBadge status="normal" label={current.status} size="md" />
            </div>
            <p className="text-sm text-[var(--text-tertiary)] font-medium">{current.question}</p>
          </div>
          <div className="text-xs font-bold tracking-wider uppercase text-[var(--text-secondary)] bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] px-4 py-2 rounded-xl lg:max-w-sm">
            {current.summary}
          </div>
        </div>

        {/* Big Chart Area */}
        <div className="h-80 sm:h-96 -mx-2 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={current.data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={current.gradient[0]} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={current.gradient[1]} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                width={40}
                dx={-10}
              />
              <Tooltip content={<CustomChartTooltip unit={current.unit} color={current.color} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }} />
              {current.minRef && (
                <ReferenceLine
                  y={current.minRef}
                  stroke="#4ade80"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{
                    value: current.refLabel,
                    fill: '#4ade80',
                    fontSize: 10,
                    fontWeight: 'bold',
                    position: 'insideTopLeft',
                    textAnchor: 'start'
                  }}
                />
              )}
              {current.maxRef && (
                <ReferenceLine y={current.maxRef} stroke="#fbbf24" strokeDasharray="4 4" strokeOpacity={0.5} />
              )}
              <Area
                type="monotone"
                dataKey="value"
                unit={current.unit}
                stroke={current.color}
                strokeWidth={3}
                fill="url(#analyticsGrad)"
                dot={false}
                activeDot={{ r: 6, fill: '#000', stroke: current.color, strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Environmental Correlations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl border border-[var(--border-subtle)] p-6 group hover:border-[var(--border-medium)] transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#fbbf24]/5 rounded-full blur-[30px] transition-all group-hover:bg-[#fbbf24]/10" />
          <h4 className="font-display font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider mb-1 relative z-10">
            Brood Temp vs Ambient Solar
          </h4>
          <p className="text-xs font-medium text-[var(--text-tertiary)] mb-4 relative z-10">Thermoregulatory efficiency correlation</p>
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)] space-y-3 text-xs relative z-10 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-bold tracking-wide">Ambient Temp Range</span>
              <span className="font-mono-data font-bold text-[var(--text-primary)] bg-[var(--bg-card-hover)] px-2 py-0.5 rounded">18.4°C – 32.1°C</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-bold tracking-wide">Internal Core Variance</span>
              <span className="font-mono-data font-bold text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20 px-2 py-0.5 rounded">±0.4°C (Tight)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-bold tracking-wide">Correlation Factor</span>
              <span className="font-bold text-[#4ade80]">r = 0.12 (High Insul.)</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-[var(--border-subtle)] p-6 group hover:border-[var(--border-medium)] transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#4ade80]/5 rounded-full blur-[30px] transition-all group-hover:bg-[#4ade80]/10" />
          <h4 className="font-display font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider mb-1 relative z-10">
            Flight Traffic vs Sun Hours
          </h4>
          <p className="text-xs font-medium text-[var(--text-tertiary)] mb-4 relative z-10">Forager departure window response</p>
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)] space-y-3 text-xs relative z-10 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-bold tracking-wide">Peak Flight Window</span>
              <span className="font-bold text-[var(--text-primary)] bg-[var(--bg-card-hover)] px-2 py-0.5 rounded">9:00 AM – 1:00 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-bold tracking-wide">Light Intensity Trigger</span>
              <span className="font-mono-data font-bold text-[var(--text-primary)] bg-[var(--bg-card-hover)] px-2 py-0.5 rounded">45,000 Lux</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-bold tracking-wide">Efficiency Index</span>
              <span className="font-bold text-[#4ade80]">94% Foraging</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-[var(--border-subtle)] p-6 group hover:border-[var(--border-medium)] transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#a78bfa]/5 rounded-full blur-[30px] transition-all group-hover:bg-[#a78bfa]/10" />
          <h4 className="font-display font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider mb-1 relative z-10">
            Weight Gain vs Audio Freq.
          </h4>
          <p className="text-xs font-medium text-[var(--text-tertiary)] mb-4 relative z-10">Comb building & nectar curing activity</p>
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)] space-y-3 text-xs relative z-10 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-bold tracking-wide">Night Curing Hum</span>
              <span className="font-mono-data font-bold text-[var(--text-primary)] bg-[var(--bg-card-hover)] px-2 py-0.5 rounded">62 dB (Evap.)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-bold tracking-wide">Net Accumulation</span>
              <span className="font-mono-data font-bold text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20 px-2 py-0.5 rounded">+0.32 kg/d</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] font-bold tracking-wide">Comb Occupancy</span>
              <span className="font-bold text-[#fbbf24]">78% Super</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
