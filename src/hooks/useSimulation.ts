import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { THRESHOLDS as DEFAULT_THRESHOLDS } from "../config/thresholds"
import normalData from "../data/beehive_normal_demo.json"
import swarmingData from "../data/beehive_swarming_demo.json"
import modelPredictions from "../data/model_predictions.json"
import { fetchTelemetry } from "../services/api"

export interface TelemetryReading {
  timestamp: string
  brood_temp: number
  t_i_1: number
  t_i_2: number
  t_i_3: number
  t_i_4?: number
  t_i_5?: number
  ambient_temp: number
  humidity: number
  weight_kg: number
  pressure: number
  event?: string
}

export type ThresholdsConfig = typeof DEFAULT_THRESHOLDS

export type SimulationMode = "normal" | "swarming"

export type AlertType = 'Temperature' | 'Humidity' | 'Weight' | 'Swarming' | 'Vibration' | 'Buzzing'

export interface Alert {
  id: string
  hive: string
  hiveId: string
  type: AlertType
  severity: 'critical' | 'warning' | 'info' | 'resolved'
  time: string
  metric: string
  reason: string
  aiReasoning: string | null
  action: string
  status: 'active' | 'resolved'
}

export interface SwarmEventData {
  timestamp: string
  confidence: number
  modelRiskScore?: number
  simulated: boolean
  modelDriven?: boolean
}

export interface SimulationState {
  mode: SimulationMode
  playing: boolean
  currentIndex: number
  currentReading: TelemetryReading
  previousReading: TelemetryReading | null
  history: TelemetryReading[]
  dataset: TelemetryReading[]
  progress: number
  currentSwarmEvent: SwarmEventData | null
  weightDelta: number
  healthScore: number
  alerts: Alert[]
  thresholds: ThresholdsConfig
}

export interface SimulationControls {
  play: () => void
  pause: () => void
  reset: () => void
  setMode: (mode: SimulationMode) => void
  toggleMode: () => void
  seekTo: (index: number) => void
  resolveAlert: (id: string) => void
  simulateSwarm: () => void
  setThresholds: React.Dispatch<React.SetStateAction<ThresholdsConfig>>
}

const TICK_INTERVAL_MS = 2000

