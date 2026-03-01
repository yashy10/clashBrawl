import { useGame, ROLE_CONFIGS, getRankTier, getLevel, getBossConfig } from '../GameContext'
import { useState, useEffect, useRef } from 'react'
import { Button, Card, Badge, ProgressBar } from '../components/ui'

// Particle effect component for background
function ParticleBackground({ bossColor }) {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)
    
    const particles = []
    const particleCount = 25
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }
    
    let frame = 0
    let animId
    
    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      
      particles.forEach((p, i) => {
        p.x += p.speedX
        p.y += p.speedY
        
        if (p.x < 0) p.x = canvas.offsetWidth
        if (p.x > canvas.offsetWidth) p.x = 0
        if (p.y < 0) p.y = canvas.offsetHeight
        if (p.y > canvas.offsetHeight) p.y = 0
        
        const pulse = Math.sin((frame + i * 100) * 0.02) * 0.3 + 0.7
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(100, 140, 255, ${p.opacity * pulse})`
        ctx.fill()
      })
      
      // Draw hexagonal grid pattern
      ctx.strokeStyle = `rgba(100, 140, 255, 0.03)`
      ctx.lineWidth = 1
      const hexSize = 40
      for (let y = -hexSize; y < canvas.offsetHeight + hexSize; y += hexSize * 0.866) {
        for (let x = -hexSize; x < canvas.offsetWidth + hexSize; x += hexSize * 1.5) {
          const offset = ((y / (hexSize * 0.866)) % 2) * (hexSize * 0.75)
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (i * 60 - 30) * Math.PI / 180
            const px = x + offset + hexSize * 0.5 * Math.cos(angle)
            const py = y + hexSize * 0.5 * Math.sin(angle)
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.stroke()
        }
      }
      
      // Boss glow effect
      const gradient = ctx.createRadialGradient(
        canvas.offsetWidth / 2, canvas.offsetHeight * 0.35, 0,
        canvas.offsetWidth / 2, canvas.offsetHeight * 0.35, 150
      )
      gradient.addColorStop(0, `${bossColor}15`)
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      
      animId = requestAnimationFrame(draw)
    }
    
    animId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [bossColor])
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}

// Settings Modal Component
function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null
  
  const settings = [
    { label: 'Sound Effects', enabled: true },
    { label: 'Music', enabled: true },
    { label: 'Haptics', enabled: true },
  ]
  
  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        animation: 'fadeIn 0.2s ease-out',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '320px',
          background: 'linear-gradient(180deg, #1e2540 0%, #141828 100%)',
          border: '2px solid #3a4060',
          borderRadius: '20px',
          overflow: 'hidden',
          animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          background: 'linear-gradient(180deg, #e63946 0%, #c1121f 100%)',
          padding: '16px 20px',
          textAlign: 'center',
          borderBottom: '3px solid #8b0000',
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#fff',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>Settings</h3>
        </div>
        
        <div style={{ padding: '16px 20px' }}>
          {settings.map((setting) => (
            <div 
              key={setting.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ color: '#ccc', fontSize: '14px', fontWeight: 600 }}>
                {setting.label}
              </span>
              <ToggleSwitch enabled={setting.enabled} />
            </div>
          ))}
          
          <Button 
            variant="danger" 
            onClick={onClose}
            style={{ width: '100%', marginTop: '20px' }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

function ToggleSwitch({ enabled }) {
  const [isOn, setIsOn] = useState(enabled)
  
  return (
    <button
      onClick={() => setIsOn(!isOn)}
      style={{
        width: '48px',
        height: '26px',
        borderRadius: '13px',
        background: isOn 
          ? 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)' 
          : 'rgba(255,255,255,0.1)',
        border: `2px solid ${isOn ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{
        position: 'absolute',
        top: '2px',
        left: isOn ? 'calc(100% - 20px)' : '2px',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        transition: 'left 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }} />
    </button>
  )
}

// Avatar Component
function Avatar({ level }) {
  return (
    <div style={{
      position: 'relative',
      width: '48px',
      height: '48px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #5b2d8e 0%, #3a1d6e 100%)',
        border: '2.5px solid #a78bfa',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
      }}>
        🧙
      </div>
      <div style={{
        position: 'absolute',
        bottom: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
        borderRadius: '8px',
        padding: '2px 8px',
        fontSize: '10px',
        fontWeight: 800,
        color: '#fff',
        border: '1.5px solid #fbbf24',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}>
        {level}
      </div>
    </div>
  )
}

// Main HomeScreen Component
export default function HomeScreen() {
  const { state, dispatch } = useGame()
  const { player } = state
  const rank = getRankTier(player.rankPoints)
  const level = getLevel(player.xp)
  const bossConfig = getBossConfig(player.bossFloor)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedQuickRole, setSelectedQuickRole] = useState(player.selectedRole || 'attacker')
  const [isPressed, setIsPressed] = useState(false)

  const handlePlay = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'roleselect' })
  }

  const quickSelectRole = (role) => {
    setSelectedQuickRole(role)
    dispatch({ type: 'SELECT_ROLE', role })
  }

  return (
    <div className="game-screen">
      <ParticleBackground bossColor={bossConfig.colors.horn} />
      
      {/* Top Bar */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar level={level} />
          <div>
            <div style={{
              fontWeight: 800,
              fontSize: '15px',
              color: '#fff',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              letterSpacing: '0.02em',
            }}>
              {player.name}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#888',
              fontWeight: 500,
            }}>
              Floor {player.bossFloor} Challenger
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Badge variant="gold" icon="🪙">
            {player.tokenBalance.toLocaleString()}
          </Badge>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSettings(true)}
            style={{ borderRadius: '10px' }}
          >
            ⚙️
          </Button>
        </div>
      </div>

      {/* Floor Progress Bar */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        background: 'rgba(0,0,0,0.3)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span style={{
          fontSize: '11px',
          color: '#f4a261',
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          Floor {player.bossFloor}
        </span>
        <div style={{ flex: 1 }}>
          <ProgressBar 
            value={player.bossFloor} 
            max={20} 
            variant="xp"
            size="sm"
          />
        </div>
        <span style={{
          fontSize: '11px',
          color: '#666',
          fontWeight: 700,
        }}>
          / 20
        </span>
      </div>

      {/* Rank Banner */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        background: `linear-gradient(90deg, ${rank.color}15 0%, ${rank.color}08 50%, ${rank.color}15 100%)`,
        borderTop: `1px solid ${rank.color}30`,
        borderBottom: `1px solid ${rank.color}30`,
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🏆</span>
          <span style={{
            fontSize: '18px',
            fontWeight: 900,
            color: rank.color,
            textShadow: `0 0 10px ${rank.color}50`,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {player.rankPoints.toLocaleString()}
          </span>
        </div>
        <Badge 
          variant={rank.name.toLowerCase() === 'bronze' ? 'default' : rank.name.toLowerCase() === 'silver' ? 'primary' : rank.name.toLowerCase() === 'gold' ? 'gold' : 'success'}
        >
          {rank.name}
        </Badge>
      </div>

      {/* Boss Showcase */}
      <div style={{
        flex: 1,
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <Card 
          variant="glow" 
          glowColor={`${bossConfig.colors.horn}33`}
          style={{
            width: '100%',
            maxWidth: '340px',
            padding: '28px 24px',
            background: `
              radial-gradient(ellipse at center top, ${bossConfig.colors.horn}20 0%, transparent 60%),
              linear-gradient(180deg, rgba(20, 10, 40, 0.95) 0%, rgba(10, 5, 25, 0.98) 100%)
            `,
            border: `2px solid ${bossConfig.colors.horn}66`,
          }}
        >
          {/* Boss Avatar */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '100px',
              lineHeight: 1,
              filter: `drop-shadow(0 8px 30px ${bossConfig.colors.horn}60)`,
              animation: 'bossFloat 3s ease-in-out infinite',
            }}>
              {bossConfig.emoji}
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#fff',
                textShadow: `0 0 20px ${bossConfig.colors.horn}50`,
                letterSpacing: '0.03em',
                margin: 0,
              }}>
                {bossConfig.name}
              </h2>
              <p style={{
                fontSize: '11px',
                color: bossConfig.colors.accent,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                margin: '6px 0 0',
              }}>
                {bossConfig.title}
              </p>
            </div>

            {/* HP Bars */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '4px',
              marginTop: '16px',
            }}>
              {Array.from({ length: bossConfig.hpBars }).map((_, i) => (
                <div 
                  key={i}
                  style={{
                    width: '20px',
                    height: '8px',
                    borderRadius: '4px',
                    background: bossConfig.colors.horn,
                    boxShadow: `0 0 8px ${bossConfig.colors.horn}60`,
                    opacity: 0.9,
                  }}
                />
              ))}
              <span style={{
                fontSize: '10px',
                color: '#666',
                marginLeft: '6px',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}>
                {bossConfig.hpBars} BARS
              </span>
            </div>
          </div>

          {/* Party Slots */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {[
              { filled: true, emoji: '🧙' },
              { filled: false },
              { filled: false },
            ].map((slot, i) => (
              <div 
                key={i}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: slot.filled
                    ? 'linear-gradient(135deg, #5b2d8e 0%, #3a1d6e 100%)'
                    : 'rgba(255,255,255,0.04)',
                  border: slot.filled
                    ? '2px solid #a78bfa'
                    : '2px dashed rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: slot.filled ? '28px' : '20px',
                  color: slot.filled ? '#fff' : '#555',
                  boxShadow: slot.filled 
                    ? '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
                    : 'none',
                }}
              >
                {slot.filled ? slot.emoji : '+'}
              </div>
            ))}
          </div>
          <p style={{
            textAlign: 'center',
            fontSize: '11px',
            color: '#666',
            fontWeight: 600,
            marginTop: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Party 1 / 3
          </p>
        </Card>
      </div>

      {/* Action Buttons */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '0 20px 16px',
        display: 'flex',
        gap: '12px',
      }}>
        <Button
          variant="primary"
          size="lg"
          onClick={handlePlay}
          style={{ 
            flex: 2,
            fontSize: '22px',
            letterSpacing: '0.15em',
          }}
        >
          <span style={{ marginRight: '8px' }}>⚔️</span>
          BATTLE
        </Button>

        <Button
          variant="secondary"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'upgrade' })}
          style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <span style={{ fontSize: '22px' }}>⚡</span>
          <span style={{ fontSize: '11px' }}>Upgrade</span>
        </Button>
      </div>

      {/* Bottom Navigation Bar */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        background: 'linear-gradient(180deg, rgba(26,31,46,0.95) 0%, rgba(16,21,32,0.98) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '10px 16px 20px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        {Object.entries(ROLE_CONFIGS).map(([key, cfg]) => {
          const isActive = selectedQuickRole === key
          return (
            <button
              key={key}
              onClick={() => quickSelectRole(key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                borderRadius: '14px',
                cursor: 'pointer',
                background: isActive
                  ? `linear-gradient(180deg, ${cfg.color}25 0%, ${cfg.color}08 100%)`
                  : 'transparent',
                border: isActive ? `2px solid ${cfg.color}80` : '2px solid transparent',
                boxShadow: isActive ? `0 0 16px ${cfg.color}30` : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{
                fontSize: '26px',
                filter: isActive ? 'none' : 'grayscale(0.5) brightness(0.6)',
                transition: 'filter 0.2s ease',
              }}>
                {cfg.icon}
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                color: isActive ? cfg.color : '#556',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                {key === 'attacker' ? 'Attack' : key === 'tank' ? 'Defend' : 'Support'}
              </span>
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: cfg.color,
                  boxShadow: `0 0 8px ${cfg.color}`,
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  )
}
