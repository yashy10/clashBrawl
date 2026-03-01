import { useEffect } from 'react'
import { useGame, ROLE_CONFIGS, getBossConfig } from '../GameContext'
import { Button, Card, Badge } from '../components/ui'

const TIPS = [
  { condition: 'lowDamage', tip: 'Try using Tank to absorb the Charge attack' },
  { condition: 'lowAggro', tip: 'The Tank should stay close to the boss to maintain aggro' },
  { condition: 'lowHealing', tip: 'Support should prioritize healing when teammates are below 50% HP' },
  { condition: 'timeout', tip: 'Focus damage during Weak Point phases for 3x damage multiplier' },
  { condition: 'default', tip: 'Coordinate your ultimates during Rage Mode for maximum impact' },
]

export default function DefeatScreen() {
  const { state, dispatch } = useGame()
  const { matchResult, player } = state
  const bossConfig = getBossConfig(player.bossFloor)

  const result = matchResult || {
    victory: false, bossRemainingPercent: 15, wasTimeout: false,
    playerStats: [
      { role: 'attacker', name: 'Player 1', damage: 2700, crit: 8, score: 4300, failure: 'AGGRESSION LOW' },
      { role: 'tank', name: 'Player 2', heal: 900, block: 1500, aggro: 40, score: 3400, failure: 'COVERAGE BREAKDOWN' },
      { role: 'support', name: 'Player 3', heal: 1100, buff: 6, score: 3400, failure: null },
    ],
  }

  useEffect(() => {
    const defeatXP = Math.floor(50 + player.bossFloor * 5)
    dispatch({ type: 'ADD_XP', amount: defeatXP })
    dispatch({ type: 'ADD_RANK_POINTS', amount: -15 })
  }, [])

  const tip = result.wasTimeout ? TIPS[3].tip : TIPS[4].tip

  const handleRetry = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'matchmaking' })
    dispatch({ type: 'START_MATCHMAKING' })
  }

  const handleBack = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' })
  }

  return (
    <div className="game-screen" style={{
      background: `
        radial-gradient(ellipse at 50% 0%, rgba(230,57,70,0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 100%, rgba(139,92,246,0.03) 0%, transparent 40%),
        linear-gradient(180deg, #140505 0%, #1a0808 30%, #0a0a14 100%)
      `,
    }}>
      {/* Red vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(230,57,70,0.12) 100%)',
      }} />

      {/* Defeat Banner */}
      <div style={{
        textAlign: 'center',
        padding: '28px 20px 8px',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeInUp 0.5s ease',
      }}>
        <Badge variant="danger" style={{ marginBottom: '12px' }}>
          Floor {player.bossFloor}
        </Badge>
        
        <h1 style={{
          fontSize: '44px',
          fontWeight: 900,
          color: '#e63946',
          textShadow: '0 0 30px rgba(230,57,70,0.4), 0 4px 8px rgba(0,0,0,0.5)',
          letterSpacing: '0.1em',
          margin: '8px 0',
        }}>
          Defeated
        </h1>
        
        <p style={{
          fontSize: '14px',
          color: '#888',
          margin: '8px 0 0',
        }}>
          by <span style={{ fontSize: '18px', marginRight: '6px' }}>{bossConfig.emoji}</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>{bossConfig.name}</span>
        </p>
        <p style={{
          fontSize: '11px',
          color: bossConfig.colors.accent,
          margin: '4px 0 0',
          letterSpacing: '0.05em',
        }}>
          {bossConfig.title}
        </p>
      </div>

      {/* Boss Remaining HP */}
      <div style={{
        textAlign: 'center',
        padding: '12px 20px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 24px',
          background: 'rgba(230,57,70,0.12)',
          border: '1px solid rgba(230,57,70,0.25)',
          borderRadius: '14px',
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 800,
            color: '#e63946',
            letterSpacing: '0.03em',
          }}>
            Boss Remaining: {result.bossRemainingPercent}%
          </span>
          <span style={{ fontSize: '18px' }}>💔</span>
        </div>
      </div>

      {/* Broken Chest */}
      <div style={{
        textAlign: 'center',
        padding: '8px',
        position: 'relative',
        zIndex: 10,
        opacity: 0.6,
      }}>
        <div style={{
          fontSize: '56px',
          filter: 'grayscale(1) brightness(0.5)',
        }}>
          📦
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
        animation: 'fadeInUp 0.5s ease 0.1s both',
      }}>
        {result.playerStats.map((ps, i) => {
          const cfg = ROLE_CONFIGS[ps.role]
          return (
            <Card
              key={i}
              style={{
                flex: 1,
                padding: '12px 6px',
                background: 'rgba(230,57,70,0.05)',
                border: `1px solid rgba(230,57,70,0.2)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div style={{
                fontSize: '28px',
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
                marginTop: '4px',
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
                  paddingTop: '4px',
                  marginTop: '4px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{ color: '#888' }}>Score</span>
                  <span style={{ color: '#ffd700', fontWeight: 700 }}>
                    {ps.score?.toLocaleString()}
                  </span>
                </div>
              </div>

              {ps.failure && (
                <div style={{
                  fontSize: '8px',
                  color: '#e63946',
                  fontWeight: 700,
                  background: 'rgba(230,57,70,0.12)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  marginTop: '4px',
                  textAlign: 'center',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}>
                  {ps.failure}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Tip */}
      <div style={{
        margin: '12px 16px',
        padding: '14px 16px',
        background: 'rgba(59,130,246,0.08)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeInUp 0.5s ease 0.2s both',
      }}>
        <span style={{ fontSize: '20px' }}>💡</span>
        <div>
          <div style={{
            fontSize: '10px',
            color: '#3b82f6',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '4px',
          }}>
            Pro Tip
          </div>
          <span style={{
            fontSize: '12px',
            color: '#93c5fd',
            lineHeight: 1.5,
          }}>
            {tip}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{
        padding: '12px 16px 24px',
        display: 'flex',
        gap: '12px',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeInUp 0.5s ease 0.3s both',
      }}>
        <Button
          variant="ghost"
          onClick={handleBack}
          style={{ flex: 1 }}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleRetry}
          style={{ flex: 2 }}
        >
          Retry Floor {player.bossFloor}
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
      padding: '2px 0',
    }}>
      <span>{label}</span>
      <span style={{ color: '#fff' }}>{value}</span>
    </div>
  )
}
