import { useState, useEffect } from 'react'
import { useGame, ROLE_CONFIGS, getLevel, getBossConfig } from '../GameContext'
import { Button, Card, Badge, ProgressBar } from '../components/ui'

// Confetti Particle Component
function Confetti() {
  const confettiColors = ['#ffd700', '#8b5cf6', '#e63946', '#4ade80', '#f4a261', '#3b82f6']
  
  return (
    <>
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            background: confettiColors[i % confettiColors.length],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${2.5 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
            opacity: 0.9,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  )
}

// Light Beam Effect
function LightBeams() {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      height: '60%',
      background: `
        radial-gradient(ellipse 80% 100% at 50% 0%, rgba(255,215,0,0.15) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 30% 20%, rgba(139,92,246,0.1) 0%, transparent 50%),
        radial-gradient(ellipse 60% 80% at 70% 20%, rgba(59,130,246,0.1) 0%, transparent 50%)
      `,
      pointerEvents: 'none',
      animation: 'pulse 4s ease-in-out infinite',
    }} />
  )
}

export default function VictoryScreen() {
  const { state, dispatch } = useGame()
  const { matchResult, player } = state
  const bossConfig = getBossConfig(player.bossFloor)
  const isLastFloor = player.bossFloor >= 20
  const nextBoss = !isLastFloor ? getBossConfig(player.bossFloor + 1) : null
  const [showConfetti, setShowConfetti] = useState(true)
  const [xpAnimated, setXpAnimated] = useState(false)
  const [advancedFloor, setAdvancedFloor] = useState(false)

  const result = matchResult || {
    victory: true, completionTime: 272, totalScore: 6500,
    playerStats: [
      { role: 'attacker', name: 'Player 1', damage: 4500, crit: 15, score: 8500 },
      { role: 'tank', name: 'Player 2', heal: 1200, block: 2000, aggro: 75, score: 6800 },
      { role: 'support', name: 'Player 3', heal: 2300, buff: 12, score: 6000 },
    ],
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const timeBonus = result.completionTime < 120 ? 200 : Math.max(0, 200 - Math.floor((result.completionTime - 120) / 60) * 50)
    const xpGain = bossConfig.xpReward + timeBonus
    const rankGain = bossConfig.rankReward + (result.completionTime < 120 ? 10 : 0)

    dispatch({ type: 'ADD_XP', amount: xpGain })
    dispatch({ type: 'ADD_RANK_POINTS', amount: rankGain })

    setTimeout(() => setXpAnimated(true), 500)
  }, [])

  const level = getLevel(player.xp)
  const xpInLevel = player.xp % 1000
  const xpNeeded = 1000

  const handleChestTap = () => {
    if (!advancedFloor) {
      dispatch({ type: 'ADVANCE_FLOOR' })
      setAdvancedFloor(true)
    }
    const totalScore = result.playerStats.reduce((sum, p) => sum + p.score, 0) / result.playerStats.length
    dispatch({ type: 'OPEN_CHEST', score: totalScore })
  }

  const handlePlayAgain = () => {
    if (!advancedFloor) {
      dispatch({ type: 'ADVANCE_FLOOR' })
    }
    dispatch({ type: 'SET_SCREEN', screen: 'roleselect' })
  }

  return (
    <div className="game-screen" style={{
      background: `
        radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 100%, rgba(74,222,128,0.05) 0%, transparent 40%),
        linear-gradient(180deg, #0f0a05 0%, #1a1208 30%, #0a0a14 100%)
      `,
    }}>
      <LightBeams />
      {showConfetti && <Confetti />}

      {/* Victory Banner */}
      <div style={{
        textAlign: 'center',
        padding: '28px 20px 12px',
        position: 'relative',
        zIndex: 10,
      }}>
        <Badge variant="warning" style={{ marginBottom: '12px' }}>
          Floor {player.bossFloor} Cleared
        </Badge>
        
        <h1 style={{
          fontSize: isLastFloor ? '28px' : '36px',
          fontWeight: 900,
          color: '#ffd700',
          textShadow: '0 0 40px rgba(255,215,0,0.5), 0 4px 8px rgba(0,0,0,0.5)',
          letterSpacing: '0.08em',
          margin: '8px 0',
          animation: 'fadeInUp 0.6s ease',
        }}>
          {isLastFloor ? 'Aincrad Conquered!' : 'Victory!'}
        </h1>
        
        <p style={{
          fontSize: '14px',
          color: '#aaa',
          margin: '4px 0 0',
        }}>
          <span style={{ fontSize: '18px', marginRight: '6px' }}>{bossConfig.emoji}</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{bossConfig.name}</span>
          <span style={{ color: '#666', marginLeft: '6px' }}>defeated</span>
        </p>
      </div>

      {/* Completion Time */}
      <div style={{
        textAlign: 'center',
        padding: '8px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 20px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
        }}>
          <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Clear Time
          </span>
          <span style={{ 
            fontSize: '18px', 
            fontWeight: 800, 
            color: '#fff',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {formatTime(result.completionTime)}
          </span>
        </div>
      </div>

      {/* Next Floor Preview */}
      {nextBoss && (
        <div style={{
          margin: '12px 20px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${nextBoss.colors.horn}40`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          position: 'relative',
          zIndex: 10,
          animation: 'fadeInUp 0.5s ease 0.2s both',
        }}>
          <span style={{
            fontSize: '10px',
            color: '#888',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Next:
          </span>
          <span style={{ fontSize: '20px' }}>{nextBoss.emoji}</span>
          <div>
            <div style={{
              fontSize: '13px',
              color: '#fff',
              fontWeight: 700,
            }}>
              Floor {player.bossFloor + 1} — {nextBoss.name}
            </div>
            <div style={{
              fontSize: '10px',
              color: nextBoss.colors.accent,
            }}>
              {nextBoss.title}
            </div>
          </div>
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: '3px',
          }}>
            {Array.from({ length: nextBoss.hpBars }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '10px',
                  height: '5px',
                  borderRadius: '2px',
                  background: nextBoss.colors.horn,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reward Chest */}
      <div 
        onClick={handleChestTap}
        style={{
          textAlign: 'center',
          padding: '16px',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 10,
          animation: 'fadeInUp 0.5s ease 0.3s both',
        }}
      >
        <div style={{
          fontSize: '72px',
          lineHeight: 1,
          filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.5))',
          animation: 'chestBounce 2s ease-in-out infinite',
          transition: 'transform 0.2s ease',
        }}>
          🎁
        </div>
        <div style={{
          fontSize: '13px',
          color: '#ffd700',
          fontWeight: 700,
          marginTop: '8px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          Tap to Open
        </div>
      </div>

      {/* Player Stats */}
      <div style={{
        flex: 1,
        padding: '0 12px',
        display: 'flex',
        gap: '8px',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeInUp 0.5s ease 0.4s both',
      }}>
        {result.playerStats.map((ps, i) => {
          const cfg = ROLE_CONFIGS[ps.role]
          return (
            <Card
              key={i}
              style={{
                flex: 1,
                padding: '14px 8px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${cfg.color}40`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div style={{
                fontSize: '32px',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
              }}>
                {ps.role === 'attacker' ? '🥷' : ps.role === 'tank' ? '🛡️' : '🧝'}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#888',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Player {i + 1}
              </div>
              <div style={{
                fontSize: '11px',
                color: cfg.color,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {cfg.name}
              </div>

              <div style={{
                width: '100%',
                marginTop: '6px',
                fontSize: '10px',
                color: '#aaa',
              }}>
                {ps.role === 'attacker' && (
                  <>
                    <StatRow label="Damage" value={ps.damage?.toLocaleString()} />
                    <StatRow label="Crit" value={`${ps.crit}%`} />
                  </>
                )}
                {ps.role === 'tank' && (
                  <>
                    <StatRow label="Block" value={ps.block?.toLocaleString()} />
                    <StatRow label="Aggro" value={`${ps.aggro}%`} />
                  </>
                )}
                {ps.role === 'support' && (
                  <>
                    <StatRow label="Heal" value={ps.heal?.toLocaleString()} />
                    <StatRow label="Buffs" value={ps.buff} />
                  </>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '6px',
                  marginTop: '6px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <span style={{ color: '#888' }}>Score</span>
                  <span style={{ color: '#ffd700', fontWeight: 800 }}>
                    {ps.score?.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* XP Progress */}
      <div style={{
        padding: '16px 20px',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeInUp 0.5s ease 0.5s both',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#888',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <span>XP Progress</span>
          <span>Level {level}</span>
        </div>
        <ProgressBar
          value={xpInLevel}
          max={xpNeeded}
          variant="xp"
          animated={xpAnimated}
        />
        <div style={{
          fontSize: '10px',
          color: '#666',
          marginTop: '6px',
          textAlign: 'right',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {xpInLevel} / {xpNeeded} XP
        </div>
      </div>

      {/* Play Again Button */}
      <div style={{
        padding: '10px 20px 24px',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeInUp 0.5s ease 0.6s both',
      }}>
        <Button
          variant="primary"
          size="lg"
          onClick={handlePlayAgain}
          style={{ width: '100%' }}
        >
          {isLastFloor ? 'Continue Journey' : 'Next Floor'}
        </Button>
      </div>
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '3px 0',
    }}>
      <span>{label}</span>
      <span style={{ color: '#fff', fontWeight: 600 }}>{value}</span>
    </div>
  )
}
