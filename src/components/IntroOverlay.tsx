import React, { useState, useEffect } from 'react'

export default function IntroOverlay() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)
  const [stage, setStage] = useState<0 | 1 | 2 | 3 | 4>(0)

  useEffect(() => {
    // Stage 0: 0.0s (Environment dark glow)
    // Stage 1: 0.7s (Bee enters, main title fades in)
    const timer1 = setTimeout(() => setStage(1), 700)
    
    // Stage 2: 1.8s (Bee glides towards center, subtitle fades in)
    const timer2 = setTimeout(() => setStage(2), 1800)
    
    // Stage 3: 2.8s (Bee approaches flower & hovers)
    const timer3 = setTimeout(() => setStage(3), 2800)
    
    // Stage 4: 3.7s (Bee gently lands on flower petal, sparkles pop)
    const timer4 = setTimeout(() => setStage(4), 3700)
    
    // Fade out overlay at 4.8s
    const timerFade = setTimeout(() => setIsFading(true), 4800)
    
    // Unmount overlay completely at 5.35s
    const timerEnd = setTimeout(() => setIsVisible(false), 5350)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timerFade)
      clearTimeout(timerEnd)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[999999] pointer-events-none select-none flex flex-col items-center justify-between overflow-hidden transition-opacity duration-700 ease-out ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#06080c',
        backgroundImage: `
          radial-gradient(circle at 75% 55%, rgba(217, 119, 6, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 25% 45%, rgba(16, 185, 129, 0.08) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, rgba(9, 10, 15, 0.5) 0%, #06080c 100%)
        `
      }}
    >
      {/* Background Keyframe Animations */}
      <style>{`
        @keyframes pollenDrift {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          50% { transform: translateY(-25px) translateX(15px); opacity: 0.7; }
          100% { transform: translateY(-50px) translateX(-10px); opacity: 0.2; }
        }
        @keyframes bokehPulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.25); opacity: 0.45; }
        }
        @keyframes wingFlutter {
          0%, 100% { transform: rotate(0deg) scaleY(1); }
          50% { transform: rotate(-25deg) scaleY(0.2); }
        }
        @keyframes flowerSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(1.5deg); }
        }
        @keyframes antennaWiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(4deg); }
          75% { transform: rotate(-4deg); }
        }
        @keyframes sparklePop {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.3) rotate(90deg); opacity: 1; }
          100% { transform: scale(0) rotate(180deg); opacity: 0; }
        }
        @keyframes titleRise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes subtitleRise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes beeContinuousFlight {
          0%   { left: -10%; top: 60%; transform: translate(-50%, -50%) rotate(15deg); }
          5%   { left: -1%;  top: 55%; transform: translate(-50%, -50%) rotate(12deg); }
          10%  { left: 7%;   top: 49%; transform: translate(-50%, -50%) rotate(9deg); }
          15%  { left: 15%;  top: 43%; transform: translate(-50%, -50%) rotate(5deg); }
          20%  { left: 22%;  top: 38%; transform: translate(-50%, -50%) rotate(0deg); }
          25%  { left: 30%;  top: 34%; transform: translate(-50%, -50%) rotate(-3deg); }
          30%  { left: 37%;  top: 31%; transform: translate(-50%, -50%) rotate(-5deg); }
          35%  { left: 45%;  top: 29%; transform: translate(-50%, -50%) rotate(-4deg); }
          40%  { left: 52%;  top: 29%; transform: translate(-50%, -50%) rotate(0deg); }
          45%  { left: 58%;  top: 31%; transform: translate(-50%, -50%) rotate(5deg); }
          50%  { left: 63%;  top: 34%; transform: translate(-50%, -50%) rotate(9deg); }
          55%  { left: 68%;  top: 38%; transform: translate(-50%, -50%) rotate(11deg); }
          60%  { left: 71%;  top: 42%; transform: translate(-50%, -50%) rotate(10deg); }
          65%  { left: 73%;  top: 44%; transform: translate(-50%, -50%) rotate(6deg); }
          70%  { left: 74%;  top: 45%; transform: translate(-50%, -50%) rotate(2deg); }
          74%  { left: 74%;  top: 46%; transform: translate(-50%, -50%) rotate(0deg); }
          100% { left: 74%;  top: 46%; transform: translate(-50%, -50%) rotate(0deg); }
        }
      `}</style>

      {/* Floating Bokeh Ambient Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-72 h-72 rounded-full filter blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, #f59e0b, transparent)',
            top: '35%',
            right: '18%',
            animation: 'bokehPulse 6s ease-in-out infinite'
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full filter blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(circle, #10b981, transparent)',
            bottom: '20%',
            left: '15%',
            animation: 'bokehPulse 8s ease-in-out infinite 1s'
          }}
        />

        {/* Dark Garden Foliage Silhouettes at bottom */}
        <svg
          className="absolute bottom-0 left-0 w-full h-40 opacity-20 pointer-events-none"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,200 L0,140 Q120,110 240,150 T480,120 T720,160 T960,110 T1200,150 T1440,120 L1440,200 Z"
            fill="#0b1710"
          />
          <path
            d="M0,200 L0,160 Q180,130 360,170 T720,140 T1080,175 T1440,150 L1440,200 Z"
            fill="#060f0a"
          />
        </svg>

        {/* Ambient Pollen Particles */}
        {[
          { top: '25%', left: '20%', size: 4, duration: '4s', delay: '0s' },
          { top: '40%', left: '70%', size: 6, duration: '5s', delay: '0.5s' },
          { top: '65%', left: '35%', size: 3, duration: '6s', delay: '1s' },
          { top: '30%', left: '80%', size: 5, duration: '4.5s', delay: '0.2s' },
          { top: '55%', left: '60%', size: 4, duration: '5.5s', delay: '0.7s' },
          { top: '75%', left: '75%', size: 5, duration: '4.8s', delay: '1.2s' },
          { top: '20%', left: '45%', size: 3, duration: '6.5s', delay: '0.4s' }
        ].map((p, idx) => (
          <div
            key={idx}
            className="absolute rounded-full"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#fef08a',
              boxShadow: '0 0 8px #f59e0b',
              animation: `pollenDrift ${p.duration} ease-in-out infinite ${p.delay}`
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative w-full max-w-6xl h-full flex flex-col items-center justify-between py-12 md:py-16 px-6 z-10">
        {/* Top Header / Branding Text */}
        <div className="flex flex-col items-center justify-center text-center mt-8 md:mt-14">
          {stage >= 1 && (
            <h1
              className="text-4xl md:text-6xl font-extrabold tracking-tight"
              style={{
                fontFamily: "'Outfit', -apple-system, sans-serif",
                background: 'linear-gradient(135deg, #fffbeb 0%, #fde68a 35%, #f59e0b 70%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'titleRise 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              Welcome to BeeGuard
            </h1>
          )}

          {stage >= 2 && (
            <p
              className="mt-3 text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-amber-200/60"
              style={{
                fontFamily: "'Inter', -apple-system, sans-serif",
                animation: 'subtitleRise 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              SMART BEEHIVE MONITORING
            </p>
          )}
        </div>

        {/* Flight & Landing Canvas Area */}
        <div className="relative w-full flex-1 max-h-[420px] my-auto">
          {/* Flower on Right Side */}
          <div
            className="absolute bottom-6 right-[12%] md:right-[20%] flex flex-col items-center transition-transform duration-500"
            style={{
              transformOrigin: 'bottom center',
              animation: stage === 4 ? 'none' : 'flowerSway 5s ease-in-out infinite',
              transform: stage === 4 ? 'rotate(3deg) translateY(3px)' : undefined
            }}
          >
            {/* Sparkles on Bee Landing */}
            {stage === 4 && (
              <>
                <svg
                  className="absolute -top-12 left-2 w-8 h-8 text-amber-300 pointer-events-none z-30"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ animation: 'sparklePop 0.8s ease-out forwards' }}
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
                <svg
                  className="absolute -top-8 right-0 w-6 h-6 text-emerald-300 pointer-events-none z-30"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ animation: 'sparklePop 0.8s ease-out 0.2s forwards' }}
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </>
            )}

            {/* Flower Vector SVG */}
            <svg
              width="120"
              height="180"
              viewBox="0 0 120 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_10px_25px_rgba(16,185,129,0.15)]"
            >
              {/* Stem */}
              <path
                d="M60 180 Q58 120 60 70"
                stroke="#15803d"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Left Leaf */}
              <path
                d="M59 130 Q35 120 25 105 Q45 105 59 120"
                fill="#166534"
                stroke="#22c55e"
                strokeWidth="1"
              />
              {/* Right Leaf */}
              <path
                d="M60 110 Q85 100 95 85 Q75 85 60 100"
                fill="#166534"
                stroke="#22c55e"
                strokeWidth="1"
              />

              {/* Flower Petals */}
              <g transform="translate(60, 65)">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <ellipse
                    key={i}
                    cx="0"
                    cy="-22"
                    rx="12"
                    ry="24"
                    fill="url(#petalGrad)"
                    transform={`rotate(${angle})`}
                    opacity="0.95"
                  />
                ))}

                {/* Inner Center Honey Disk */}
                <circle cx="0" cy="0" r="16" fill="url(#centerGrad)" />
                <circle cx="0" cy="0" r="16" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />

                {/* Center Pollen Dots */}
                <circle cx="-5" cy="-4" r="1.5" fill="#fef08a" />
                <circle cx="4" cy="-5" r="1.5" fill="#fef08a" />
                <circle cx="6" cy="3" r="1.5" fill="#fef08a" />
                <circle cx="-3" cy="5" r="1.5" fill="#fef08a" />
                <circle cx="0" cy="0" r="2" fill="#fff" />
              </g>

              <defs>
                <linearGradient id="petalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="60%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#78350f" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Cute Honeybee Position & Flight Dynamics */}
          <div
            className="absolute z-20"
            style={{
              animation: 'beeContinuousFlight 5s linear forwards',
              filter: 'drop-shadow(0 8px 16px rgba(245, 158, 11, 0.35))'
            }}
          >
            {/* Cute Honeybee Vector SVG */}
            <div className="relative">
              <svg
                width="76"
                height="68"
                viewBox="0 0 76 68"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Left Translucent Wing */}
                <g
                  style={{
                    transformOrigin: '32px 26px',
                    animation:
                      stage === 4
                        ? 'wingFlutter 0.3s ease-in-out infinite'
                        : 'wingFlutter 0.08s ease-in-out infinite'
                  }}
                >
                  <ellipse
                    cx="22"
                    cy="14"
                    rx="14"
                    ry="8"
                    fill="url(#wingGrad)"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="0.75"
                    transform="rotate(-30 22 14)"
                  />
                  <path d="M 22 14 L 14 8" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                </g>

                {/* Right Translucent Wing */}
                <g
                  style={{
                    transformOrigin: '40px 26px',
                    animation:
                      stage === 4
                        ? 'wingFlutter 0.32s ease-in-out infinite 0.04s'
                        : 'wingFlutter 0.08s ease-in-out infinite 0.02s'
                  }}
                >
                  <ellipse
                    cx="48"
                    cy="12"
                    rx="14"
                    ry="8"
                    fill="url(#wingGrad)"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="0.75"
                    transform="rotate(25 48 12)"
                  />
                  <path d="M 48 12 L 56 6" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
                </g>

                {/* Antennae */}
                <g style={{ animation: 'antennaWiggle 2s ease-in-out infinite' }}>
                  <path
                    d="M52 28 Q58 20 62 18"
                    stroke="#1c1917"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="63" cy="17" r="2" fill="#fbbf24" />

                  <path
                    d="M48 26 Q52 16 55 14"
                    stroke="#1c1917"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="56" cy="13" r="2" fill="#fbbf24" />
                </g>

                {/* Fluffy Golden Body */}
                <ellipse cx="36" cy="40" rx="22" ry="17" fill="url(#beeBodyGrad)" />

                {/* Dark Bee Stripes */}
                <path
                  d="M26 27 C 28 42, 28 48, 26 53"
                  stroke="#1c1917"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M36 24 C 38 42, 38 52, 36 56"
                  stroke="#1c1917"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <path
                  d="M45 26 C 47 40, 47 48, 45 53"
                  stroke="#1c1917"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Fluffy Gold Texture Highlights */}
                <ellipse cx="34" cy="31" rx="16" ry="4" fill="rgba(254, 240, 138, 0.4)" />

                {/* Head */}
                <circle cx="53" cy="36" r="11" fill="#292524" />
                <circle cx="53" cy="36" r="10" fill="url(#headGrad)" />

                {/* Expressive Eye */}
                <circle cx="56" cy="34" r="3.5" fill="#0c0a09" />
                <circle cx="57.5" cy="32.5" r="1.2" fill="#ffffff" />
                <circle cx="55" cy="35.5" r="0.6" fill="#ffffff" opacity="0.8" />

                {/* Cute Cheek Blush */}
                <ellipse cx="58" cy="39" rx="2" ry="1.2" fill="#f43f5e" opacity="0.5" />

                {/* Stinger Tip */}
                <path d="M14 40 L8 40 L14 42 Z" fill="#1c1917" />

                <defs>
                  <linearGradient id="beeBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="40%" stopColor="#fbbf24" />
                    <stop offset="85%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>

                  <radialGradient id="headGrad" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#44403c" />
                    <stop offset="100%" stopColor="#1c1917" />
                  </radialGradient>

                  <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
                    <stop offset="50%" stopColor="rgba(254, 243, 199, 0.6)" />
                    <stop offset="100%" stopColor="rgba(16, 185, 129, 0.3)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Footer Accent */}
        <div className="text-center opacity-30 text-[10px] md:text-xs font-mono tracking-[0.25em] text-emerald-200 mb-2">
          AI + IOT ECOSYSTEM
        </div>
      </div>
    </div>
  )
}