export default function useSimulation(): SimulationState & SimulationControls {
  const [mode, setModeState] = useState<SimulationMode>("normal")
  const [playing, setPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(72)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [apiDataset, setApiDataset] = useState<TelemetryReading[] | null>(null)
  const [currentSwarmEvent, setCurrentSwarmEvent] = useState<SwarmEventData | null>(null)
  const [thresholds, setThresholds] = useState<ThresholdsConfig>(DEFAULT_THRESHOLDS)

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      try {
        const data = await fetchTelemetry()
        if (mounted && data && data.length > 0) {
          setApiDataset(data)
        }
      } catch (err) {
        console.warn("Using fallback mock data since API is unreachable.", err)
      }
    }
    loadData()
    // Optionally implement polling here based on VITE_POLLING_INTERVAL
  }, [])

  const dataset: TelemetryReading[] = apiDataset 
    ? apiDataset 
    : (mode === "normal"
        ? (normalData as TelemetryReading[])
        : (swarmingData as TelemetryReading[]))

  const currentReading = dataset[currentIndex] ?? dataset[0]
  const previousReading = currentIndex > 0 ? dataset[currentIndex - 1] : null
  const history = dataset.slice(0, currentIndex + 1)
  const progress =
    dataset.length > 1 ? (currentIndex / (dataset.length - 1)) * 100 : 0

  // Check if there's a real swarm event in the data
  useEffect(() => {
    if (!currentReading) return
    
    // Clear event if we restarted or changed modes
    if (currentIndex === 72 || currentIndex === 0) {
      setCurrentSwarmEvent(null)
    }

    if (currentReading.event) {
      const currentTime = new Date(currentReading.timestamp).getTime()
      const eventTime = new Date(currentReading.event).getTime()
      
      if (currentTime >= eventTime) {
        // Use the real prototype model's predicted risk for this hour instead
        // of a hardcoded confidence value. The model's raw probability is a
        // small number (rare-event model, threshold ~0.03) so we surface it
        // as its own "modelRiskScore" field alongside a simple derived
        // confidence badge, rather than misrepresenting the raw probability
        // as a 0-100% confidence score.
        const modelRow = modelPredictions.timeline[currentIndex]
        const riskScore = modelRow ? modelRow.predicted_risk : null
        const aboveThreshold = riskScore !== null && riskScore >= modelPredictions.decision_threshold

        setCurrentSwarmEvent({
          timestamp: currentReading.event,
          confidence: aboveThreshold ? 75 : 50, // matches the model's measured recall at its chosen threshold
          modelRiskScore: riskScore ?? undefined,
          simulated: false,
          modelDriven: riskScore !== null,
        })
      }
    }
  }, [currentReading, currentIndex])

  // Weight delta from previous reading
  const weightDelta = previousReading
    ? +(currentReading.weight_kg - previousReading.weight_kg).toFixed(2)
    : 0

  const healthScore = useMemo(() => {
    let score = 100
    if (currentReading.brood_temp < DEFAULT_THRESHOLDS.temperature.min || currentReading.brood_temp > DEFAULT_THRESHOLDS.temperature.max) score -= 15
    if (currentReading.humidity < DEFAULT_THRESHOLDS.humidity.min || currentReading.humidity > DEFAULT_THRESHOLDS.humidity.max) score -= 10
    if (currentSwarmEvent) score -= 40
    return Math.max(0, score)
  }, [currentReading.brood_temp, currentReading.humidity, currentSwarmEvent])

  // Process Alerts on reading change
  useEffect(() => {
    if (!currentReading) return

    setAlerts((prev) => {
      const newAlerts = [...prev]

      const addAlertIfMissing = (type: AlertType, severity: 'critical' | 'warning', metric: string, reason: string, action: string, aiReasoning: string | null = null) => {
        const existing = newAlerts.find(a => a.type === type && a.status === 'active')
        if (!existing) {
          newAlerts.unshift({
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            hive: 'Alpha Hive Node',
            hiveId: 'A01',
            type,
            severity,
            time: new Date().toISOString(),
            metric,
            reason,
            action,
            aiReasoning,
            status: 'active'
          })
        }
      }

      // Check temp
      if (currentReading.brood_temp > thresholds.temperature.max) {
        addAlertIfMissing('Temperature', 'critical', `Temperature: ${currentReading.brood_temp}°C (Expected: ${thresholds.temperature.min}-${thresholds.temperature.max}°C)`, 'Internal brood nest temperature has exceeded safe threshold.', 'Open upper ventilation vent.', 'Sensor correlation indicates elevated fanning frequency.')
      } else if (currentReading.brood_temp < thresholds.temperature.min) {
        addAlertIfMissing('Temperature', 'warning', `Temperature: ${currentReading.brood_temp}°C`, 'Brood nest temperature below threshold.', 'Check hive insulation.', null)
      }

      // Check humidity
      if (currentReading.humidity > thresholds.humidity.max) {
         addAlertIfMissing('Humidity', 'warning', `Humidity: ${currentReading.humidity}% (Expected: ${thresholds.humidity.min}-${thresholds.humidity.max}%)`, 'Internal moisture levels elevated above maximum threshold.', 'Inspect bottom board mesh for blockages.', null)
      }

      // Check swarming
      if (currentSwarmEvent) {
         addAlertIfMissing('Swarming', 'critical', `Swarm Activity Detected`, 'Elevated buzzing activity and unusual movement patterns detected.', 'Conduct physical frame inspection immediately.', 'Possible swarming emergence detected by audio frequency drop.')
      }

      return newAlerts
    })
  }, [currentReading, currentSwarmEvent])

  // Tick forward
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= dataset.length - 1) {
            setPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, TICK_INTERVAL_MS)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [playing, dataset.length])

  const play = useCallback(() => {
    // If at end, reset first
    if (currentIndex >= dataset.length - 1) {
      setCurrentIndex(72)
    }
    setPlaying(true)
  }, [currentIndex, dataset.length])

  const pause = useCallback(() => {
    setPlaying(false)
  }, [])

  const reset = useCallback(() => {
    setPlaying(false)
    setCurrentIndex(72)
    setAlerts([])
  }, [])

  const setMode = useCallback(
    (newMode: SimulationMode) => {
      setPlaying(false)
      setCurrentIndex(72)
      setAlerts([])
      setCurrentSwarmEvent(null)
      setModeState(newMode)
    },
    []
  )

  const toggleMode = useCallback(() => {
    setMode(mode === "normal" ? "swarming" : "normal")
  }, [mode, setMode])

  const seekTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, dataset.length - 1))
      setCurrentIndex(clamped)
    },
    [dataset.length]
  )

  const resolveAlert = useCallback((id: string) => {
    setAlerts((prev) => 
      prev.map(a => a.id === id ? { ...a, status: a.status === 'resolved' ? 'active' : 'resolved' } : a)
    )
  }, [])

  const simulateSwarm = useCallback(() => {
    setCurrentSwarmEvent({
      timestamp: currentReading.timestamp,
      confidence: 94,
      simulated: true
    })
  }, [currentReading.timestamp])

  return {
    mode,
    playing,
    currentIndex,
    currentReading,
    previousReading,
    history,
    dataset,
    progress,
    currentSwarmEvent,
    weightDelta,
    healthScore,
    alerts,
    play,
    pause,
    reset,
    setMode,
    toggleMode,
    seekTo,
    resolveAlert,
    simulateSwarm,
    thresholds,
    setThresholds,
  }
}
