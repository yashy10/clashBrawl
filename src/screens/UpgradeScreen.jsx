import { useState } from 'react'
import { useGame, ROLE_CONFIGS, TIER_COSTS } from '../GameContext'
import { Button, Card, Badge } from '../components/ui'

const ROLE_AVATARS = {
  attacker: '🥷',
  tank: '🛡️',
  support: '🧝',
}

export default function UpgradeScreen() {
  const { state, dispatch } = useGame()
  const { player } = state
  const [selectedRole, setSelectedRole] = useState(player.selectedRole || 'attacker')
  const [upgradeFlash, setUpgradeFlash] = useState(false)

  const cfg = ROLE_CONFIGS[selectedRole]
  const currentTier = player.upgrades[selectedRole]
  const isMaxed = currentTier >= 2
  const nextCost = isMaxed ? 0 : TIER_COSTS[currentTier + 1]
  const canAfford = player.tokenBalance >= nextCost

  const handleUpgrade = () => {
    if (isMaxed || !canAfford) return
    dispatch({ type: 'UPGRADE_ROLE', role: selectedRole })
    setUpgradeFlash(true)
    setTimeout(() => setUpgradeFlash(false), 500)
  }

  const handleBack = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' })
  }

  const stats = player.lifetimeStats

  return (
    <div className="game-screen">
      {/* Flash overlay */}
      {upgradeFlash && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.25)',
          zIndex: 100,
          pointerEvents: 'none',
          animation: 'flashFade 0.5s ease-out forwards',
        }} />
      )}

      {/* Header */}
      <div style={{
        padding: '20px 16px 12px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          fontSize: '12px',
          color: '#f4a261',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          Role Upgrade
        </div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 900,
          color: cfg.color,
          textShadow: `0 0 30px ${cfg.color}40`,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          {cfg.name}
        </h1>
      </div>

      {/* Role Selector Tabs */}
      <div style={{
        display: 'flex',
        padding: '12px 16px',
        gap: '10px',
        position: 'relative',
        zIndex: 10,
      }}>
        {Object.entries(ROLE_CONFIGS).map(([key, c]) => (
          <button
            key={key}
            onClick={() => setSelectedRole(key)}
            style={{
              flex: 1,
              padding: '12px 8px',
              borderRadius: '10px',
              cursor: 'pointer',
              background: selectedRole === key ? `${c.color}18` : 'rgba(255,255,255,0.03)',
              border: selectedRole === key ? `2px solid ${c.color}` : '2px solid rgba(255,255,255,0.08)',
              color: selectedRole === key ? c.color : '#666',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>
              {c.icon}
            </span>
            {c.name}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        gap: '20px',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Ability Card */}
        <Card
          glowColor={`${cfg.color}30`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 24px',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${cfg.color}40`,
            width: '100%',
            maxWidth: '280px',
          }}
        >
          <div style={{
            fontSize: '40px',
            filter: `drop-shadow(0 0 12px ${cfg.color}50)`,
          }}>
            {cfg.icon}
          </div>
          <div>
            <div style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: '16px',
              letterSpacing: '0.02em',
            }}>
              {cfg.tiers[currentTier]}
            </div>
            <div style={{
              color: '#888',
              fontSize: '12px',
              fontWeight: 500,
            }}>
              Level {currentTier + 1} Ability
            </div>
          </div>
          <Badge 
            variant={isMaxed ? 'gold' : 'primary'}
            style={{ marginLeft: 'auto' }}
          >
            {isMaxed ? 'MAX' : `Tier ${currentTier + 1}`}
          </Badge>
        </Card>

        {/* Character Avatar */}
        <div style={{
          fontSize: '100px',
          filter: `drop-shadow(0 0 30px ${cfg.color}40)`,
          animation: 'float 3s ease-in-out infinite',
        }}>
          {ROLE_AVATARS[selectedRole]}
        </div>

        {/* Upgrade Path */}
        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
        }}>
          {[0, 1, 2].map(tier => (
            <div
              key={tier}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: tier <= currentTier ? `${cfg.color}25` : 'rgba(255,255,255,0.04)',
                border: tier <= currentTier ? `2px solid ${cfg.color}` : '2px solid rgba(255,255,255,0.1)',
                fontSize: tier <= currentTier ? '20px' : '14px',
                color: tier <= currentTier ? '#fff' : '#555',
                boxShadow: tier <= currentTier ? `0 0 16px ${cfg.color}30` : 'none',
                transition: 'all 0.3s ease',
              }}>
                {tier <= currentTier ? '✓' : '🔒'}
              </div>
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                color: tier <= currentTier ? cfg.color : '#555',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Tier {tier + 1}
              </div>
              <div style={{
                fontSize: '9px',
                color: '#666',
                textAlign: 'center',
                maxWidth: '60px',
              }}>
                {cfg.tiers[tier]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Panel */}
      <div style={{
        padding: '0 12px',
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
        position: 'relative',
        zIndex: 10,
      }}>
        {Object.entries(ROLE_CONFIGS).map(([key, c]) => {
          const s = stats[key]
          return (
            <Card
              key={key}
              style={{
                flex: 1,
                padding: '12px 8px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${c.color}25`,
                fontSize: '10px',
              }}
            >
              <div style={{
                textAlign: 'center',
                color: c.color,
                fontWeight: 800,
                fontSize: '11px',
                marginBottom: '8px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                {c.icon} {c.name}
              </div>
              <div style={{ color: '#888' }}>
                {key === 'attacker' && (
                  <>
                    <StatRow label="DMG" value={s.damage.toLocaleString()} />
                    <StatRow label="Crit" value={`${s.crit}%`} />
                  </>
                )}
                {key === 'tank' && (
                  <>
                    <StatRow label="Block" value={s.block.toLocaleString()} />
                    <StatRow label="Aggro" value={`${s.aggro}%`} />
                  </>
                )}
                {key === 'support' && (
                  <>
                    <StatRow label="Heal" value={s.heal.toLocaleString()} />
                    <StatRow label="Buffs" value={s.buff} />
                  </>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '6px',
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span>Score</span>
                  <span style={{ color: '#ffd700', fontWeight: 700 }}>
                    {s.score.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Token Balance & Cost */}
      <div style={{
        padding: '12px 16px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '12px',
          marginBottom: '12px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ color: '#888', fontSize: '12px' }}>Balance</span>
            <span style={{
              color: '#ffd700',
              fontWeight: 800,
              fontSize: '16px',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              🪙 {player.tokenBalance.toLocaleString()}
            </span>
          </div>
          {!isMaxed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ color: '#888', fontSize: '12px' }}>Cost</span>
              <span style={{
                color: canAfford ? '#4ade80' : '#e63946',
                fontWeight: 800,
                fontSize: '16px',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                🪙 {nextCost}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div style={{
        padding: '4px 16px 20px',
        display: 'flex',
        gap: '12px',
        position: 'relative',
        zIndex: 10,
      }}>
        <Button
          variant="ghost"
          onClick={handleBack}
          style={{ flex: 1 }}
        >
          Back
        </Button>
        <Button
          onClick={handleUpgrade}
          disabled={isMaxed || !canAfford}
          variant={isMaxed ? 'default' : canAfford ? 'secondary' : 'ghost'}
          style={{ flex: 2 }}
        >
          {isMaxed ? (
            <>
              <span style={{ marginRight: '8px' }}>👑</span>
              Max Level
            </>
          ) : canAfford ? (
            <>
              <span style={{ marginRight: '8px' }}>⚡</span>
              Upgrade
            </>
          ) : (
            <>
              <span style={{ marginRight: '8px' }}>🔒</span>
              Insufficient Tokens
            </>
          )}
        </Button>
      </div>

      {/* Tip */}
      <div style={{
        padding: '0 16px 16px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          padding: '10px 14px',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '10px',
          fontSize: '11px',
          color: '#93c5fd',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '14px' }}>💡</span>
          <span>Upgrade your primary role to unlock tier bonuses and new abilities.</span>
        </div>
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
      <span style={{ color: '#666' }}>{label}</span>
      <span style={{ color: '#ccc', fontWeight: 600 }}>{value}</span>
    </div>
  )
}
