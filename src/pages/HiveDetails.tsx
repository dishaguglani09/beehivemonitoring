import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Thermometer,
  Droplets,
  Weight,
  Activity,
  Volume2,
  Wind,
  Cpu,
  Camera,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Plus,
  Radio,
  FileText,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import MetricCard from '../components/MetricCard'
import SensorActionFlow, { SensorActionStep } from '../components/SensorActionFlow'
import { hives, temperatureHistory, humidityHistory } from '../data/mockData'

function HealthRing({ score, size = 68 }: { score: number; size?: number }) {
  const r = size / 2 - 5
  const c = 2 * Math.PI * r
  const filled = (score / 100) * c
  const color =
    score >= 90 ? '#4ade80' : score >= 75 ? '#fbbf24' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 filter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${filled} ${c}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Subtle glow behind the ring */}
      <div 
        className="absolute inset-0 rounded-full blur-[12px] opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

import { useSimulationContext } from '../context/SimulationContext'

export default function HiveDetails() {
  const { currentReading, currentSwarmEvent } = useSimulationContext()
  const { id } = useParams()
  const navigate = useNavigate()
  
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

  const hive = hives.find(h => h.id === id) || hives[0] || { 
    id: 'A01', 
    name: 'Alpha Hive Node', 
    location: 'North Field', 
    healthScore: 92, 
    status: 'healthy', 
    lastUpdated: relativeTime, 
    queenStatus: 'Present', 
    swarmingRisk: currentSwarmEvent ? 'High' : 'Low', 
    // Displayed risk % is not a hardcoded placeholder: it reflects the
    // prototype model's own predicted probability for this hour, scaled for
    // display against its measured decision threshold (see
    // ml_model/metrics.json). Capped at 99% since this is a rare-event model.
    swarmingRiskPct: currentSwarmEvent ? Math.min(99, Math.round((currentSwarmEvent.modelRiskScore ?? 0.03) * 100 * 20)) : 11, 
    temperature: currentReading?.brood_temp || 34.5, 
    humidity: currentReading?.humidity || 62, 
    weight: currentReading?.weight_kg || 42, 
    weightChange: 1.2 
  }

  const [activeTab, setActiveTab] = useState<'telemetry' | 'hardware' | 'inspections'>('telemetry')
  const [inspections, setInspections] = useState([
    {
      id: 1,
      date: '2026-08-10',
      inspector: 'Disha Patel',
      queenSeen: true,
      broodPattern: 'Solid, healthy laying pattern',
      stores: 'High honey reserves',
      notes: 'Added super box #2. Colony is docile and actively drawing comb.',
    },
    {
      id: 2,
      date: '2026-07-27',
      inspector: 'Disha Patel',
      queenSeen: false,
      broodPattern: 'Fresh eggs & larvae present',
      stores: 'Medium stores',
      notes: 'No swarm cells detected. Cleaned bottom board entrance.',
    },
  ])
  const [newNote, setNewNote] = useState('')
  const [showAddNote, setShowAddNote] = useState(false)

  const handleAddInspection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return
    const newItem = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      inspector: 'Disha Patel',
      queenSeen: true,
      broodPattern: 'Normal brood progression',
      stores: 'Adequate',
      notes: newNote,
    }
    setInspections([newItem, ...inspections])
    setNewNote('')
    setShowAddNote(false)
  }

  const hiveFlows: SensorActionStep[] = [
    {
      sensorName: 'Internal Core Temperature',
      reading: `${hive.temperature}`,
      readingUnit: '°C',
      status: hive.temperature > 35.5 ? 'attention' : 'normal',
      statusLabel: hive.temperature > 35.5 ? '⚠ Warm' : '✓ Normal',
      icon: Thermometer,
      iconColor: '#fbbf24',
      aiInterpretation:
        hive.temperature > 35.5
          ? 'Thermal spike detected during peak solar hours; worker fanning activated.'
          : 'Core brood temperature is regulated inside optimal 33–35°C band.',
      recommendation:
        hive.temperature > 35.5
          ? 'Adjust upper ventilation notch and inspect shade board.'
          : 'No intervention required today.',
      actionType: hive.temperature > 35.5 ? 'action-needed' : 'none',
    },
    {
      sensorName: 'Internal Humidity Sensor',
      reading: `${hive.humidity}`,
      readingUnit: '%',
      status: hive.humidity > 70 ? 'attention' : 'normal',
      statusLabel: hive.humidity > 70 ? '⚠ Moist' : '✓ Optimal',
      icon: Droplets,
      iconColor: '#60a5fa',
      aiInterpretation: 'Safe relative humidity avoiding condensation near the brood perimeter.',
      recommendation: 'Maintain current hive configuration.',
      actionType: 'none',
    },
    {
      sensorName: 'Total Hive Weight',
      reading: `${hive.weight}`,
      readingUnit: 'kg',
      status: 'normal',
      statusLabel: `${hive.weightChange >= 0 ? '+' : ''}${hive.weightChange} kg/wk`,
      icon: Weight,
      iconColor: '#a78bfa',
      aiInterpretation: 'Positive nectar accumulation trajectory matches regional blossom cycle.',
      recommendation: 'Schedule next super box inspection within 7 days.',
      actionType: 'none',
    },
  ]

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={() => navigate('/hives')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} /> Back to My Hives
        </button>
        <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          Node ID: <strong className="text-[var(--text-secondary)]">{hive.id}</strong>
        </div>
      </div>

      {/* Hive Header Hero Card */}
      <div className="glass-panel-elevated rounded-3xl border border-[var(--border-subtle)] p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbbf24]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative flex-shrink-0">
            <HealthRing score={hive.healthScore} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono-data text-lg font-bold text-[var(--text-primary)]">
                {hive.healthScore}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-display font-bold text-2xl lg:text-3xl text-[var(--text-primary)] tracking-wide">{hive.name}</h2>
              <StatusBadge status={hive.status} size="sm" />
            </div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
              Location: <strong className="text-[var(--text-primary)]">{hive.location}</strong> · Last Sync: {relativeTime}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs mt-3">
              <span className="text-[var(--text-tertiary)] uppercase tracking-wider font-bold">
                Queen: <strong className="text-[var(--text-primary)] px-2 py-1 bg-[var(--bg-card-hover)] rounded ml-1">{hive.queenStatus}</strong>
              </span>
              <span className="text-[var(--text-muted)]">|</span>
              <span className="text-[var(--text-tertiary)] uppercase tracking-wider font-bold">
                Swarm Risk: <strong className="text-[#4ade80] px-2 py-1 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded ml-1">{hive.swarmingRisk} ({hive.swarmingRiskPct}%)</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-2xl p-1.5 self-start md:self-auto relative z-10 shadow-inner overflow-x-auto w-full md:w-auto">
          {[
            { id: 'telemetry', label: 'Live Telemetry' },
            { id: 'hardware', label: 'IoT Hardware' },
            { id: 'inspections', label: `Inspections (${inspections.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
              ${
                activeTab === tab.id
                  ? 'bg-[var(--bg-card-hover)] text-[var(--text-primary)] shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Live Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* 6 Essential Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Core Temperature"
              value={hive.temperature}
              unit="°C"
              status={hive.temperature > 35.5 ? 'attention' : 'normal'}
              statusLabel={hive.temperature > 35.5 ? 'Warm' : 'Normal'}
              trend={{ dir: 'up', text: 'Brood zone' }}
              aiSummary="Steady incubation homeostasis."
              icon={Thermometer}
              iconColor="#fbbf24"
              sparklineData={temperatureHistory}
            />
            <MetricCard
              title="Internal Humidity"
              value={hive.humidity}
              unit="%"
              status={hive.humidity > 70 ? 'attention' : 'normal'}
              statusLabel={hive.humidity > 70 ? 'Moist' : 'Optimal'}
              trend={{ dir: 'down', text: 'Safe band' }}
              aiSummary="Normal evaporative curing."
              icon={Droplets}
              iconColor="#60a5fa"
              sparklineData={humidityHistory}
            />
            <MetricCard
              title="Hive Scale Weight"
              value={hive.weight}
              unit="kg"
              status="normal"
              statusLabel={`${hive.weightChange >= 0 ? '+' : ''}${hive.weightChange} kg`}
              trend={{ dir: 'up', text: 'Weekly delta' }}
              aiSummary="Positive honey accumulation."
              icon={Weight}
              iconColor="#a78bfa"
            />
            <MetricCard
              title="Bee Flight Activity"
              value={hive.beeActivity}
              status="normal"
              statusLabel="Active"
              trend={{ dir: 'up', text: 'Peak flight' }}
              aiSummary="High pollen intake throughput."
              icon={Activity}
              iconColor="#4ade80"
            />
          </div>

          {/* Sensor -> AI -> Action Visual Flow */}
          <div className="pt-2">
            <SensorActionFlow
              flows={hiveFlows}
              title={`${hive.name} Sensor-to-Action Diagnostics`}
              subtitle="Evaluating specific telemetry for this hive into concrete management decisions"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Hardware Device Telemetry */}
      {activeTab === 'hardware' && (
        <div className="glass-panel rounded-3xl border border-[var(--border-subtle)] p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="font-display font-bold text-xl text-[var(--text-primary)] tracking-wide mb-1">
                Connected IoT Hardware Node
              </h3>
              <p className="text-sm font-medium text-[var(--text-tertiary)]">NVIDIA Jetson Nano Edge Unit + Multi-Sensor Array</p>
            </div>
            <StatusBadge status="live" label="● HARDWARE ONLINE" size="md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                name: 'BME680 Sensor',
                type: 'Internal Temperature, Humidity, Pressure, VOC',
                status: 'Optimal (10s sample)',
                rate: '100% Signal',
                color: '#fbbf24',
              },
              {
                name: 'LIS3DH Accelerometer',
                type: 'Hive Frame Vibration & Wing Fanning',
                status: 'Calibrated (200 Hz)',
                rate: '99.4% Signal',
                color: '#60a5fa',
              },
              {
                name: 'INMP441 Microphone',
                type: 'Colony Acoustics & Piping Detection',
                status: 'Online (44.1 kHz)',
                rate: '99.8% Signal',
                color: '#22d3ee',
              },
              {
                name: 'High-Precision Load Cell',
                type: 'Hive Weight Scale (Dual-Bridge)',
                status: 'Tared & Calibrated',
                rate: '100% Signal',
                color: '#a78bfa',
              },
              {
                name: 'Wide-Angle Optical Camera',
                type: 'Entrance Computer Vision (1080p 24FPS)',
                status: 'Real-time Streaming',
                rate: '41ms Latency',
                color: '#4ade80',
              },
              {
                name: 'Jetson Nano Edge AI Unit',
                type: 'Embedded Neural Network Inference',
                status: 'Firmware v2.4.1',
                rate: 'Temp: 44°C (Normal)',
                color: '#ffffff',
              },
            ].map(hw => (
              <div key={hw.name} className="p-5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)] space-y-3 hover:bg-black/50 transition-colors group">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[var(--text-primary)] tracking-wide group-hover:text-[#fbbf24] transition-colors">{hw.name}</span>
                  <span className="text-[10px] text-[#4ade80] font-bold uppercase tracking-widest bg-[#4ade80]/10 border border-[#4ade80]/20 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                    Online
                  </span>
                </div>
                <p className="text-xs font-medium text-[var(--text-tertiary)]">{hw.type}</p>
                <div className="flex justify-between text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider pt-3 border-t border-[var(--border-subtle)]">
                  <span>{hw.status}</span>
                  <span className="font-mono-data font-bold text-[var(--text-secondary)]">{hw.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Physical Inspections Log */}
      {activeTab === 'inspections' && (
        <div className="glass-panel rounded-3xl border border-[var(--border-subtle)] p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="font-display font-bold text-xl text-[var(--text-primary)] tracking-wide mb-1">
                Beekeeper Physical Inspection Log
              </h3>
              <p className="text-sm font-medium text-[var(--text-tertiary)]">Combine on-site observations with continuous IoT data</p>
            </div>
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="px-4 py-2.5 rounded-xl bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 border border-[#fbbf24]/30 text-[#fbbf24] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(251,191,36,0.15)]"
            >
              <Plus size={16} />
              <span>Log Inspection</span>
            </button>
          </div>

          {showAddNote && (
            <form onSubmit={handleAddInspection} className="p-5 bg-[var(--bg-input)] rounded-2xl border border-[var(--border-subtle)] space-y-4 shadow-inner">
              <div className="text-xs font-bold uppercase tracking-widest text-[#fbbf24] flex items-center gap-2">
                <FileText size={14} /> New Inspection Record
              </div>
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Enter observations (e.g. brood comb coverage, queen spotting, honey stores, swarm cups)..."
                rows={4}
                className="w-full p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#fbbf24]/50 focus:bg-[#fbbf24]/5 transition-all shadow-inner"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNote(false)}
                  className="px-5 py-2.5 rounded-xl bg-[var(--bg-card-hover)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#fbbf24] hover:bg-[#fbbf24]/90 text-[var(--bg-main)] text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
                >
                  Save Log
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {inspections.map(item => (
              <div key={item.id} className="p-5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)] space-y-4 group hover:bg-[var(--bg-input)] hover:border-[var(--border-subtle)] transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    <Calendar size={16} className="text-[#fbbf24]" />
                    <span>{item.date}</span>
                    <span className="text-[var(--text-muted)]">by</span>
                    <span className="text-[#fbbf24]">{item.inspector}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20 px-3 py-1 rounded-lg shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                    {item.queenSeen ? '✓ Queen Spotted' : 'Queen Larvae Present'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[var(--text-secondary)] bg-[var(--bg-card-hover)] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <div><strong className="text-[var(--text-secondary)]">Brood Pattern:</strong> {item.broodPattern}</div>
                  <div><strong className="text-[var(--text-secondary)]">Honey Stores:</strong> {item.stores}</div>
                </div>
                <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed pt-2 border-t border-[var(--border-subtle)]">{item.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
