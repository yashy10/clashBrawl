import { useState, useEffect, useRef } from 'react'
import { useGame, ROLE_CONFIGS, getBossConfig } from '../GameContext'
import { Button, Card, Badge, Spinner } from '../components/ui'

export default function MatchmakingScreen() {
  const { state, dispatch } = useGame()
  const { player } = state
  const bossConfig = getBossConfig(player.bossFloor)
  const [slots, setSlots] = useState([
    { role: player.selectedRole, isBot: false, ready: true, name: player.name },
    null,
    null,
  ])
  const [countdown, setCountdown] = useState(null)
  const [searchTime, setSearchTime] = useState(0)
  const [status, setStatus] = useState('searching')
  const timerRef = useRef(null)

  // Smart fill: pick roles not already taken
  const getSmartRole = (takenRoles) => {
    const allRoles = ['attacker', 'tank', 'support']
    const available = allRoles.filter(r => !takenRoles.includes(r))
    return available[Math.floor(Math.random() * available.length)] || allRoles[Math.floor(Math.random() * 3)]
  }

  useEffect(() => {
    const searchInterval = setInterval(() => {
      setSearchTime(t => t + 1)
    }, 1000)

    const t1 = setTimeout(() => {
      setSlots(prev => {
        const taken = prev.filter(s => s).map(s => s.role)
        const role = getSmartRole(taken)
        const newSlots = [...prev]
        newSlots[1] = { role, isBot: true, ready: true, name: 'Player 2' }
        return newSlots
      })
    }, 2000)

    const t2 = setTimeout(() => {
      setSlots(prev => {
        const taken = prev.filter(s => s).map(s => s.role)
        const role = getSmartRole(taken)
        const newSlots = [...prev]
        newSlots[2] = { role, isBot: true, ready: true, name: 'Player 3' }
        return newSlots
      })
      setStatus('ready')
    }, 3500)

    const t3 = setTimeout(() => {
      setCountdown(5)
    }, 4000)

    return () => {
      clearInterval(searchInterval)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) {
      const finalSlots = slots.filter(s => s)
      const totalHP = bossConfig.hpBars * bossConfig.hpPerBar
      dispatch({
        type: 'START_MATCH',
        match: {
          players: finalSlots.map((s, i) => ({
            id: i, name: s.name || `Player ${i + 1}`, role: s.role, isBot: s.isBot,
          })),
          bossHP: totalHP, bossMaxHP: totalHP,
          timeRemaining: bossConfig.timeLimit,
          bossFloor: player.bossFloor,
        },
      })
      return
    }
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [countdown])

  const handleCancel = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'roleselect' })
  }

  const roleConfig = ROLE_CONFIGS[player.selectedRole] || ROLE_CONFIGS.attacker

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
        <div>
          <div style={{
            fontSize: '10px',
            color: '#f4a261',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Floor {player.bossFloor} / 20
          </div>
          <div style={{
            fontSize: '15px',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>{bossConfig.emoji}</span>
            {bossConfig.name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '10px',
            color: '#888',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            {bossConfig.title}
          </div>
          <div style={{
            display: 'flex',
            gap: '3px',
            justifyContent: 'flex-end',
            marginTop: '6px',
          }}>
            {Array.from({ length: bossConfig.hpBars }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '14px',
                  height: '6px',
                  borderRadius: '3px',
                  background: bossConfig.colors.horn,
                  opacity: 0.8,
                  boxShadow: `0 0 6px ${bossConfig.colors.horn}50`,
                }}
              />
            ))}
          </div>
        </div>
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
          }}>
            {player.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#888',
          }}>
            Ready to fight
          </div>
        </div>
        <Badge variant="success" style={{ marginLeft: 'auto' }}>
          You
        </Badge>
      </div>

      {/* Status Title */}
      <div style={{
        textAlign: 'center',
        padding: '24px 16px 16px',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 800,
          color: status === 'searching' ? '#f4a261' : '#4ade80',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          margin: 0,
          textShadow: status === 'ready' ? '0 0 20px rgba(74,222,128,0.4)' : 'none',
          transition: 'all 0.3s ease',
        }}>
          {status === 'searching' ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Spinner size="sm" />
              Finding Teammates
            </span>
          ) : (
            'All Players Found!'
          )}
        </h2>
        {status === 'searching' && (
          <p style={{
            fontSize: '12px',
            color: '#666',
            margin: '8px 0 0',
          }}>
            Searching for {searchTime}s...
          </p>
        )}
      </div>

      {/* Player Slots */}
      <div style={{
        flex: 1,
        padding: '0 16px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
      }}>
        {slots.map((slot, i) => {
          const cfg = slot ? ROLE_CONFIGS[slot.role] : null
          const isYou = i === 0
          
          return (
            <div
              key={i}
              style={{
                flex: 1,
                borderRadius: '16px',
                padding: '20px 12px',
                background: slot
                  ? (isYou 
                    ? `linear-gradient(180deg, ${roleConfig.color}18 0%, rgba(0,0,0,0.2) 100%)` 
                    : 'rgba(255,255,255,0.04)')
                  : 'rgba(255,255,255,0.02)',
                border: slot
                  ? (isYou ? `2px solid ${roleConfig.color}` : `2px solid ${cfg.color}50`)
                  : '2px dashed rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                boxShadow: isYou ? `0 0 20px ${roleConfig.color}20` : 'none',
                transition: 'all 0.5s ease',
                minHeight: '180px',
                justifyContent: 'center',
                animation: slot ? 'fadeInUp 0.4s ease' : 'none',
              }}
            >
              {slot ? (
                <>
                  <div style={{
                    fontSize: '44px',
                    filter: isYou ? 'none' : 'grayscale(0.2)',
                    transition: 'all 0.3s ease',
                  }}>
                    {slot.role === 'attacker' ? '🥷' : slot.role === 'tank' ? '🛡️' : '🧝'}
                  </div>
                  
                  {isYou && (
                    <Badge variant="success" size="sm">
                      You
                    </Badge>
                  )}
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#fff',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                  }}>
                    {isYou ? 'PLAYER 1' : `PLAYER ${i + 1}`}
                  </div>
                  
                  <div style={{
                    fontSize: '10px',
                    color: cfg.color,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    {cfg.name}
                  </div>
                  
                  <div style={{
                    fontSize: '18px',
                    color: '#4ade80',
                    fontWeight: 700,
                  }}>
                    ✓
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Spinner size="sm" color="#f4a261" />
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#888',
                    fontWeight: 600,
                  }}>
                    Waiting...
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#555',
                  }}>
                    Player {i + 1}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Countdown / Timer */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
      }}>
        {countdown !== null ? (
          <div style={{
            animation: 'scaleIn 0.3s ease',
          }}>
            <div style={{
              fontSize: '13px',
              color: '#888',
              marginBottom: '8px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Match Starts In
            </div>
            <div style={{
              fontSize: '56px',
              fontWeight: 900,
              color: countdown <= 3 ? '#e63946' : '#4ade80',
              textShadow: countdown <= 3 
                ? '0 0 30px rgba(230,57,70,0.6)' 
                : '0 0 30px rgba(74,222,128,0.4)',
              fontFamily: 'JetBrains Mono, monospace',
              animation: countdown <= 3 ? 'pulse 0.5s ease-in-out infinite' : 'none',
              lineHeight: 1,
            }}>
              {countdown}s
            </div>
          </div>
        ) : (
          <div style={{
            padding: '12px 24px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '12px',
            display: 'inline-block',
          }}>
            <span style={{
              fontSize: '13px',
              color: '#888',
              letterSpacing: '0.05em',
            }}>
              Est. wait: ~5 seconds
            </span>
          </div>
        )}
      </div>

      {/* Cancel Button */}
      <div style={{
        padding: '12px 20px 24px',
      }}>
        <Button
          variant="danger"
          onClick={handleCancel}
          style={{ width: '100%' }}
        >
          Cancel Matchmaking
        </Button>
      </div>
    </div>
  )
}
