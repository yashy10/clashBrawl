import { useState, useEffect, useRef } from 'react'
import { useGame } from '../GameContext'
import { Button, Card, Badge } from '../components/ui'

const RARITY_COLORS = {
  common: { primary: '#a0522d', glow: '#cd853f', name: 'Common', gradient: 'linear-gradient(135deg, #8b6914 0%, #a0522d 100%)' },
  rare: { primary: '#8b5cf6', glow: '#a78bfa', name: 'Rare', gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' },
  epic: { primary: '#ffd700', glow: '#ffe066', name: 'Epic', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ffd700 100%)' },
}

// Confetti Component
function Confetti({ color }) {
  const confettiColors = [color, '#ffd700', '#8b5cf6', '#4ade80', '#f4a261', '#e63946']
  
  return (
    <>
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: `${5 + Math.random() * 8}px`,
            height: `${5 + Math.random() * 8}px`,
            background: confettiColors[i % confettiColors.length],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${2 + Math.random() * 2}s linear ${Math.random() * 1.5}s infinite`,
            opacity: 0.85,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  )
}

// Light Beam Effect
function LightBeam({ color }) {
  return (
    <div style={{
      position: 'absolute',
      top: '15%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      height: '500px',
      background: `radial-gradient(ellipse 60% 100% at 50% 0%, ${color}25 0%, transparent 60%)`,
      pointerEvents: 'none',
      animation: 'beamPulse 3s ease-in-out infinite',
    }} />
  )
}

export default function ChestScreen() {
  const { state, dispatch } = useGame()
  const { chestReward, player } = state
  const [phase, setPhase] = useState('closed')
  const [revealedSlots, setRevealedSlots] = useState(0)
  const [animatedTokens, setAnimatedTokens] = useState(0)
  const [animatedXP, setAnimatedXP] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const reward = chestReward || { tokens: 250, upgradeCores: 1, xp: 500, rarity: 'rare' }
  const rarity = RARITY_COLORS[reward.rarity] || RARITY_COLORS.common

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('opening')
      setShowConfetti(true)
    }, 600)

    const t2 = setTimeout(() => {
      setPhase('revealed')
      setTimeout(() => setRevealedSlots(1), 200)
      setTimeout(() => setRevealedSlots(2), 500)
      setTimeout(() => setRevealedSlots(3), 800)
    }, 1400)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (revealedSlots < 1) return
    const target = reward.tokens
    const duration = 1200
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      setAnimatedTokens(Math.floor(target * easeProgress))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [revealedSlots])

  useEffect(() => {
    if (revealedSlots < 3) return
    const target = reward.xp
    const duration = 1200
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      setAnimatedXP(Math.floor(target * easeProgress))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [revealedSlots])

  const handleCollect = () => {
    dispatch({ type: 'COLLECT_REWARDS' })
  }

  return (
    <div className="game-screen" style={{
      background: `
        radial-gradient(ellipse at 50% 0%, ${rarity.glow}15 0%, transparent 50%),
        linear-gradient(180deg, #0f0a1e 0%, #1a0f2e 30%, #0a0a14 100%)
      `,
    }}>
      <LightBeam color={rarity.glow} />
      {showConfetti && <Confetti color={rarity.primary} />}

      {/* Banner */}
      <div style={{
        textAlign: 'center',
        padding: '24px 16px 8px',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeInDown 0.5s ease',
      }}>
        <Badge 
          variant={reward.rarity === 'epic' ? 'gold' : reward.rarity === 'rare' ? 'primary' : 'default'}
          style={{ marginBottom: '12px' }}
        >
          {rarity.name} Chest
        </Badge>
        
        <h1 style={{
          fontSize: '36px',
          fontWeight: 900,
          background: rarity.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: `0 0 40px ${rarity.glow}60`,
          letterSpacing: '0.06em',
          margin: '8px 0',
        }}>
          Chest Opened!
        </h1>
        
        <p style={{
          fontSize: '13px',
          color: '#888',
          margin: '4px 0 0',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Rewards Revealed
        </p>
      </div>

      {/* Chest */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          fontSize: phase === 'closed' ? '80px' : '90px',
          transition: 'all 0.5s ease',
          filter: `drop-shadow(0 0 40px ${rarity.glow}80)`,
          animation: phase === 'closed' ? 'chestBounce 2s ease-in-out infinite' : 'none',
          transform: phase === 'opening' ? 'scale(1.15)' : 'scale(1)',
          lineHeight: 1,
        }}>
          {phase === 'closed' ? '🎁' : '🎊'}
        </div>
      </div>

      {/* Reward Slots */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '0 20px',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Tokens */}
        <RewardSlot
          revealed={revealedSlots >= 1}
          delay={0}
          icon="🪙"
          value={revealedSlots >= 1 ? animatedTokens.toLocaleString() : '?'}
          label="Tokens"
          color="#ffd700"
        />

        {/* Upgrade Core */}
        <RewardSlot
          revealed={revealedSlots >= 2}
          delay={0.1}
          icon="⚙️"
          value={revealedSlots >= 2 ? reward.upgradeCores : '?'}
          label="Upgrade Core"
          color="#f4a261"
        />

        {/* XP */}
        <RewardSlot
          revealed={revealedSlots >= 3}
          delay={0.2}
          icon="✨"
          value={revealedSlots >= 3 ? animatedXP.toLocaleString() : '?'}
          label="XP Points"
          color="#ffd700"
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Reward Balance */}
      <div style={{
        textAlign: 'center',
        padding: '16px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 24px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
        }}>
          <span style={{ fontSize: '12px', color: '#888' }}>New Balance</span>
          <span style={{
            color: '#ffd700',
            fontWeight: 800,
            fontSize: '18px',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            🪙 {player.tokenBalance.toLocaleString()}
          </span>
          {revealedSlots >= 1 && (
            <span style={{
              color: '#4ade80',
              fontWeight: 700,
              fontSize: '14px',
            }}>
              +{reward.tokens}
            </span>
          )}
        </div>
      </div>

      {/* Collect Button */}
      <div style={{
        padding: '8px 20px 24px',
        position: 'relative',
        zIndex: 10,
      }}>
        <Button
          onClick={handleCollect}
          disabled={revealedSlots < 3}
          variant={revealedSlots >= 3 ? 'primary' : 'ghost'}
          size="lg"
          style={{
            width: '100%',
            opacity: revealedSlots >= 3 ? 1 : 0.5,
          }}
        >
          {revealedSlots >= 3 ? (
            <>
              <span style={{ marginRight: '8px' }}>🎉</span>
              Collect All Rewards
            </>
          ) : (
            'Opening...'
          )}
        </Button>
      </div>
    </div>
  )
}

function RewardSlot({ revealed, delay, icon, value, label, color }) {
  return (
    <div style={{
      flex: 1,
      maxWidth: '120px',
      borderRadius: '18px',
      padding: '20px 12px',
      background: revealed 
        ? `linear-gradient(180deg, ${color}15 0%, rgba(0,0,0,0.2) 100%)`
        : 'rgba(255,255,255,0.03)',
      border: revealed 
        ? `2px solid ${color}` 
        : '2px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      transform: revealed ? 'scale(1)' : 'scale(0.9)',
      opacity: revealed ? 1 : 0.4,
      transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s`,
      boxShadow: revealed ? `0 0 24px ${color}30` : 'none',
    }}>
      <div style={{
        fontSize: '40px',
        filter: revealed ? `drop-shadow(0 0 12px ${color}50)` : 'none',
        transition: 'all 0.3s ease',
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: 900,
        color: revealed ? color : '#555',
        fontFamily: 'JetBrains Mono, monospace',
        transition: 'color 0.3s ease',
        textShadow: revealed ? `0 0 20px ${color}40` : 'none',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '10px',
        color: revealed ? '#888' : '#555',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        transition: 'color 0.3s ease',
      }}>
        {label}
      </div>
    </div>
  )
}
