import React from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Info, Radio } from 'lucide-react'

export type StatusType = 
  | 'healthy' 
  | 'normal' 
  | 'attention' 
  | 'warning' 
  | 'critical' 
  | 'ai' 
  | 'ai-insight' 
  | 'info' 
  | 'live' 
  | 'offline'

interface StatusBadgeProps {
  status: StatusType | string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export default function StatusBadge({
  status,
  label,
  size = 'md',
  showIcon = true,
  className = '',
}: StatusBadgeProps) {
  const normStatus = status.toLowerCase()

  let color = '#4ade80'
  let bg = 'rgba(74, 222, 128, 0.1)'
  let border = 'rgba(74, 222, 128, 0.2)'
  let shadow = '0 0 10px rgba(74, 222, 128, 0.1)'
  let defaultLabel = '✓ NORMAL'
  let Icon = CheckCircle2

  if (normStatus === 'healthy' || normStatus === 'normal' || normStatus === 'optimal' || normStatus === 'good') {
    color = '#4ade80'
    bg = 'rgba(74, 222, 128, 0.1)'
    border = 'rgba(74, 222, 128, 0.2)'
    shadow = '0 0 10px rgba(74, 222, 128, 0.1)'
    defaultLabel = 'NORMAL'
    Icon = CheckCircle2
  } else if (normStatus === 'attention' || normStatus === 'warning' || normStatus === 'monitor') {
    color = '#fbbf24'
    bg = 'rgba(251, 191, 36, 0.1)'
    border = 'rgba(251, 191, 36, 0.2)'
    shadow = '0 0 10px rgba(251, 191, 36, 0.1)'
    defaultLabel = 'ATTENTION'
    Icon = AlertTriangle
  } else if (normStatus === 'critical' || normStatus === 'danger' || normStatus === 'urgent') {
    color = '#ef4444'
    bg = 'rgba(239, 68, 68, 0.1)'
    border = 'rgba(239, 68, 68, 0.2)'
    shadow = '0 0 10px rgba(239, 68, 68, 0.1)'
    defaultLabel = 'CRITICAL'
    Icon = AlertCircle
  } else if (normStatus === 'ai' || normStatus === 'ai-insight' || normStatus === 'ai insight') {
    color = '#a78bfa'
    bg = 'rgba(167, 139, 250, 0.1)'
    border = 'rgba(167, 139, 250, 0.3)'
    shadow = '0 0 10px rgba(167, 139, 250, 0.2)'
    defaultLabel = 'AI INSIGHT'
    Icon = Sparkles
  } else if (normStatus === 'live' || normStatus === 'online') {
    color = '#4ade80'
    bg = 'rgba(74, 222, 128, 0.1)'
    border = 'rgba(74, 222, 128, 0.2)'
    shadow = '0 0 10px rgba(74, 222, 128, 0.1)'
    defaultLabel = 'LIVE'
    Icon = Radio
  } else if (normStatus === 'info' || normStatus === 'resolved') {
    color = '#60a5fa'
    bg = 'rgba(96, 165, 250, 0.1)'
    border = 'rgba(96, 165, 250, 0.2)'
    shadow = '0 0 10px rgba(96, 165, 250, 0.1)'
    defaultLabel = 'INFO'
    Icon = Info
  } else {
    color = 'rgba(255, 255, 255, 0.6)'
    bg = 'rgba(255, 255, 255, 0.05)'
    border = 'rgba(255, 255, 255, 0.1)'
    shadow = 'none'
    defaultLabel = status.toUpperCase()
    Icon = Info
  }

  const displayText = label || defaultLabel

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    lg: 'text-xs px-3 py-1 gap-1.5',
  }[size]

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wide uppercase rounded border transition-all select-none backdrop-blur-md ${sizeClasses} ${className}`}
      style={{
        color,
        backgroundColor: bg,
        borderColor: border,
        boxShadow: shadow
      }}
    >
      {showIcon && <Icon size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} className="flex-shrink-0" />}
      <span className="tracking-widest leading-none mt-px">{displayText}</span>
    </span>
  )
}
