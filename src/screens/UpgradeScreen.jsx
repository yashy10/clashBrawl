import { useState } from 'react'
import { useGame, ROLE_CONFIGS, TIER_COSTS } from '../GameContext'

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
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #1a0a2e 0%, #0d1117 50%, #0a0a1a 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Flash overlay */}
      {upgradeFlash && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.3)',
          zIndex: 100, pointerEvents: 'none',
          animation: 'flashFade 0.5s ease-out forwards',
        }} />
      )}

      {/* Header */}
      <div style={{
        textAlign: 'center', padding: '20px 16px 8px',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '12px', color: '#f4a261', fontWeight: 600, letterSpacing: '2px' }}>UPGRADE ROLE</div>
        <div style={{
          fontSize: '32px', fontWeight: 900, color: cfg.color,
          textShadow: `0 0 30px ${cfg.color}44`,
          letterSpacing: '3px',
        }}>{cfg.name.toUpperCase()}</div>
      </div>

      {/* Role selector tabs */}
      <div style={{ display: 'flex', padding: '8px 16px', gap: '8px' }}>
        {Object.entries(ROLE_CONFIGS).map(([key, c]) => (
          <button key={key} onClick={() => setSelectedRole(key)} style={{
            flex: 1, padding: '8px', borderRadius: '8px', cursor: 'pointer',
            background: selectedRole === key ? `${c.color}22` : 'rgba(255,255,255,0.03)',
            border: selectedRole === key ? `2px solid ${c.color}` : '2px solid rgba(255,255,255,0.08)',
            color: selectedRole === key ? c.color : '#666', fontSize: '11px', fontWeight: 700,
            textTransform: 'uppercase',
          }}>{c.name}</button>
        ))}
      </div>

      {/* Ability + Character */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: '12px' }}>
        {/* Ability icon */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '12px',
          border: `1px solid ${cfg.color}44`,
        }}>
          <div style={{ fontSize: '32px' }}>{cfg.icon}</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{cfg.tiers[currentTier]}</div>
            <div style={{ color: '#888', fontSize: '11px' }}>Lv {currentTier + 1}</div>
          </div>
        </div>

        {/* Character */}
        <div style={{
          fontSize: '80px',
          filter: `drop-shadow(0 0 20px ${cfg.color}44)`,
        }}>
          {selectedRole === 'attacker' ? '🥷' : selectedRole === 'tank' ? '🛡️' : '🧝'}
        </div>

        {/* Upgrade Path */}
        <div style={{
          display: 'flex', gap: '12px', alignItems: 'center',
        }}>
          {[0, 1, 2].map(tier => (
            <div key={tier} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: tier <= currentTier ? `${cfg.color}33` : 'rgba(255,255,255,0.05)',
                border: tier <= currentTier ? `2px solid ${cfg.color}` : '2px solid rgba(255,255,255,0.1)',
                fontSize: tier <= currentTier ? '16px' : '12px',
                color: tier <= currentTier ? '#fff' : '#555',
              }}>
                {tier <= currentTier ? '✓' : '🔒'}
              </div>
              <div style={{
                fontSize: '10px', fontWeight: 600,
                color: tier <= currentTier ? cfg.color : '#555',
              }}>Tier {tier + 1}</div>
              <div style={{ fontSize: '9px', color: '#666' }}>{cfg.tiers[tier]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Stats */}
      <div style={{ padding: '0 12px', display: 'flex', gap: '6px', marginBottom: '8px' }}>
        {Object.entries(ROLE_CONFIGS).map(([key, c]) => {
          const s = stats[key]
          return (
            <div key={key} style={{
              flex: 1, padding: '8px 6px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${c.color}22`,
              fontSize: '9px', color: '#888',
            }}>
              <div style={{ textAlign: 'center', color: c.color, fontWeight: 700, fontSize: '10px', marginBottom: '4px' }}>
                {c.name}
              </div>
              {key === 'attacker' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>DMG:</span><span style={{ color: '#ccc' }}>{s.damage.toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CRIT:</span><span style={{ color: '#ccc' }}>{s.crit}%</span></div>
                </>
              )}
              {key === 'tank' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>BLOCK:</span><span style={{ color: '#ccc' }}>{s.block.toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>AGGRO:</span><span style={{ color: '#ccc' }}>{s.aggro}%</span></div>
                </>
              )}
              {key === 'support' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>HEAL:</span><span style={{ color: '#ccc' }}>{s.heal.toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>BUFF:</span><span style={{ color: '#ccc' }}>{s.buff}</span></div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2px' }}>
                <span>SCORE:</span><span style={{ color: '#ffd700' }}>{s.score.toLocaleString()}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Token Balance + Upgrade Button */}
      <div style={{ padding: '8px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#888' }}>TOKEN BALANCE:</span>
            <span style={{ color: '#ffd700', fontWeight: 700 }}>{player.tokenBalance.toLocaleString()}</span>
          </div>
          {!isMaxed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#888' }}>UPGRADE COST:</span>
              <span style={{ color: canAfford ? '#4ade80' : '#e63946', fontWeight: 700 }}>{nextCost}</span>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ padding: '4px 16px 24px', display: 'flex', gap: '10px' }}>
        <button onClick={handleBack} style={{
          flex: 1, padding: '14px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.15)',
          fontSize: '15px', fontWeight: 700, color: '#888', cursor: 'pointer',
        }}>BACK</button>
        <button onClick={handleUpgrade} disabled={isMaxed || !canAfford} style={{
          flex: 2, padding: '14px', borderRadius: '12px',
          background: isMaxed ? 'rgba(255,215,0,0.2)' : canAfford ? `linear-gradient(180deg, ${cfg.color}, ${cfg.color}cc)` : 'rgba(255,255,255,0.05)',
          border: isMaxed ? '2px solid #ffd700' : canAfford ? `2px solid ${cfg.color}` : '2px solid rgba(255,255,255,0.1)',
          fontSize: '15px', fontWeight: 700,
          color: isMaxed ? '#ffd700' : canAfford ? '#fff' : '#555',
          cursor: isMaxed || !canAfford ? 'default' : 'pointer',
          boxShadow: canAfford && !isMaxed ? `0 0 20px ${cfg.color}33` : 'none',
        }}>
          {isMaxed ? 'MAX LEVEL' : 'UPGRADE'}
        </button>
      </div>

      {/* Tip */}
      <div style={{
        padding: '0 16px 16px',
      }}>
        <div style={{
          padding: '8px 12px', background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px',
          fontSize: '10px', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span>💡</span>
          <span>TIP: Upgrade your primary ability to unlock tier bonuses.</span>
        </div>
      </div>

      <style>{`
        @keyframes flashFade { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
    </div>
  )
}
