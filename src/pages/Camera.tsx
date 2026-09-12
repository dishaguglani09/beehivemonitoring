import React, { useState, useEffect } from 'react'
import {
  Camera as CameraIcon,
  Play,
  Pause,
  Maximize2,
  Download,
  RotateCw,
  Sparkles,
  Eye,
  EyeOff,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { hives } from '../data/mockData'

const sampleDetections = [
  { id: 1, type: 'Forager Bee', x: 28, y: 35, conf: 96, label: 'Pollen Carrier' },
  { id: 2, type: 'Forager Bee', x: 42, y: 55, conf: 94, label: 'Entering Hive' },
  { id: 3, type: 'Guard Bee', x: 68, y: 62, conf: 97, label: 'Entrance Guard' },
  { id: 4, type: 'Forager Bee', x: 52, y: 28, conf: 91, label: 'Exiting Flight' },
  { id: 5, type: 'Worker Cluster', x: 78, y: 44, conf: 98, label: 'Ventilation Fan' },
]

export default function Camera() {
  const [selectedHive, setSelectedHive] = useState(hives[0]?.id || 'A01')
  const [isPlaying, setIsPlaying] = useState(true)
  const [showOverlays, setShowOverlays] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [beeCount, setBeeCount] = useState(124)
  const [snapshotTaken, setSnapshotTaken] = useState(false)
  const [snapshots, setSnapshots] = useState([
    { id: 1, time: '10:45 AM', count: 128, label: 'High Morning Flight' },
    { id: 2, time: '09:30 AM', count: 114, label: 'Pollen Peak' },
    { id: 3, time: '08:15 AM', count: 86, label: 'Early Emergence' },
  ])

  // Real-time bee count fluctuation simulation
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setBeeCount(c => Math.max(90, Math.min(160, c + Math.floor(Math.random() * 7) - 3)))
    }, 2800)
    return () => clearInterval(interval)
  }, [isPlaying])

  const handleTakeSnapshot = () => {
    setSnapshotTaken(true)
    const newSnap = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      count: beeCount,
      label: 'Manual Snapshot',
    }
    setSnapshots([newSnap, ...snapshots.slice(0, 4)])
    setTimeout(() => setSnapshotTaken(false), 2000)
  }

  const activeHiveObj = hives.find(h => h.id === selectedHive) || hives[0] || { id: 'A01', name: 'Alpha Hive Node', location: 'Apiary 1' }

  return (
    <div className="space-y-6">
      {/* Hive selector & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel border border-[var(--border-subtle)] rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="glass-panel border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 w-fit">
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
          <StatusBadge status="live" label="● 1080P 24FPS" size="md" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Live Feed Container (cols 8) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="relative aspect-[16/9] bg-black rounded-3xl border border-[var(--border-medium)] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] group">
            {/* Visual background simulation */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1c1917] via-[#292524] to-[#1c1917] opacity-90" />

            {/* Honeycomb lattice texture */}
            <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
              <Layers size={200} className="text-[var(--text-primary)] drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            </div>

            {/* Live Camera Overlays (Bounding boxes) */}
            {showOverlays &&
              sampleDetections.map(box => (
                <div
                  key={box.id}
                  className="absolute border-2 border-[#4ade80] rounded bg-[#4ade80]/10 transition-all duration-300 pointer-events-none shadow-[0_0_10px_rgba(74,222,128,0.3)]"
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: '18%',
                    height: '22%',
                  }}
                >
                  <div className="absolute -top-6 left-[-2px] bg-[#4ade80] text-[var(--bg-main)] text-[10px] font-mono-data font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                    {box.label} ({box.conf}%)
                  </div>
                </div>
              ))}

            {/* Simulated Heatmap glow */}
            {showHeatmap && (
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 via-amber-500/40 to-green-500/30 mix-blend-screen pointer-events-none filter blur-xl" />
            )}

            {/* Live Feed Top Metadata */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs text-[var(--text-primary)] z-10">
              <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[var(--border-medium)] shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444] animate-pulse" />
                <span className="font-bold tracking-wide">{activeHiveObj.name} Live Feed</span>
                <span className="text-[var(--text-tertiary)]">|</span>
                <span className="font-mono-data font-bold text-[#fbbf24]">{beeCount} BEES IN FRAME</span>
              </div>

              <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[var(--border-medium)] font-mono-data text-xs font-bold text-[var(--text-secondary)] tracking-wide shadow-lg">
                NVIDIA Jetson Nano · 41ms CV
              </div>
            </div>

            {/* Center Pause Indicator if stopped */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 transition-all">
                <div className="text-center text-[var(--text-primary)] bg-black/50 p-6 rounded-3xl border border-[var(--border-subtle)] shadow-2xl">
                  <Pause size={40} className="mx-auto mb-3 text-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.3)] rounded-full" />
                  <div className="text-lg font-bold tracking-wide uppercase text-[#fbbf24]">Stream Paused</div>
                  <div className="text-xs font-medium text-[var(--text-tertiary)] mt-1">CV inference suspended</div>
                </div>
              </div>
            )}

            {/* Bottom Overlay Controls Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 z-10">
              <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md p-2 rounded-2xl border border-[var(--border-medium)] shadow-xl">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-xl bg-[var(--bg-card-hover)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] flex items-center justify-center transition-all"
                  title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
                </button>

                <div className="w-px h-6 bg-[var(--bg-card-hover)] mx-1" />

                <button
                  onClick={() => setShowOverlays(!showOverlays)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all
                  ${showOverlays ? 'bg-[#a78bfa]/20 text-[#c4b5fd] border border-[#a78bfa]/30' : 'bg-transparent text-[var(--text-tertiary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'}`}
                >
                  {showOverlays ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>CV AI Boxes</span>
                </button>

                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hidden sm:flex
                  ${showHeatmap ? 'bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/30' : 'bg-transparent text-[var(--text-tertiary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'}`}
                >
                  <Activity size={14} />
                  <span>Traffic Heatmap</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleTakeSnapshot}
                  className="px-5 py-2.5 rounded-2xl bg-[#fbbf24]/20 hover:bg-[#fbbf24]/30 border border-[#fbbf24]/40 text-[#fbbf24] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.15)] transition-all"
                >
                  <CameraIcon size={16} />
                  <span>{snapshotTaken ? 'Saved!' : 'Capture'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stream telemetry banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel border border-[var(--border-subtle)] rounded-2xl p-4 text-center group hover:border-[var(--border-medium)] transition-colors">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Current Frame Count</div>
              <div className="font-mono-data text-2xl font-bold text-[var(--text-primary)] mt-1 group-hover:text-[#fbbf24] transition-colors">
                {beeCount}
              </div>
            </div>
            <div className="glass-panel border border-[var(--border-subtle)] rounded-2xl p-4 text-center group hover:border-[var(--border-medium)] transition-colors">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Entrance Traffic</div>
              <div className="font-bold text-sm text-[#4ade80] mt-1.5 uppercase tracking-wide">
                ✓ Heavy Foraging
              </div>
            </div>
            <div className="glass-panel border border-[var(--border-subtle)] rounded-2xl p-4 text-center group hover:border-[var(--border-medium)] transition-colors">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Swarming Risk</div>
              <div className="font-bold text-sm text-[#4ade80] mt-1.5 uppercase tracking-wide">
                Low (11% Index)
              </div>
            </div>
            <div className="glass-panel border border-[var(--border-subtle)] rounded-2xl p-4 text-center group hover:border-[var(--border-medium)] transition-colors">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Camera Hardware</div>
              <div className="font-mono-data font-bold text-sm text-[var(--text-secondary)] mt-1.5">
                1080p · 24fps
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Computer Vision Intelligence (cols 4) */}
        <div className="xl:col-span-4 space-y-6">
          {/* AI Vision Diagnosis */}
          <div className="glass-panel-elevated rounded-3xl border border-[var(--border-subtle)] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#a78bfa]/10 rounded-full blur-[40px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-[#a78bfa]" />
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)] tracking-wide">
                  AI Diagnostics
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                Normal State
              </span>
            </div>

            <div className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed bg-[#a78bfa]/10 border border-[#a78bfa]/20 p-4 rounded-2xl mb-5 shadow-inner relative z-10">
              AI model detects steady bidirectional flight paths. Pollen sac color indexing confirms high mustard & brassica foraging throughput.
            </div>

            <div className="space-y-1 relative z-10">
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Pollen Carriers:</span>
                <span className="font-mono-data font-bold text-[var(--text-primary)] bg-[var(--bg-card-hover)] px-2 py-0.5 rounded">68% of foragers</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Congestion:</span>
                <span className="font-bold text-[#4ade80]">Nominal (Open flow)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Predators:</span>
                <span className="font-bold text-[#4ade80]">None Detected</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Model Engine:</span>
                <span className="font-mono-data font-bold text-[var(--text-secondary)]">BeeYOLOv9-Edge</span>
              </div>
            </div>
          </div>

          {/* Recent Automated Snapshots */}
          <div className="glass-panel rounded-3xl border border-[var(--border-subtle)] p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5 relative z-10">
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)] tracking-wide">
                Captured Clips
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] bg-[var(--bg-card-hover)] px-2 py-1 rounded">{snapshots.length} Snaps</span>
            </div>

            <div className="space-y-3 relative z-10">
              {snapshots.map(snap => (
                <div
                  key={snap.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#60a5fa]/10 flex items-center justify-center text-[#60a5fa] group-hover:bg-[#60a5fa]/20 transition-colors">
                      <CameraIcon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] group-hover:text-[#60a5fa] transition-colors">{snap.label}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{snap.time}</div>
                    </div>
                  </div>
                  <div className="font-mono-data text-sm font-bold text-[#fbbf24] bg-[#fbbf24]/10 px-2.5 py-1 rounded-lg">
                    {snap.count} <span className="text-[10px] text-[#fbbf24]/70">BEES</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
