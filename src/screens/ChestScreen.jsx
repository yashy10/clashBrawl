import { useState, useEffect, useRef } from 'react'
import { useGame } from '../GameContext'

const RARITY_COLORS = {
  common: { primary: '#a0522d', glow: '#cd853f', name: 'COMMON' },
  rare: { primary: '#8b5cf6', glow: '#a78bfa', name: 'RARE' },
  epic: { primary: '#ffd700', glow: '#ffe066', name: 'EPIC' },
}

export default function ChestScreen() {
  const { state, dispatch } = useGame()
  const { chestReward, player } = state
  const [phase, setPhase] = useState('closed') // closed, opening, revealed
  const [revealedSlots, setRevealedSlots] = useState(0)
  const [animatedTokens, setAnimatedTokens] = useState(0)
  const [animatedXP, setAnimatedXP] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const reward = chestReward || { tokens: 250, upgradeCores: 1, xp: 500, rarity: 'rare' }
  const rarity = RARITY_COLORS[reward.rarity] || RARITY_COLORS.common

  useEffect(() => {
    // Auto-open sequence
    const t1 = setTimeout(() => {
      setPhase('opening')
      setShowConfetti(true)
    }, 800)

    const t2 = setTimeout(() => {
      setPhase('revealed')
      // Stagger reveal slots
      setTimeout(() => setRevealedSlots(1), 300)
      setTimeout(() => setRevealedSlots(2), 600)
      setTimeout(() => setRevealedSlots(3), 900)
    }, 1800)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Animate token counter
  useEffect(() => {
    if (revealedSlots < 1) return
    const target = reward.tokens
    const duration = 1000
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setAnimatedTokens(Math.floor(target * progress))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [revealedSlots])

  // Animate XP counter
  useEffect(() => {
    if (revealedSlots < 3) return
    const target = reward.xp
    const duration = 1000
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setAnimatedXP(Math.floor(target * progress))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [revealedSlots])

  const handleCollect = () => {
    dispatch({ type: 'COLLECT_REWARDS' })
  }

  const confettiColors = ['#ffd700', '#8b5cf6', '#e63946', '#4ade80', '#f4a261']

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 30%, #0a0a1a 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Light beams */}
      {phase !== 'closed' && (
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '300px', height: '400px',
          background: `radial-gradient(ellipse at center, ${rarity.glow}33 0%, transparent 70%)`,
          pointerEvents: 'none', animation: 'beamPulse 2s ease-in-out infinite',
        }} />
      )}

      {/* Confetti */}
      {showConfetti && Array.from({ length: 25 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${Math.random() * 100}%`, top: '-10px',
          width: `${4 + Math.random() * 5}px`, height: `${4 + Math.random() * 5}px`,
          background: confettiColors[i % confettiColors.length],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confettiFall ${2 + Math.random() * 3}s linear ${Math.random() * 1.5}s infinite`,
          opacity: 0.7, pointerEvents: 'none',
        }} />
      ))}

      {/* Banner */}
      <div style={{ textAlign: 'center', padding: '24px 16px 8px' }}>
        <div style={{ fontSize: '12px', color: rarity.glow, fontWeight: 600, letterSpacing: '2px', marginBottom: '4px' }}>
          CHEST OPENED!
        </div>
        <div style={{
          fontSize: '36px', fontWeight: 900, color: rarity.primary,
          textShadow: `0 0 30px ${rarity.glow}55`,
          letterSpacing: '3px',
        }}>CHEST OPENED!</div>
        <div style={{ fontSize: '13px', color: '#bbb', marginTop: '4px' }}>
          REWARDS REVEALED
        </div>
      </div>

      {/* Chest */}
      <div style={{
        textAlign: 'center', padding: '20px',
      }}>
        <div style={{
          fontSize: phase === 'closed' ? '72px' : '80px',
          transition: 'all 0.5s',
          filter: `drop-shadow(0 0 30px ${rarity.glow}66)`,
          animation: phase === 'closed' ? 'chestBounce 2s ease-in-out infinite' : 'none',
          transform: phase === 'opening' ? 'scale(1.2)' : 'scale(1)',
        }}>
          {phase === 'closed' ? '🎁' : '🎊'}
        </div>
      </div>

      {/* Reward Slots */}
      <div style={{
        display: 'flex', gap: '12px', padding: '0 24px', justifyContent: 'center',
      }}>
        {/* Tokens */}
        <div style={{
          flex: 1, borderRadius: '16px', padding: '16px 8px',
          background: revealedSlots >= 1 ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
          border: revealedSlots >= 1 ? '2px solid #8b5cf6' : '2px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          transform: revealedSlots >= 1 ? 'scale(1)' : 'scale(0.8)',
          opacity: revealedSlots >= 1 ? 1 : 0.3,
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <div style={{ fontSize: '36px' }}>🪙</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#ffd700' }}>
            {revealedSlots >= 1 ? animatedTokens : '?'}
          </div>
          <div style={{ fontSize: '10px', color: '#888', fontWeight: 600, letterSpacing: '1px' }}>
            REWARD TOKENS
          </div>
        </div>

        {/* Upgrade Core */}
        <div style={{
          flex: 1, borderRadius: '16px', padding: '16px 8px',
          background: revealedSlots >= 2 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
          border: revealedSlots >= 2 ? '2px solid #f59e0b' : '2px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          transform: revealedSlots >= 2 ? 'scale(1)' : 'scale(0.8)',
          opacity: revealedSlots >= 2 ? 1 : 0.3,
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <div style={{ fontSize: '36px' }}>⚙️</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#f4a261' }}>
            {revealedSlots >= 2 ? reward.upgradeCores : '?'}
          </div>
          <div style={{ fontSize: '10px', color: '#888', fontWeight: 600, letterSpacing: '1px' }}>
            UPGRADE CORE
          </div>
        </div>

        {/* XP */}
        <div style={{
          flex: 1, borderRadius: '16px', padding: '16px 8px',
          background: revealedSlots >= 3 ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.03)',
          border: revealedSlots >= 3 ? '2px solid #ffd700' : '2px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          transform: revealedSlots >= 3 ? 'scale(1)' : 'scale(0.8)',
          opacity: revealedSlots >= 3 ? 1 : 0.3,
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <div style={{ fontSize: '36px' }}>✨</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#ffd700' }}>
            {revealedSlots >= 3 ? animatedXP : '?'}
          </div>
          <div style={{ fontSize: '10px', color: '#888', fontWeight: 600, letterSpacing: '1px' }}>
            XP POINTS
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Reward Balance */}
      <div style={{
        textAlign: 'center', padding: '12px',
        fontSize: '13px', color: '#888',
      }}>
        REWARD BALANCE: <span style={{ color: '#ffd700', fontWeight: 700 }}>
          {player.tokenBalance.toLocaleString()}
        </span>
        {revealedSlots >= 1 && (
          <span style={{ color: '#4ade80', fontWeight: 700 }}> + {reward.tokens}</span>
        )}
      </div>

      {/* Collect Button */}
      <div style={{ padding: '8px 16px 24px' }}>
        <button onClick={handleCollect} disabled={revealedSlots < 3} style={{
          width: '100%', padding: '18px', borderRadius: '14px',
          background: revealedSlots >= 3
            ? `linear-gradient(180deg, ${rarity.primary}, ${rarity.primary}cc)`
            : 'rgba(255,255,255,0.05)',
          border: revealedSlots >= 3 ? `3px solid ${rarity.glow}` : '3px solid rgba(255,255,255,0.05)',
          fontSize: '20px', fontWeight: 900, color: revealedSlots >= 3 ? '#fff' : '#555',
          cursor: revealedSlots >= 3 ? 'pointer' : 'default', letterSpacing: '2px',
          boxShadow: revealedSlots >= 3 ? `0 0 30px ${rarity.glow}44` : 'none',
        }}>
          COLLECT ALL
        </button>
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(720deg); }
        }
        @keyframes chestBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes beamPulse {
          0%, 100% { opacity: 0.5; } 50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
