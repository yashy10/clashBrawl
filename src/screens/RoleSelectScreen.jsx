import { useState, useEffect } from 'react'
import { useGame, ROLE_CONFIGS, getRankTier, getLevel } from '../GameContext'
import { Button, Card, Badge, ProgressBar } from '../components/ui'

const ROLE_ICONS = {
  attacker: '🥷',
  tank: '🛡️',
  support: '🧝',
}

const ROLE_SILHOUETTES = {
  attacker: '🗡️',
  tank: '🛡️',
  support: '💚',
}

export default function RoleSelectScreen() {
  const { state, dispatch } = useGame()
  const { player } = state
  const [selected, setSelected] = useState(player.selectedRole || 'attacker')
  const [pulseScale, setPulseScale] = useState(1)
  const rank = getRankTier(player.rankPoints)
  const level = getLevel(player.xp)

  useEffect(() => {
    if (!selected) return
    let frame
    const animate = () => {
      setPulseScale(1 + Math.sin(Date.now() / 300) * 0.015)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [selected])

  const handleReady = () => {
    if (!selected) return
    dispatch({ type: 'SELECT_ROLE', role: selected })
    dispatch({ type: 'START_MATCHMAKING' })
  }

  const handleBack = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' })
  }

  return (
    <div className="game-screen">
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
      }}>
        <Button variant="ghost" size="sm" onClick={handleBack}>
          ← Back
        </Button>
        <div style={{
          fontSize: '13px',
          fontWeight: 800,
          color: '#f4a261',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Boss Rush Co-op
        </div>
        <Badge variant="gold" icon="🏆">
          {player.rankPoints.toLocaleString()}
        </Badge>
      </div>

      {/* Player Info */}
      <div style={{
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #4a1a6b 0%, #2d1b4e 100%)',
          border: '2px solid #8b5cf6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          🧙
        </div>
        <div>
          <div style={{
            fontWeight: 700,
            color: '#fff',
            fontSize: '15px',
            letterSpacing: '0.02em',
          }}>
            {player.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#888',
            fontWeight: 500,
          }}>
            Level {level} • {rank.name} Rank
          </div>
        </div>
      </div>

      {/* Role Selection Title */}
      <div style={{
        padding: '20px 16px 12px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#888',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          Select Your Role
        </h2>
      </div>

      {/* Role Cards */}
      <div style={{
        flex: 1,
        padding: '0 16px 16px',
        display: 'flex',
        gap: '10px',
        overflow: 'hidden',
      }}>
        {Object.entries(ROLE_CONFIGS).map(([key, cfg]) => {
          const isSelected = selected === key
          const tier = player.upgrades[key]
          
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 10px',
                borderRadius: '16px',
                cursor: 'pointer',
                background: isSelected
                  ? `linear-gradient(180deg, ${cfg.color}20 0%, rgba(0,0,0,0.3) 100%)`
                  : 'rgba(255,255,255,0.03)',
                border: isSelected 
                  ? `2px solid ${cfg.color}` 
                  : '2px solid rgba(255,255,255,0.08)',
                boxShadow: isSelected 
                  ? `0 0 30px ${cfg.color}40, inset 0 0 30px ${cfg.color}08`
                  : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Selection glow effect */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at center, ${cfg.color}20 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />
              )}
              
              {/* Character figure */}
              <div style={{
                fontSize: '56px',
                marginBottom: '10px',
                filter: isSelected ? 'none' : 'grayscale(0.4) brightness(0.65)',
                transition: 'all 0.3s ease',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              }}>
                {ROLE_ICONS[key]}
              </div>

              {/* Role name */}
              <div style={{
                fontSize: '14px',
                fontWeight: 800,
                color: isSelected ? cfg.color : '#666',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '8px',
                transition: 'color 0.3s ease',
              }}>
                {cfg.name}
              </div>

              {/* Description */}
              <p style={{
                fontSize: '10px',
                color: isSelected ? '#aaa' : '#555',
                textAlign: 'center',
                lineHeight: 1.5,
                margin: 0,
                padding: '0 4px',
                transition: 'color 0.3s ease',
              }}>
                {cfg.desc}
              </p>

              {/* Stats (only when selected) */}
              {isSelected && (
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '14px',
                  width: '100%',
                  borderTop: `1px solid ${cfg.color}30`,
                  animation: 'fadeInUp 0.3s ease',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    color: '#888',
                    marginBottom: '6px',
                  }}>
                    <span>HP</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{cfg.maxHP}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    color: '#888',
                    marginBottom: '6px',
                  }}>
                    <span>DMG</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{cfg.baseDamage}</span>
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: cfg.color,
                    fontWeight: 700,
                    textAlign: 'center',
                    marginTop: '8px',
                    letterSpacing: '0.03em',
                  }}>
                    {cfg.tiers[tier]} (Tier {tier + 1})
                  </div>
                </div>
              )}
              
              {/* Tier indicator dots */}
              <div style={{
                display: 'flex',
                gap: '4px',
                marginTop: isSelected ? '10px' : 'auto',
              }}>
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: i <= tier ? cfg.color : 'rgba(255,255,255,0.1)',
                      boxShadow: i <= tier ? `0 0 6px ${cfg.color}` : 'none',
                    }}
                  />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Party Info */}
      <div style={{
        textAlign: 'center',
        padding: '10px',
      }}>
        <Badge variant="default">
          Players: 1/3
        </Badge>
      </div>

      {/* Ready Button */}
      <div style={{
        padding: '12px 20px 24px',
      }}>
        <Button
          onClick={handleReady}
          disabled={!selected}
          variant={selected ? 'success' : 'default'}
          size="lg"
          style={{
            width: '100%',
            transform: selected ? `scale(${pulseScale})` : 'scale(1)',
            transition: selected ? 'transform 0.1s linear' : 'all 0.15s ease',
            opacity: selected ? 1 : 0.5,
          }}
        >
          {selected ? '✓ Ready for Battle' : 'Select a Role'}
        </Button>
      </div>
    </div>
  )
}
