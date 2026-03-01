import { useRef, useEffect, useState, useCallback } from 'react'
import { useGame, ROLE_CONFIGS, getBossConfig } from '../GameContext'

// ======================== GAME CONSTANTS ========================

const ARENA_W = 1000
const ARENA_H = 560
const BOSS_SIZE = 50
const PLAYER_SIZE = 20
const AUTO_ATTACK_RANGE = 130
const AUTO_ATTACK_INTERVAL = 1000
const WEAK_POINT_DURATION = 5000

const BOSS_ATTACKS = {
  slam: { damage: 40, telegraphDuration: 1500, coneAngle: 60, range: 180, cooldown: 5000 },
  charge: { damage: 60, telegraphDuration: 2000, range: 250, width: 60, cooldown: 8000 },
  aoe: { damage: 35, telegraphDuration: 1000, radius: 100, cooldown: 7000 },
}

// ======================== CARTOON DRAWING FUNCTIONS ========================

function drawAttacker(ctx, x, y, size, flip, flash, t) {
  const s = size
  ctx.save()
  ctx.translate(x, y)
  const bob = Math.sin(t / 200) * 2

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath()
  ctx.ellipse(0, s * 1.1, s * 0.7, s * 0.15, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.translate(0, bob)
  const f = flip ? -1 : 1

  // Legs
  const legAngle = Math.sin(t / 150) * 0.2
  ctx.fillStyle = flash ? '#fff' : '#2a1a1a'
  ctx.beginPath()
  ctx.ellipse(-s * 0.2, s * 0.7, s * 0.15, s * 0.3, legAngle, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(s * 0.2, s * 0.7, s * 0.15, s * 0.3, -legAngle, 0, Math.PI * 2)
  ctx.fill()

  // Body
  ctx.fillStyle = flash ? '#fff' : '#1a1a2e'
  ctx.beginPath()
  ctx.ellipse(0, 0, s * 0.5, s * 0.6, 0, 0, Math.PI * 2)
  ctx.fill()

  // Belt / sash
  ctx.fillStyle = flash ? '#fff' : '#e63946'
  ctx.fillRect(-s * 0.45, -s * 0.05, s * 0.9, s * 0.12)

  // Arm + sword
  ctx.save()
  ctx.translate(f * s * 0.45, -s * 0.15)
  ctx.rotate(Math.sin(t / 300) * 0.15 * f)
  // Arm
  ctx.fillStyle = flash ? '#fff' : '#d4a373'
  ctx.beginPath()
  ctx.ellipse(0, 0, s * 0.12, s * 0.25, 0.3 * f, 0, Math.PI * 2)
  ctx.fill()
  // Sword blade
  ctx.fillStyle = flash ? '#fff' : '#c0c0c0'
  ctx.beginPath()
  ctx.moveTo(f * s * 0.05, -s * 0.2)
  ctx.lineTo(f * s * 0.12, -s * 0.8)
  ctx.lineTo(f * s * -0.02, -s * 0.75)
  ctx.closePath()
  ctx.fill()
  // Sword guard
  ctx.fillStyle = flash ? '#fff' : '#f4a261'
  ctx.fillRect(f * s * -0.1, -s * 0.25, s * 0.22, s * 0.06)
  // Sword glow
  if (!flash) {
    ctx.strokeStyle = 'rgba(230,57,70,0.4)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(f * s * 0.05, -s * 0.2)
    ctx.lineTo(f * s * 0.12, -s * 0.8)
    ctx.stroke()
  }
  ctx.restore()

  // Head
  ctx.fillStyle = flash ? '#fff' : '#d4a373'
  ctx.beginPath()
  ctx.arc(0, -s * 0.55, s * 0.3, 0, Math.PI * 2)
  ctx.fill()

  // Hood / mask
  ctx.fillStyle = flash ? '#fff' : '#1a1a2e'
  ctx.beginPath()
  ctx.arc(0, -s * 0.55, s * 0.3, Math.PI * 0.9, Math.PI * 2.1)
  ctx.lineTo(0, -s * 0.85)
  ctx.closePath()
  ctx.fill()

  // Eyes
  if (!flash) {
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.ellipse(-s * 0.1, -s * 0.55, s * 0.07, s * 0.05, 0, 0, Math.PI * 2)
    ctx.ellipse(s * 0.1, -s * 0.55, s * 0.07, s * 0.05, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.arc(-s * 0.08, -s * 0.54, s * 0.03, 0, Math.PI * 2)
    ctx.arc(s * 0.12, -s * 0.54, s * 0.03, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawTank(ctx, x, y, size, flip, flash, t) {
  const s = size
  ctx.save()
  ctx.translate(x, y)
  const bob = Math.sin(t / 250) * 1.5

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath()
  ctx.ellipse(0, s * 1.2, s * 0.8, s * 0.18, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.translate(0, bob)
  const f = flip ? -1 : 1

  // Legs (thick)
  ctx.fillStyle = flash ? '#fff' : '#374151'
  ctx.beginPath()
  ctx.ellipse(-s * 0.25, s * 0.75, s * 0.2, s * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(s * 0.25, s * 0.75, s * 0.2, s * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body (bulky)
  ctx.fillStyle = flash ? '#fff' : '#2563eb'
  ctx.beginPath()
  ctx.ellipse(0, 0, s * 0.6, s * 0.7, 0, 0, Math.PI * 2)
  ctx.fill()
  // Armor plate
  ctx.fillStyle = flash ? '#fff' : '#1e40af'
  ctx.beginPath()
  ctx.ellipse(0, -s * 0.1, s * 0.4, s * 0.45, 0, 0, Math.PI * 2)
  ctx.fill()
  // Armor highlight
  if (!flash) {
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.beginPath()
    ctx.ellipse(-s * 0.1, -s * 0.25, s * 0.15, s * 0.2, -0.3, 0, Math.PI * 2)
    ctx.fill()
  }

  // Shield arm
  ctx.save()
  ctx.translate(f * s * 0.55, -s * 0.05)
  ctx.rotate(Math.sin(t / 400) * 0.08 * f)
  // Shield
  ctx.fillStyle = flash ? '#fff' : '#3b82f6'
  ctx.beginPath()
  ctx.moveTo(0, -s * 0.5)
  ctx.lineTo(f * s * 0.35, -s * 0.3)
  ctx.lineTo(f * s * 0.35, s * 0.2)
  ctx.lineTo(0, s * 0.4)
  ctx.lineTo(f * -s * 0.05, s * 0.2)
  ctx.lineTo(f * -s * 0.05, -s * 0.3)
  ctx.closePath()
  ctx.fill()
  // Shield cross
  if (!flash) {
    ctx.strokeStyle = '#60a5fa'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(f * s * 0.15, -s * 0.35)
    ctx.lineTo(f * s * 0.15, s * 0.25)
    ctx.moveTo(f * s * 0.0, -s * 0.05)
    ctx.lineTo(f * s * 0.3, -s * 0.05)
    ctx.stroke()
  }
  ctx.restore()

  // Head
  ctx.fillStyle = flash ? '#fff' : '#d4a373'
  ctx.beginPath()
  ctx.arc(0, -s * 0.65, s * 0.28, 0, Math.PI * 2)
  ctx.fill()
  // Helmet
  ctx.fillStyle = flash ? '#fff' : '#6b7280'
  ctx.beginPath()
  ctx.arc(0, -s * 0.7, s * 0.3, Math.PI, Math.PI * 2)
  ctx.fill()
  // Helmet visor
  ctx.fillStyle = flash ? '#fff' : '#374151'
  ctx.fillRect(-s * 0.2, -s * 0.68, s * 0.4, s * 0.1)

  // Eyes
  if (!flash) {
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.ellipse(-s * 0.08, -s * 0.62, s * 0.06, s * 0.04, 0, 0, Math.PI * 2)
    ctx.ellipse(s * 0.08, -s * 0.62, s * 0.06, s * 0.04, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1e3a5f'
    ctx.beginPath()
    ctx.arc(-s * 0.07, -s * 0.61, s * 0.025, 0, Math.PI * 2)
    ctx.arc(s * 0.09, -s * 0.61, s * 0.025, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawSupport(ctx, x, y, size, flip, flash, t) {
  const s = size
  ctx.save()
  ctx.translate(x, y)
  const bob = Math.sin(t / 220) * 2.5

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(0, s * 1.1, s * 0.6, s * 0.12, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.translate(0, bob)
  const f = flip ? -1 : 1

  // Robe / legs
  ctx.fillStyle = flash ? '#fff' : '#065f46'
  ctx.beginPath()
  ctx.moveTo(-s * 0.4, s * 0.1)
  ctx.lineTo(-s * 0.5, s * 1.0)
  ctx.lineTo(s * 0.5, s * 1.0)
  ctx.lineTo(s * 0.4, s * 0.1)
  ctx.closePath()
  ctx.fill()

  // Body
  ctx.fillStyle = flash ? '#fff' : '#10b981'
  ctx.beginPath()
  ctx.ellipse(0, -s * 0.05, s * 0.4, s * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Cross emblem on chest
  if (!flash) {
    ctx.fillStyle = '#34d399'
    ctx.fillRect(-s * 0.04, -s * 0.3, s * 0.08, s * 0.3)
    ctx.fillRect(-s * 0.15, -s * 0.2, s * 0.3, s * 0.08)
  }

  // Staff arm
  ctx.save()
  ctx.translate(f * s * 0.4, -s * 0.15)
  // Staff
  ctx.fillStyle = flash ? '#fff' : '#92400e'
  ctx.fillRect(f * s * 0.02, -s * 0.9, s * 0.06, s * 1.2)
  // Staff orb
  ctx.fillStyle = flash ? '#fff' : '#34d399'
  ctx.beginPath()
  ctx.arc(f * s * 0.05, -s * 0.95, s * 0.12, 0, Math.PI * 2)
  ctx.fill()
  // Orb glow
  if (!flash) {
    ctx.fillStyle = `rgba(52,211,153,${0.2 + Math.sin(t / 300) * 0.15})`
    ctx.beginPath()
    ctx.arc(f * s * 0.05, -s * 0.95, s * 0.2, 0, Math.PI * 2)
    ctx.fill()
  }
  // Arm
  ctx.fillStyle = flash ? '#fff' : '#d4a373'
  ctx.beginPath()
  ctx.ellipse(0, 0, s * 0.1, s * 0.2, 0.2 * f, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Head
  ctx.fillStyle = flash ? '#fff' : '#d4a373'
  ctx.beginPath()
  ctx.arc(0, -s * 0.55, s * 0.25, 0, Math.PI * 2)
  ctx.fill()

  // Hair / hood
  ctx.fillStyle = flash ? '#fff' : '#065f46'
  ctx.beginPath()
  ctx.arc(0, -s * 0.6, s * 0.27, Math.PI * 0.8, Math.PI * 2.2)
  ctx.lineTo(s * 0.15, -s * 0.4)
  ctx.lineTo(-s * 0.15, -s * 0.4)
  ctx.closePath()
  ctx.fill()

  // Ears (elf-like)
  if (!flash) {
    ctx.fillStyle = '#d4a373'
    ctx.beginPath()
    ctx.moveTo(-s * 0.25, -s * 0.6)
    ctx.lineTo(-s * 0.45, -s * 0.75)
    ctx.lineTo(-s * 0.22, -s * 0.5)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(s * 0.25, -s * 0.6)
    ctx.lineTo(s * 0.45, -s * 0.75)
    ctx.lineTo(s * 0.22, -s * 0.5)
    ctx.closePath()
    ctx.fill()
  }

  // Eyes
  if (!flash) {
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.ellipse(-s * 0.08, -s * 0.55, s * 0.06, s * 0.05, 0, 0, Math.PI * 2)
    ctx.ellipse(s * 0.08, -s * 0.55, s * 0.06, s * 0.05, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#065f46'
    ctx.beginPath()
    ctx.arc(-s * 0.07, -s * 0.54, s * 0.025, 0, Math.PI * 2)
    ctx.arc(s * 0.09, -s * 0.54, s * 0.025, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawBossCharacter(ctx, x, y, size, flash, enraged, t, state, colors) {
  const s = size
  const c = colors || { body: '#4a1a6b', bodyEnraged: '#8b1a1a', accent: '#3a1556', eyes: '#ff8800', horn: '#8b5cf6' }
  ctx.save()
  ctx.translate(x, y)

  const bob = state === 'stunned' ? 0 : Math.sin(t / 300) * 3
  const breathe = 1 + Math.sin(t / 500) * 0.03

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath()
  ctx.ellipse(0, s * 1.3, s * 1.0, s * 0.2, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.translate(0, bob)
  ctx.scale(breathe, breathe)

  // Rage aura
  if (enraged) {
    ctx.fillStyle = `rgba(230,57,70,${0.08 + Math.sin(t / 200) * 0.05})`
    ctx.beginPath()
    ctx.arc(0, 0, s * 1.8, 0, Math.PI * 2)
    ctx.fill()
  }

  // Legs
  ctx.fillStyle = flash ? '#fff' : (enraged ? c.bodyEnraged : c.body)
  const legW = s * 0.3, legH = s * 0.5
  ctx.beginPath()
  ctx.ellipse(-s * 0.35, s * 0.8, legW, legH, 0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(s * 0.35, s * 0.8, legW, legH, -0.1, 0, Math.PI * 2)
  ctx.fill()

  // Body (huge)
  ctx.fillStyle = flash ? '#fff' : (enraged ? c.bodyEnraged : c.body)
  ctx.beginPath()
  ctx.ellipse(0, 0, s * 0.9, s * 1.0, 0, 0, Math.PI * 2)
  ctx.fill()

  // Belly plate
  ctx.fillStyle = flash ? '#fff' : c.accent
  ctx.beginPath()
  ctx.ellipse(0, s * 0.15, s * 0.55, s * 0.6, 0, 0, Math.PI * 2)
  ctx.fill()

  // Arms
  const armSwing = Math.sin(t / 250) * 0.15
  ctx.save()
  ctx.translate(-s * 0.85, -s * 0.1)
  ctx.rotate(-0.4 + armSwing)
  ctx.fillStyle = flash ? '#fff' : (enraged ? c.bodyEnraged : c.body)
  ctx.beginPath()
  ctx.ellipse(0, 0, s * 0.25, s * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = flash ? '#fff' : c.accent
  ctx.beginPath()
  ctx.arc(0, s * 0.5, s * 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.translate(s * 0.85, -s * 0.1)
  ctx.rotate(0.4 - armSwing)
  ctx.fillStyle = flash ? '#fff' : (enraged ? c.bodyEnraged : c.body)
  ctx.beginPath()
  ctx.ellipse(0, 0, s * 0.25, s * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = flash ? '#fff' : c.accent
  ctx.beginPath()
  ctx.arc(0, s * 0.5, s * 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Head
  ctx.fillStyle = flash ? '#fff' : (enraged ? c.bodyEnraged : c.body)
  ctx.beginPath()
  ctx.arc(0, -s * 0.85, s * 0.45, 0, Math.PI * 2)
  ctx.fill()

  // Horns
  ctx.fillStyle = flash ? '#fff' : c.horn
  ctx.beginPath()
  ctx.moveTo(-s * 0.3, -s * 1.1)
  ctx.quadraticCurveTo(-s * 0.6, -s * 1.8, -s * 0.15, -s * 1.6)
  ctx.lineTo(-s * 0.15, -s * 1.0)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(s * 0.3, -s * 1.1)
  ctx.quadraticCurveTo(s * 0.6, -s * 1.8, s * 0.15, -s * 1.6)
  ctx.lineTo(s * 0.15, -s * 1.0)
  ctx.closePath()
  ctx.fill()

  // Mouth
  if (!flash) {
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.ellipse(0, -s * 0.65, s * 0.2, s * 0.1, 0, 0, Math.PI)
    ctx.fill()
    ctx.fillStyle = '#fff'
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(i * s * 0.08 - s * 0.03, -s * 0.65)
      ctx.lineTo(i * s * 0.08, -s * 0.58)
      ctx.lineTo(i * s * 0.08 + s * 0.03, -s * 0.65)
      ctx.closePath()
      ctx.fill()
    }
  }

  // Eyes
  if (!flash) {
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.ellipse(-s * 0.18, -s * 0.88, s * 0.13, s * 0.1, -0.1, 0, Math.PI * 2)
    ctx.ellipse(s * 0.18, -s * 0.88, s * 0.13, s * 0.1, 0.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = enraged ? '#ff2222' : c.eyes
    ctx.beginPath()
    ctx.ellipse(-s * 0.18, -s * 0.88, s * 0.09, s * 0.06, -0.1, 0, Math.PI * 2)
    ctx.ellipse(s * 0.18, -s * 0.88, s * 0.09, s * 0.06, 0.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(-s * 0.2, -s * 0.9, s * 0.025, 0, Math.PI * 2)
    ctx.arc(s * 0.16, -s * 0.9, s * 0.025, 0, Math.PI * 2)
    ctx.fill()
    const eyeRGB = enraged ? '255,50,50' : '255,136,0'
    ctx.fillStyle = `rgba(${eyeRGB},${0.15 + Math.sin(t / 200) * 0.1})`
    ctx.beginPath()
    ctx.arc(-s * 0.18, -s * 0.88, s * 0.2, 0, Math.PI * 2)
    ctx.arc(s * 0.18, -s * 0.88, s * 0.2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Stun stars
  if (state === 'stunned') {
    for (let i = 0; i < 3; i++) {
      const angle = t / 500 + i * (Math.PI * 2 / 3)
      const starX = Math.cos(angle) * s * 0.6
      const starY = -s * 1.5 + Math.sin(angle * 2) * s * 0.1
      ctx.fillStyle = '#ffd700'
      ctx.font = `${s * 0.3}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('\u2605', starX, starY)
    }
  }

  ctx.restore()
}

function drawCharacter(ctx, player, size, t) {
  const flash = player.flashTimer > 0
  const flip = player.vx < -0.01
  if (player.role === 'attacker') drawAttacker(ctx, player.x, player.y, size, flip, flash, t)
  else if (player.role === 'tank') drawTank(ctx, player.x, player.y, size, flip, flash, t)
  else drawSupport(ctx, player.x, player.y, size, flip, flash, t)
}

// ======================== GAME ENTITY HELPERS ========================

function createEntity(x, y, role, isBot, name) {
  const cfg = ROLE_CONFIGS[role]
  return {
    x, y, role, isBot, name,
    hp: cfg.maxHP, maxHP: cfg.maxHP,
    baseDamage: cfg.baseDamage,
    abilityCooldown: 0,
    abilityMaxCooldown: cfg.abilityCooldown * 1000,
    ultimateMeter: 0,
    isAlive: true,
    vx: 0, vy: 0,
    lastAutoAttack: 0,
    shieldActive: false,
    shieldTimer: 0,
    stats: { damage: 0, healing: 0, blocked: 0, crits: 0, abilities: 0, aggro: 0 },
    flashTimer: 0,
    angle: 0,
  }
}

function createBoss(config) {
  const totalHP = config.hpBars * config.hpPerBar
  return {
    x: ARENA_W / 2, y: ARENA_H / 2 - 40,
    hp: totalHP, maxHP: totalHP,
    hpBars: config.hpBars,
    hpPerBar: config.hpPerBar,
    currentBar: config.hpBars,
    currentPhase: 0,
    phases: config.phases,
    attackWeights: config.phases[0].attacks,
    colors: config.colors,
    rageMeter: 0, isEnraged: false,
    state: 'idle', stateTimer: 2000,
    currentAttack: null, telegraphTimer: 0,
    telegraphData: null,
    weakPointActive: false, weakPointTimer: 0,
    lastWeakPointHP: totalHP,
    angle: Math.PI / 2,
    targetPlayer: 0,
    threat: [0, 0, 0],
    flashTimer: 0,
    attackCooldowns: { slam: 0, charge: 0, aoe: 0 },
    speedMultiplier: config.speedMultiplier,
    damageMultiplier: config.damageMultiplier,
    attackSpeedMultiplier: config.attackSpeedMultiplier,
    baseSpeedMultiplier: config.speedMultiplier,
    baseDamageMultiplier: config.damageMultiplier,
    baseAttackSpeedMultiplier: config.attackSpeedMultiplier,
    phaseTransitionTimer: 0,
  }
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function angleBetween(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x)
}

function clampToArena(x, y, pad = 30) {
  return {
    x: Math.max(pad, Math.min(ARENA_W - pad, x)),
    y: Math.max(pad, Math.min(ARENA_H - pad, y)),
  }
}

// ======================== COMPONENT ========================

export default function GameplayScreen() {
  const canvasRef = useRef(null)
  const { state, dispatch } = useGame()
  const { match, player } = state
  const gameRef = useRef(null)
  const joystickRef = useRef({ active: false, dx: 0, dy: 0, startX: 0, startY: 0 })
  const touchIdRef = useRef(null)
  const abilityPressedRef = useRef(false)
  const ultimatePressedRef = useRef(false)

  const damageNumbersRef = useRef([])
  const floatingTextsRef = useRef([])
  const shakeRef = useRef({ intensity: 0, timer: 0 })
  const particlesRef = useRef([])

  const [joystickVisual, setJoystickVisual] = useState({ dx: 0, dy: 0, active: false })
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight)
  const [showRotatePrompt, setShowRotatePrompt] = useState(window.innerWidth <= window.innerHeight)
  const [rotateCountdown, setRotateCountdown] = useState(null)

  // Orientation detection
  useEffect(() => {
    const check = () => {
      const landscape = window.innerWidth > window.innerHeight
      setIsLandscape(landscape)
      if (landscape) setShowRotatePrompt(false)
    }
    window.addEventListener('resize', check)
    check()
    return () => window.removeEventListener('resize', check)
  }, [])

  // Skip prompt after 5s even in portrait
  useEffect(() => {
    if (!showRotatePrompt) return
    setRotateCountdown(5)
    const interval = setInterval(() => {
      setRotateCountdown(prev => {
        if (prev <= 1) {
          setShowRotatePrompt(false)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Initialize game
  useEffect(() => {
    if (!match || showRotatePrompt) return

    const bossConfig = getBossConfig(match.bossFloor || 1)

    const players = match.players.map((p, i) => {
      const positions = [
        { x: ARENA_W / 2 - 100, y: ARENA_H / 2 + 120 },
        { x: ARENA_W / 2 + 150, y: ARENA_H / 2 + 80 },
        { x: ARENA_W / 2 - 150, y: ARENA_H / 2 + 80 },
      ]
      return createEntity(positions[i].x, positions[i].y, p.role, p.isBot, p.name)
    })

    gameRef.current = {
      players,
      boss: createBoss(bossConfig),
      bossConfig,
      timeRemaining: match.timeRemaining * 1000,
      isActive: true,
      matchResult: null,
      elapsedTime: 0,
      rageBannerTimer: 0,
      screenRedIntensity: 0,
      phaseBannerTimer: 0,
      phaseBannerText: '',
    }

    let lastTime = performance.now()
    let frameId
    const gameLoop = (now) => {
      const dt = Math.min(now - lastTime, 50)
      lastTime = now
      if (gameRef.current?.isActive) updateGame(dt)
      renderGame()
      frameId = requestAnimationFrame(gameLoop)
    }
    frameId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(frameId)
  }, [match, showRotatePrompt])

  // ======================== UPDATE (same logic, just uses new arena bounds) ========================
  const updateGame = useCallback((dt) => {
    const g = gameRef.current
    if (!g) return

    g.elapsedTime += dt
    g.timeRemaining -= dt

    if (g.boss.hp <= 0) { endMatch(true); return }
    if (g.timeRemaining <= 0 || g.players.every(p => !p.isAlive)) { endMatch(false); return }

    const joy = joystickRef.current
    if (joy.active) {
      g.players[0].vx = joy.dx * 0.2
      g.players[0].vy = joy.dy * 0.2
    } else {
      g.players[0].vx *= 0.85
      g.players[0].vy *= 0.85
    }

    g.players.forEach((p, i) => {
      if (!p.isAlive) return
      if (p.isBot) updateBotAI(g, p, i, dt)
      p.x += p.vx * dt
      p.y += p.vy * dt
      const clamped = clampToArena(p.x, p.y, PLAYER_SIZE)
      p.x = clamped.x; p.y = clamped.y

      if (g.elapsedTime - p.lastAutoAttack > AUTO_ATTACK_INTERVAL && dist(p, g.boss) < AUTO_ATTACK_RANGE) {
        const dmg = calculateDamage(p, g.boss)
        applyDamageToBoss(g, dmg, p.x, p.y, i)
        p.lastAutoAttack = g.elapsedTime
        p.stats.damage += dmg.amount
        spawnParticles(g.boss.x, g.boss.y, 3, p.role === 'attacker' ? '#e63946' : p.role === 'tank' ? '#3b82f6' : '#10b981')
      }

      if (p.abilityCooldown > 0) p.abilityCooldown -= dt
      if (p.shieldActive) { p.shieldTimer -= dt; if (p.shieldTimer <= 0) p.shieldActive = false }
      if (p.flashTimer > 0) p.flashTimer -= dt
      p.angle = angleBetween(p, g.boss)
    })

    if (abilityPressedRef.current) { abilityPressedRef.current = false; useAbility(g, 0) }
    if (ultimatePressedRef.current) { ultimatePressedRef.current = false; useUltimate(g, 0) }

    updateBoss(g, dt)

    damageNumbersRef.current = damageNumbersRef.current.filter(d => { d.y -= 0.05 * dt; d.opacity -= 0.001 * dt; d.life -= dt; return d.life > 0 })
    floatingTextsRef.current = floatingTextsRef.current.filter(t => { t.y -= 0.03 * dt; t.opacity -= 0.0015 * dt; t.life -= dt; return t.life > 0 })
    if (shakeRef.current.timer > 0) shakeRef.current.timer -= dt
    particlesRef.current = particlesRef.current.filter(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; p.opacity = p.life / p.maxLife; return p.life > 0 })
    if (g.rageBannerTimer > 0) g.rageBannerTimer -= dt
    if (g.phaseBannerTimer > 0) g.phaseBannerTimer -= dt
    if (g.boss.phaseTransitionTimer > 0) g.boss.phaseTransitionTimer -= dt
    if (g.boss.isEnraged) g.screenRedIntensity = 0.1 + Math.sin(g.elapsedTime / 500) * 0.05
  }, [])

  function calculateDamage(p, boss) {
    let amount = p.baseDamage
    let isCrit = Math.random() < 0.15
    const tier = state.player.upgrades[p.role] || 0
    amount *= (1 + ROLE_CONFIGS[p.role].tierDamageBonus[tier])
    if (isCrit) { amount *= 2; p.stats.crits++ }
    if (boss.weakPointActive) amount *= 3
    return { amount: Math.floor(amount), isCrit }
  }

  function applyDamageToBoss(g, dmg, fromX, fromY, playerIdx) {
    const prevBar = Math.ceil(g.boss.hp / g.boss.hpPerBar)
    g.boss.hp = Math.max(0, g.boss.hp - dmg.amount)
    g.boss.flashTimer = 80
    g.boss.rageMeter = Math.min(100, g.boss.rageMeter + dmg.amount / 100)
    g.boss.threat[playerIdx] += dmg.amount

    damageNumbersRef.current.push({ x: g.boss.x + (Math.random() - 0.5) * 40, y: g.boss.y - 50, amount: dmg.amount, isCrit: dmg.isCrit, opacity: 1, life: 800 })

    // Phase transition: check if an HP bar was depleted
    const newBar = Math.ceil(g.boss.hp / g.boss.hpPerBar)
    if (newBar < prevBar && g.boss.hp > 0) {
      g.boss.currentBar = newBar
      const nextPhase = Math.min(g.boss.phases.length - 1, g.boss.currentPhase + 1)
      if (nextPhase > g.boss.currentPhase) {
        g.boss.currentPhase = nextPhase
        const phase = g.boss.phases[nextPhase]
        g.boss.attackWeights = phase.attacks
        g.boss.speedMultiplier = g.boss.baseSpeedMultiplier * phase.speedBoost
        g.boss.damageMultiplier = g.boss.baseDamageMultiplier * phase.damageBoost
        g.boss.attackSpeedMultiplier = g.boss.baseAttackSpeedMultiplier * phase.speedBoost
      }
      // Stagger + phase transition effects
      g.boss.state = 'stunned'
      g.boss.stateTimer = 2000
      g.boss.phaseTransitionTimer = 2000
      g.phaseBannerTimer = 3000
      g.phaseBannerText = `PHASE ${g.boss.currentPhase + 1}`
      shakeRef.current = { intensity: 8, timer: 800 }
      floatingTextsRef.current.push({ x: g.boss.x, y: g.boss.y - 80, text: `PHASE ${g.boss.currentPhase + 1}!`, color: '#ffd700', opacity: 1, life: 2500, fontSize: 22 })
      spawnParticles(g.boss.x, g.boss.y, 20, g.boss.colors?.horn || '#ffd700')
    }

    // Weak point at 50% of each HP bar
    const barHP = g.boss.hp % g.boss.hpPerBar || (g.boss.hp > 0 ? g.boss.hpPerBar : 0)
    const barHalf = g.boss.hpPerBar / 2
    const prevBarHP = (g.boss.hp + dmg.amount) % g.boss.hpPerBar || g.boss.hpPerBar
    if (prevBarHP > barHalf && barHP <= barHalf && g.boss.hp > 0 && !g.boss.weakPointActive) {
      g.boss.weakPointActive = true
      g.boss.weakPointTimer = WEAK_POINT_DURATION
      floatingTextsRef.current.push({ x: g.boss.x, y: g.boss.y - 80, text: 'WEAK POINT!', color: '#00ffff', opacity: 1, life: 2000, fontSize: 18 })
    }

    if (g.boss.rageMeter >= 100 && !g.boss.isEnraged) {
      g.boss.isEnraged = true
      g.boss.speedMultiplier *= 1.15
      g.boss.damageMultiplier *= 1.2
      g.boss.attackSpeedMultiplier *= 1.3
      g.rageBannerTimer = 3000
      shakeRef.current = { intensity: 8, timer: 1000 }
      floatingTextsRef.current.push({ x: ARENA_W / 2, y: ARENA_H / 2 - 80, text: 'RAGE MODE!', color: '#e63946', opacity: 1, life: 3000, fontSize: 24 })
    }

    g.players[playerIdx].ultimateMeter = Math.min(100, g.players[playerIdx].ultimateMeter + dmg.amount / 50)
  }

  function useAbility(g, idx) {
    const p = g.players[idx]
    if (!p.isAlive || p.abilityCooldown > 0) return
    const tier = state.player.upgrades[p.role] || 0
    p.abilityCooldown = p.abilityMaxCooldown - ROLE_CONFIGS[p.role].tierCooldownReduction[tier] * 1000
    p.stats.abilities++

    if (p.role === 'attacker') {
      const angle = angleBetween(p, g.boss)
      p.x += Math.cos(angle) * 80; p.y += Math.sin(angle) * 80
      const c = clampToArena(p.x, p.y, PLAYER_SIZE); p.x = c.x; p.y = c.y
      if (dist(p, g.boss) < AUTO_ATTACK_RANGE + 40) {
        const dmg = { amount: Math.floor(p.baseDamage * 3 * (1 + ROLE_CONFIGS.attacker.tierDamageBonus[tier])), isCrit: false }
        applyDamageToBoss(g, dmg, p.x, p.y, idx); p.stats.damage += dmg.amount
        spawnParticles(g.boss.x, g.boss.y, 8, '#e63946'); shakeRef.current = { intensity: 4, timer: 200 }
      }
    } else if (p.role === 'tank') {
      p.shieldActive = true; p.shieldTimer = 3000
      g.boss.targetPlayer = idx; g.boss.threat[idx] += 500
      floatingTextsRef.current.push({ x: p.x, y: p.y - 40, text: 'SHIELD!', color: '#3b82f6', opacity: 1, life: 1000, fontSize: 14 })
    } else {
      const heal = Math.floor(30 * (1 + ROLE_CONFIGS.support.tierDamageBonus[tier]))
      g.players.forEach(a => { if (a.isAlive) { a.hp = Math.min(a.maxHP, a.hp + heal); spawnParticles(a.x, a.y, 5, '#10b981') } })
      p.stats.healing += heal * g.players.filter(a => a.isAlive).length
      floatingTextsRef.current.push({ x: p.x, y: p.y - 40, text: `+${heal} HP`, color: '#10b981', opacity: 1, life: 1000, fontSize: 14 })
    }
    p.ultimateMeter = Math.min(100, p.ultimateMeter + 10)
  }

  function useUltimate(g, idx) {
    const p = g.players[idx]
    if (!p.isAlive || p.ultimateMeter < 100) return
    p.ultimateMeter = 0
    shakeRef.current = { intensity: 6, timer: 500 }
    const rageM = g.boss.isEnraged ? 2 : 1

    if (p.role === 'attacker') {
      const dmg = { amount: Math.floor(p.baseDamage * 10 * rageM), isCrit: true }
      applyDamageToBoss(g, dmg, p.x, p.y, idx); p.stats.damage += dmg.amount
      spawnParticles(g.boss.x, g.boss.y, 20, '#ffd700')
      floatingTextsRef.current.push({ x: g.boss.x, y: g.boss.y - 70, text: 'ULTIMATE!', color: '#ffd700', opacity: 1, life: 2000, fontSize: 20 })
    } else if (p.role === 'tank') {
      p.shieldActive = true; p.shieldTimer = 6000; p.hp = p.maxHP
      g.boss.targetPlayer = idx; g.boss.threat[idx] += 2000
      spawnParticles(p.x, p.y, 15, '#3b82f6')
      floatingTextsRef.current.push({ x: p.x, y: p.y - 60, text: 'FORTRESS!', color: '#3b82f6', opacity: 1, life: 2000, fontSize: 20 })
    } else {
      g.players.forEach(a => { if (a.isAlive) { a.hp = a.maxHP; spawnParticles(a.x, a.y, 10, '#ffd700') } })
      p.stats.healing += g.players.filter(a => a.isAlive).length * 100
      floatingTextsRef.current.push({ x: p.x, y: p.y - 60, text: 'DIVINE LIGHT!', color: '#ffd700', opacity: 1, life: 2000, fontSize: 20 })
    }
  }

  function spawnParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, sp = 0.05 + Math.random() * 0.15
      particlesRef.current.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, color, size: 2 + Math.random() * 3, life: 400 + Math.random() * 400, maxLife: 800, opacity: 1 })
    }
  }

  function updateBotAI(g, bot, idx, dt) {
    const boss = g.boss, d = dist(bot, boss)
    if (bot.role === 'tank') {
      const td = 70
      if (d > td + 20) { const a = angleBetween(bot, boss); bot.vx = Math.cos(a) * 0.12; bot.vy = Math.sin(a) * 0.12 }
      else if (d < td - 20) { const a = angleBetween(boss, bot); bot.vx = Math.cos(a) * 0.08; bot.vy = Math.sin(a) * 0.08 }
      else { bot.vx *= 0.9; bot.vy *= 0.9 }
      if (boss.targetPlayer !== idx && boss.state === 'windup' && bot.abilityCooldown <= 0) useAbility(g, idx)
      bot.stats.aggro += boss.targetPlayer === idx ? 0.001 * dt : 0
    } else if (bot.role === 'support') {
      const td = 160
      if (d < td - 30) { const a = angleBetween(boss, bot); bot.vx = Math.cos(a) * 0.1; bot.vy = Math.sin(a) * 0.1 }
      else if (d > td + 30) { const a = angleBetween(bot, boss); bot.vx = Math.cos(a) * 0.1; bot.vy = Math.sin(a) * 0.1 }
      else { bot.vx *= 0.9; bot.vy *= 0.9 }
      if (g.players.find(p => p.isAlive && p.hp < p.maxHP * 0.5) && bot.abilityCooldown <= 0) useAbility(g, idx)
    } else {
      const td = boss.weakPointActive ? 60 : 100
      if (d > td + 20) { const a = angleBetween(bot, boss); bot.vx = Math.cos(a) * 0.14; bot.vy = Math.sin(a) * 0.14 }
      else if (d < td - 20) { const a = angleBetween(boss, bot); bot.vx = Math.cos(a) * 0.1; bot.vy = Math.sin(a) * 0.1 }
      else { bot.vx *= 0.9; bot.vy *= 0.9 }
      if ((boss.weakPointActive || Math.random() < 0.005) && bot.abilityCooldown <= 0) useAbility(g, idx)
    }
    if (boss.telegraphData && boss.state === 'windup') {
      const td = boss.telegraphData
      if (td.type === 'slam') {
        const aToBot = angleBetween(boss, bot), diff = Math.abs(aToBot - td.angle)
        if (diff < (td.coneAngle / 2) * Math.PI / 180 && d < td.range) { const da = aToBot + Math.PI / 2; bot.vx = Math.cos(da) * 0.2; bot.vy = Math.sin(da) * 0.2 }
      } else if (td.type === 'aoe' && td.positions) {
        for (const pos of td.positions) { if (dist(bot, pos) < td.radius + 30) { const away = angleBetween(pos, bot); bot.vx = Math.cos(away) * 0.2; bot.vy = Math.sin(away) * 0.2 } }
      }
    }
    if (bot.ultimateMeter >= 100 && boss.isEnraged && Math.random() < 0.01) useUltimate(g, idx)
  }

  function updateBoss(g, dt) {
    const boss = g.boss
    boss.flashTimer = Math.max(0, boss.flashTimer - dt)
    if (boss.weakPointActive) { boss.weakPointTimer -= dt; if (boss.weakPointTimer <= 0) boss.weakPointActive = false }
    for (const k of Object.keys(boss.attackCooldowns)) boss.attackCooldowns[k] = Math.max(0, boss.attackCooldowns[k] - dt)

    switch (boss.state) {
      case 'idle': {
        boss.stateTimer -= dt
        if (boss.stateTimer <= 0) boss.state = 'choose'
        const mti = boss.threat.indexOf(Math.max(...boss.threat))
        if (g.players[mti]?.isAlive) { boss.targetPlayer = mti; boss.angle += (angleBetween(boss, g.players[mti]) - boss.angle) * 0.003 * dt }
        break
      }
      case 'stunned': { boss.stateTimer -= dt; if (boss.stateTimer <= 0) { boss.state = 'idle'; boss.stateTimer = 1000 }; break }
      case 'choose': {
        const avail = Object.entries(boss.attackCooldowns).filter(([, cd]) => cd <= 0).map(([k]) => k)
        if (!avail.length) { boss.state = 'idle'; boss.stateTimer = 1000; break }
        // Weighted random selection based on boss phase attack weights
        const weights = boss.attackWeights || { slam: 1, charge: 1, aoe: 1 }
        const weighted = avail.map(a => ({ attack: a, weight: weights[a] || 1 }))
        const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0)
        let roll = Math.random() * totalWeight
        let atk = weighted[0].attack
        for (const w of weighted) { roll -= w.weight; if (roll <= 0) { atk = w.attack; break } }
        const target = g.players[boss.targetPlayer]
        if (!target?.isAlive) { const alive = g.players.findIndex(p => p.isAlive); if (alive >= 0) boss.targetPlayer = alive }
        boss.currentAttack = atk; boss.state = 'windup'; boss.stateTimer = BOSS_ATTACKS[atk].telegraphDuration / boss.attackSpeedMultiplier
        if (atk === 'slam') { const tp = g.players[boss.targetPlayer]; boss.telegraphData = { type: 'slam', angle: tp ? angleBetween(boss, tp) : boss.angle, coneAngle: BOSS_ATTACKS.slam.coneAngle, range: BOSS_ATTACKS.slam.range } }
        else if (atk === 'charge') { const tp = g.players[boss.targetPlayer]; boss.telegraphData = { type: 'charge', angle: tp ? angleBetween(boss, tp) : boss.angle, range: BOSS_ATTACKS.charge.range, width: BOSS_ATTACKS.charge.width } }
        else { const positions = []; for (let i = 0; i < (boss.isEnraged ? 4 : 2); i++) { const ap = g.players.filter(p => p.isAlive); const t = ap[Math.floor(Math.random() * ap.length)]; if (t) positions.push({ x: t.x + (Math.random() - 0.5) * 60, y: t.y + (Math.random() - 0.5) * 60 }) }; boss.telegraphData = { type: 'aoe', positions, radius: BOSS_ATTACKS.aoe.radius } }
        break
      }
      case 'windup': { boss.stateTimer -= dt; if (boss.stateTimer <= 0) { boss.state = 'execute'; boss.stateTimer = 200 }; break }
      case 'execute': {
        const attack = BOSS_ATTACKS[boss.currentAttack], td = boss.telegraphData
        g.players.forEach((p, i) => {
          if (!p.isAlive) return
          let hit = false
          if (td.type === 'slam') { const atp = angleBetween(boss, p); const diff = Math.abs(((atp - td.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI); if (diff < (td.coneAngle / 2) * Math.PI / 180 && dist(boss, p) < td.range) hit = true }
          else if (td.type === 'charge') { const dx = Math.cos(td.angle), dy = Math.sin(td.angle); const px = p.x - boss.x, py = p.y - boss.y; const proj = px * dx + py * dy; if (proj > 0 && proj < td.range) { const perp = Math.abs(px * (-dy) + py * dx); if (perp < td.width / 2) hit = true } }
          else if (td.type === 'aoe') { for (const pos of td.positions) { if (dist(p, pos) < td.radius) { hit = true; break } } }
          if (hit) {
            let dmg = Math.floor(attack.damage * boss.damageMultiplier)
            if (p.shieldActive) { const blocked = Math.floor(dmg * 0.7); dmg -= blocked; p.stats.blocked += blocked }
            p.hp -= dmg; p.flashTimer = 150; shakeRef.current = { intensity: 5, timer: 200 }
            damageNumbersRef.current.push({ x: p.x, y: p.y - 30, amount: dmg, isCrit: false, opacity: 1, life: 800, isPlayerDamage: true })
            spawnParticles(p.x, p.y, 5, '#e63946')
            if (p.hp <= 0) { p.hp = 0; p.isAlive = false; floatingTextsRef.current.push({ x: p.x, y: p.y - 40, text: 'KO!', color: '#e63946', opacity: 1, life: 2000, fontSize: 18 }) }
          }
        })
        boss.attackCooldowns[boss.currentAttack] = attack.cooldown / boss.attackSpeedMultiplier
        boss.state = 'recover'; boss.stateTimer = 1000 / boss.attackSpeedMultiplier
        boss.telegraphData = null; boss.currentAttack = null
        break
      }
      case 'recover': { boss.stateTimer -= dt; if (boss.stateTimer <= 0) { boss.state = 'idle'; boss.stateTimer = (1500 + Math.random() * 1500) / boss.attackSpeedMultiplier }; break }
    }
    if (boss.state !== 'stunned') {
      const target = g.players[boss.targetPlayer]
      if (target?.isAlive && dist(boss, target) > 100) {
        const a = angleBetween(boss, target); boss.x += Math.cos(a) * 0.03 * dt * boss.speedMultiplier; boss.y += Math.sin(a) * 0.03 * dt * boss.speedMultiplier
      }
      const c = clampToArena(boss.x, boss.y, BOSS_SIZE); boss.x = c.x; boss.y = c.y
    }
  }

  function endMatch(victory) {
    const g = gameRef.current; g.isActive = false
    const completionTime = g.elapsedTime / 1000
    const playerStats = g.players.map(p => {
      let score = p.role === 'attacker' ? Math.floor(p.stats.damage + p.stats.crits * 50) : p.role === 'tank' ? Math.floor(p.stats.blocked * 0.8 + p.stats.aggro * 30) : Math.floor(p.stats.healing * 1.2 + p.stats.abilities * 40)
      return { role: p.role, name: p.name, damage: p.stats.damage, crit: p.stats.crits > 0 ? Math.floor((p.stats.crits / Math.max(1, p.stats.abilities + Math.floor(g.elapsedTime / AUTO_ATTACK_INTERVAL))) * 100) : 0, heal: p.stats.healing, block: p.stats.blocked, aggro: Math.floor(p.stats.aggro), buff: p.stats.abilities, score, failure: !victory ? (p.role === 'attacker' && p.stats.damage < 2000 ? 'AGGRESSION LOW' : p.role === 'tank' && p.stats.aggro < 50 ? 'COVERAGE BREAKDOWN' : p.role === 'support' && p.stats.healing < 500 ? 'HEALING GAPS' : null) : null }
    })
    const result = { victory, completionTime, bossRemainingPercent: Math.ceil((g.boss.hp / g.boss.maxHP) * 100), wasTimeout: g.timeRemaining <= 0, totalScore: playerStats.reduce((s, p) => s + p.score, 0), playerStats }
    const my = playerStats[0]
    dispatch({ type: 'UPDATE_LIFETIME_STATS', role: g.players[0].role, stats: { damage: my.damage, crit: my.crit, heal: my.heal, block: my.block, aggro: my.aggro, buff: my.buff, score: my.score, gamesPlayed: 1 } })
    setTimeout(() => dispatch({ type: 'END_MATCH', result }), 1500)
  }

  // ======================== RENDER ========================
  const renderGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const g = gameRef.current
    if (!g) return

    const w = canvas.width, h = canvas.height
    const scaleX = w / ARENA_W, scaleY = h / ARENA_H
    const scale = Math.min(scaleX, scaleY)
    const offsetX = (w - ARENA_W * scale) / 2, offsetY = (h - ARENA_H * scale) / 2

    ctx.save()
    let shakeX = 0, shakeY = 0
    if (shakeRef.current.timer > 0) { shakeX = (Math.random() - 0.5) * shakeRef.current.intensity; shakeY = (Math.random() - 0.5) * shakeRef.current.intensity }
    ctx.translate(shakeX, shakeY)

    // BG
    ctx.fillStyle = '#080c14'
    ctx.fillRect(0, 0, w, h)

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    // Arena floor - stone tiles (tinted by boss theme)
    const arenaColor = g.bossConfig?.colors?.arena || '#1e2235'
    const floorGrad = ctx.createRadialGradient(ARENA_W / 2, ARENA_H / 2, 50, ARENA_W / 2, ARENA_H / 2, ARENA_W / 2)
    floorGrad.addColorStop(0, arenaColor)
    floorGrad.addColorStop(0.6, '#161a28')
    floorGrad.addColorStop(1, '#0c0f18')
    ctx.fillStyle = floorGrad
    ctx.beginPath()
    ctx.roundRect(10, 10, ARENA_W - 20, ARENA_H - 20, 20)
    ctx.fill()

    // Stone tile pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.025)'
    ctx.lineWidth = 1
    for (let y = 0; y < ARENA_H; y += 50) {
      const off = ((y / 50) % 2) * 25
      for (let x = off; x < ARENA_W; x += 50) {
        ctx.strokeRect(x, y, 50, 50)
      }
    }

    // Arena border glow
    ctx.strokeStyle = g.boss.isEnraged ? `rgba(230,57,70,${0.3 + Math.sin(g.elapsedTime / 300) * 0.15})` : 'rgba(100,120,180,0.15)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(10, 10, ARENA_W - 20, ARENA_H - 20, 20)
    ctx.stroke()

    // Telegraphs
    if (g.boss.telegraphData && g.boss.state === 'windup') {
      const td = g.boss.telegraphData
      const alpha = 0.15 + Math.sin(g.elapsedTime / 100) * 0.1
      if (td.type === 'slam') {
        ctx.save(); ctx.translate(g.boss.x, g.boss.y); ctx.rotate(td.angle)
        ctx.fillStyle = `rgba(230,57,70,${alpha})`
        ctx.beginPath(); ctx.moveTo(0, 0); const ha = (td.coneAngle / 2) * Math.PI / 180; ctx.arc(0, 0, td.range, -ha, ha); ctx.closePath(); ctx.fill()
        ctx.strokeStyle = `rgba(255,80,80,${alpha + 0.15})`; ctx.lineWidth = 2; ctx.stroke()
        ctx.restore()
      } else if (td.type === 'charge') {
        ctx.save(); ctx.translate(g.boss.x, g.boss.y); ctx.rotate(td.angle)
        ctx.fillStyle = `rgba(230,57,70,${alpha})`; ctx.fillRect(0, -td.width / 2, td.range, td.width)
        ctx.strokeStyle = `rgba(255,80,80,${alpha + 0.15})`; ctx.lineWidth = 2; ctx.strokeRect(0, -td.width / 2, td.range, td.width)
        ctx.restore()
      } else if (td.type === 'aoe') {
        for (const pos of td.positions) { ctx.fillStyle = `rgba(230,57,70,${alpha})`; ctx.beginPath(); ctx.arc(pos.x, pos.y, td.radius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = `rgba(255,80,80,${alpha + 0.15})`; ctx.lineWidth = 2; ctx.stroke() }
      }
    }

    // Draw boss
    const bossDrawSize = BOSS_SIZE * 1.2
    drawBossCharacter(ctx, g.boss.x, g.boss.y, bossDrawSize, g.boss.flashTimer > 0, g.boss.isEnraged, g.elapsedTime, g.boss.state, g.boss.colors)

    // Weak point orb
    if (g.boss.weakPointActive) {
      const glow = 0.3 + Math.sin(g.elapsedTime / 200) * 0.2
      ctx.fillStyle = `rgba(0,255,255,${glow})`
      ctx.beginPath(); ctx.arc(g.boss.x, g.boss.y - bossDrawSize * 1.8, 14, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#00ffff'
      ctx.beginPath(); ctx.arc(g.boss.x, g.boss.y - bossDrawSize * 1.8, 7, 0, Math.PI * 2); ctx.fill()
    }

    // Draw players
    const charSize = 28
    g.players.forEach((p, i) => {
      if (!p.isAlive) return

      // Attack range for player 0
      if (i === 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.setLineDash([5, 5])
        ctx.beginPath(); ctx.arc(p.x, p.y, AUTO_ATTACK_RANGE, 0, Math.PI * 2); ctx.stroke()
        ctx.setLineDash([])
      }

      // Shield bubble
      if (p.shieldActive) {
        ctx.strokeStyle = `rgba(59,130,246,${0.35 + Math.sin(g.elapsedTime / 200) * 0.15})`; ctx.lineWidth = 2.5
        ctx.beginPath(); ctx.arc(p.x, p.y, charSize + 10, 0, Math.PI * 2); ctx.stroke()
        ctx.fillStyle = 'rgba(59,130,246,0.08)'; ctx.fill()
      }

      // Draw character
      drawCharacter(ctx, p, charSize, g.elapsedTime)

      // Label
      ctx.fillStyle = i === 0 ? '#fff' : '#999'
      ctx.font = `bold ${i === 0 ? 10 : 9}px sans-serif`; ctx.textAlign = 'center'
      ctx.fillText(i === 0 ? 'YOU' : `T-MATE ${i}`, p.x, p.y + charSize * 1.4)

      // HP bar
      const hpW = 38, hpH = 5
      const hpX = p.x - hpW / 2, hpY = p.y - charSize * 1.3
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(hpX, hpY, hpW, hpH, 2); ctx.fill()
      const hpPct = p.hp / p.maxHP
      ctx.fillStyle = hpPct > 0.5 ? '#4ade80' : hpPct > 0.25 ? '#f59e0b' : '#e63946'
      ctx.beginPath(); ctx.roundRect(hpX, hpY, hpW * hpPct, hpH, 2); ctx.fill()
    })

    // Particles
    particlesRef.current.forEach(p => { ctx.globalAlpha = p.opacity; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill() })
    ctx.globalAlpha = 1

    // Damage numbers
    damageNumbersRef.current.forEach(d => {
      ctx.globalAlpha = d.opacity
      ctx.font = `bold ${d.isCrit ? 18 : 14}px sans-serif`; ctx.textAlign = 'center'
      // Outline
      ctx.strokeStyle = 'rgba(0,0,0,0.7)'; ctx.lineWidth = 3; ctx.strokeText(d.amount, d.x, d.y)
      ctx.fillStyle = d.isPlayerDamage ? '#ff4444' : (d.isCrit ? '#ffd700' : '#fff')
      ctx.fillText(d.amount, d.x, d.y)
      if (d.isCrit) { ctx.fillStyle = '#ffd700'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('CRIT!', d.x, d.y - 16) }
    })
    ctx.globalAlpha = 1

    // Floating texts
    floatingTextsRef.current.forEach(t => {
      ctx.globalAlpha = t.opacity; ctx.font = `bold ${t.fontSize || 14}px sans-serif`; ctx.textAlign = 'center'
      ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 3; ctx.strokeText(t.text, t.x, t.y)
      ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y)
    })
    ctx.globalAlpha = 1

    ctx.restore()

    // Rage vignette
    if (g.boss.isEnraged) {
      const vg = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.6)
      vg.addColorStop(0, 'transparent'); vg.addColorStop(1, `rgba(230,57,70,${g.screenRedIntensity})`)
      ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h)
    }

    ctx.restore()
  }, [])

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const resize = () => { const p = canvas.parentElement; canvas.width = p.clientWidth; canvas.height = p.clientHeight }
    resize(); window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [showRotatePrompt])

  // Joystick touch handlers - directly on the joystick zone
  const handleJoystickTouchStart = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const touch = e.changedTouches[0]
    touchIdRef.current = touch.identifier
    joystickRef.current.active = true
    joystickRef.current.startX = touch.clientX
    joystickRef.current.startY = touch.clientY
    joystickRef.current.dx = 0
    joystickRef.current.dy = 0
    setJoystickVisual({ dx: 0, dy: 0, active: true })
  }, [])
  const handleJoystickTouchMove = useCallback((e) => {
    e.preventDefault()
    for (const touch of e.changedTouches) {
      if (touch.identifier === touchIdRef.current) {
        const dx = touch.clientX - joystickRef.current.startX
        const dy = touch.clientY - joystickRef.current.startY
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d > 0) {
          const c = Math.min(d, 50)
          const nx = (dx / d) * (c / 50)
          const ny = (dy / d) * (c / 50)
          joystickRef.current.dx = nx
          joystickRef.current.dy = ny
          setJoystickVisual({ dx: nx, dy: ny, active: true })
        }
      }
    }
  }, [])
  const handleJoystickTouchEnd = useCallback((e) => {
    for (const touch of e.changedTouches) {
      if (touch.identifier === touchIdRef.current) {
        joystickRef.current.active = false
        joystickRef.current.dx = 0
        joystickRef.current.dy = 0
        touchIdRef.current = null
        setJoystickVisual({ dx: 0, dy: 0, active: false })
      }
    }
  }, [])

  // Keyboard
  useEffect(() => {
    const keys = new Set()
    const kd = (e) => { keys.add(e.key.toLowerCase()); up(); if (e.key === ' ' || e.key === 'e') abilityPressedRef.current = true; if (e.key === 'q' || e.key === 'r') ultimatePressedRef.current = true }
    const ku = (e) => { keys.delete(e.key.toLowerCase()); up() }
    const up = () => {
      let dx = 0, dy = 0
      if (keys.has('w') || keys.has('arrowup')) dy -= 1; if (keys.has('s') || keys.has('arrowdown')) dy += 1
      if (keys.has('a') || keys.has('arrowleft')) dx -= 1; if (keys.has('d') || keys.has('arrowright')) dx += 1
      if (dx || dy) { const d = Math.sqrt(dx * dx + dy * dy); joystickRef.current.active = true; joystickRef.current.dx = dx / d; joystickRef.current.dy = dy / d }
      else { joystickRef.current.active = false; joystickRef.current.dx = 0; joystickRef.current.dy = 0 }
    }
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku)
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku) }
  }, [])

  // ======================== ROTATE PROMPT ========================
  if (showRotatePrompt) {
    return (
      <div style={{
        height: '100vh', width: '100vw', position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px',
        color: '#fff',
      }}>
        {/* Phone rotation animation */}
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <div style={{
            width: '60px', height: '100px', border: '3px solid #8b5cf6',
            borderRadius: '12px', position: 'absolute', top: '10px', left: '30px',
            animation: 'rotatePhone 2s ease-in-out infinite',
            transformOrigin: 'center center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: '30px', height: '60px', background: 'rgba(139,92,246,0.2)', borderRadius: '4px' }} />
          </div>
          {/* Rotation arrow */}
          <div style={{
            position: 'absolute', top: '0px', right: '10px',
            fontSize: '28px', color: '#f4a261',
            animation: 'rotateArrow 2s ease-in-out infinite',
          }}>↻</div>
        </div>

        <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '2px', textAlign: 'center' }}>
          ROTATE YOUR DEVICE
        </div>
        <div style={{ fontSize: '14px', color: '#888', textAlign: 'center', maxWidth: '280px', lineHeight: 1.5 }}>
          Boss Brawl plays best in landscape mode. Turn your phone sideways for the full arena experience!
        </div>

        <button onClick={() => setShowRotatePrompt(false)} style={{
          marginTop: '12px', padding: '12px 32px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)',
          color: '#888', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        }}>
          Continue anyway {rotateCountdown > 0 ? `(${rotateCountdown})` : ''}
        </button>

        <style>{`
          @keyframes rotatePhone {
            0%, 20% { transform: rotate(0deg); }
            50%, 70% { transform: rotate(-90deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes rotateArrow {
            0%, 20% { opacity: 1; transform: rotate(0deg); }
            50%, 70% { opacity: 0.3; transform: rotate(-90deg); }
            100% { opacity: 1; transform: rotate(0deg); }
          }
        `}</style>
      </div>
    )
  }

  // ======================== GAME HUD ========================
  const g = gameRef.current
  const timeRemaining = g ? Math.max(0, g.timeRemaining / 1000) : 180
  const minutes = Math.floor(timeRemaining / 60), seconds = Math.floor(timeRemaining % 60)
  const bossHP = g ? g.boss.hp : 10000, bossMaxHP = g ? g.boss.maxHP : 10000
  const rageMeter = g ? g.boss.rageMeter : 0
  const pe = g?.players[0]
  const abilityCd = pe ? Math.max(0, pe.abilityCooldown / pe.abilityMaxCooldown) : 0
  const ultReady = pe ? pe.ultimateMeter >= 100 : false
  const ultPct = pe ? pe.ultimateMeter : 0
  const playerRole = match?.players[0]?.role || 'attacker'
  const roleCfg = ROLE_CONFIGS[playerRole]
  const isEnraged = g?.boss?.isEnraged

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'fixed', inset: 0,
      background: '#080c14', overflow: 'hidden',
    }}>
      {/* HUD Top - landscape optimized */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '4px 12px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        {/* Left: Teammates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '2px' }}>
          {g?.players.map((p, i) => {
            const cfg = ROLE_CONFIGS[p.role]
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '2px 8px', borderRadius: '6px',
                background: i === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.3)',
                border: i === 0 ? `1px solid ${cfg.color}44` : '1px solid transparent',
                opacity: p.isAlive ? 1 : 0.35,
              }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '4px',
                  background: `${cfg.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '8px', border: `1px solid ${cfg.color}66`,
                }}>{cfg.icon}</div>
                <span style={{ fontSize: '9px', color: i === 0 ? '#fff' : '#888', fontWeight: i === 0 ? 700 : 500, width: '45px' }}>
                  {i === 0 ? 'YOU' : `T-MATE ${i}`}
                </span>
                <div style={{ width: '55px', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: cfg.color, width: `${(p.hp / p.maxHP) * 100}%`, borderRadius: '3px', transition: 'width 0.2s' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Center: Boss HP + Floor Info */}
        <div style={{ flex: 1, maxWidth: '360px', margin: '0 16px', paddingTop: '2px' }}>
          {/* Boss name and floor */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ fontSize: '9px', color: '#f4a261', fontWeight: 700, letterSpacing: '1px' }}>
              FLOOR {match?.bossFloor || 1}
            </span>
            <span style={{ fontSize: '10px', color: '#fff', fontWeight: 800 }}>
              {g?.bossConfig?.emoji} {g?.bossConfig?.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            {/* HP Bar segments */}
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{
                height: '16px', background: 'rgba(0,0,0,0.6)', borderRadius: '8px',
                border: '1.5px solid rgba(255,255,255,0.15)', overflow: 'hidden', position: 'relative',
              }}>
                <div style={{
                  height: '100%', borderRadius: '8px',
                  background: bossHP / bossMaxHP > 0.5 ? 'linear-gradient(90deg, #4ade80, #22c55e)' : bossHP / bossMaxHP > 0.25 ? 'linear-gradient(90deg, #f59e0b, #eab308)' : 'linear-gradient(90deg, #e63946, #dc2626)',
                  width: `${(bossHP / bossMaxHP) * 100}%`, transition: 'width 0.3s',
                }} />
                {/* Bar segment dividers */}
                {g?.boss && Array.from({ length: g.boss.hpBars - 1 }).map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute', top: 0, bottom: 0,
                    left: `${((i + 1) / g.boss.hpBars) * 100}%`,
                    width: '2px', background: 'rgba(0,0,0,0.8)',
                  }} />
                ))}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                  {bossHP.toLocaleString()} / {bossMaxHP.toLocaleString()} HP
                </div>
              </div>
              {/* Rage meter + HP bar count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <div style={{ flex: 1, height: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: isEnraged ? '#e63946' : 'linear-gradient(90deg, #f59e0b, #f97316)', width: `${rageMeter}%`, transition: 'width 0.3s', borderRadius: '2px' }} />
                </div>
                {/* Bar count indicators */}
                <div style={{ display: 'flex', gap: '2px' }}>
                  {g?.boss && Array.from({ length: g.boss.hpBars }).map((_, i) => (
                    <div key={i} style={{
                      width: '8px', height: '4px', borderRadius: '1px',
                      background: i < (g.boss.currentBar || 0)
                        ? (g.boss.colors?.horn || '#ffd700')
                        : 'rgba(255,255,255,0.1)',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Timer */}
        <div style={{
          padding: '3px 14px', borderRadius: '8px',
          background: timeRemaining < 30 ? 'rgba(230,57,70,0.25)' : 'rgba(0,0,0,0.4)',
          border: timeRemaining < 30 ? '1.5px solid #e63946' : '1.5px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ fontSize: '7px', color: '#888', textAlign: 'center', letterSpacing: '1px' }}>TIME</div>
          <div style={{
            fontSize: '20px', fontWeight: 900, textAlign: 'center',
            color: timeRemaining < 30 ? '#e63946' : '#fff', fontVariantNumeric: 'tabular-nums',
          }}>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</div>
        </div>
      </div>

      {/* Rage Banner */}
      {g?.rageBannerTimer > 0 && (
        <div style={{
          position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 20, textAlign: 'center', pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: '32px', fontWeight: 900, color: '#e63946',
            textShadow: '0 0 30px rgba(230,57,70,0.8), 0 2px 4px rgba(0,0,0,0.8)',
            letterSpacing: '4px', animation: 'rageFlash 0.3s ease-in-out infinite',
          }}>RAGE MODE ACTIVATED</div>
        </div>
      )}

      {/* Phase Transition Banner */}
      {g?.phaseBannerTimer > 0 && (
        <div style={{
          position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 20, textAlign: 'center', pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: '28px', fontWeight: 900, color: '#ffd700',
            textShadow: '0 0 30px rgba(255,215,0,0.8), 0 2px 4px rgba(0,0,0,0.8)',
            letterSpacing: '4px', animation: 'rageFlash 0.3s ease-in-out infinite',
          }}>{g.phaseBannerText}</div>
          <div style={{ fontSize: '12px', color: '#fff', marginTop: '4px', opacity: 0.8, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            Boss powers up!
          </div>
        </div>
      )}

      {/* Canvas */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* Joystick touch zone - bottom left */}
      <div
        onTouchStart={handleJoystickTouchStart}
        onTouchMove={handleJoystickTouchMove}
        onTouchEnd={handleJoystickTouchEnd}
        style={{
          position: 'absolute', bottom: 0, left: 0, zIndex: 15,
          width: '200px', height: '200px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          touchAction: 'none',
        }}
      >
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%',
          background: joystickVisual.active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
          border: joystickVisual.active ? '2px solid rgba(255,255,255,0.25)' : '2px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s, border 0.15s',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: joystickVisual.active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
            border: '2px solid rgba(255,255,255,0.35)',
            transform: `translate(${joystickVisual.dx * 25}px, ${joystickVisual.dy * 25}px)`,
            transition: joystickVisual.active ? 'none' : 'transform 0.15s',
          }} />
        </div>
      </div>

      {/* HUD Bottom - ability buttons right side */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        padding: '0 16px 10px',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>

        {/* Ability buttons */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', pointerEvents: 'auto' }}>
          {/* Auto-attack status */}
          {g?.players[0] && dist(g.players[0], g.boss) < AUTO_ATTACK_RANGE && (
            <div style={{
              position: 'absolute', bottom: '70px', right: '100px',
              fontSize: '9px', color: '#4ade80', fontWeight: 700,
              background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '6px',
            }}>AUTO-ATTACKING</div>
          )}

          {/* Ultimate */}
          <button onClick={() => { ultimatePressedRef.current = true }} style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: ultReady ? (isEnraged ? 'linear-gradient(135deg, #e63946, #b91c1c)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)') : 'rgba(255,255,255,0.04)',
            border: ultReady ? (isEnraged ? '2.5px solid #ff6666' : '2.5px solid #60a5fa') : '2.5px solid rgba(255,255,255,0.08)',
            cursor: ultReady ? 'pointer' : 'default',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            boxShadow: ultReady ? `0 0 16px ${isEnraged ? 'rgba(230,57,70,0.5)' : 'rgba(59,130,246,0.5)'}` : 'none',
          }}>
            {!ultReady && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${ultPct}%`, background: 'rgba(59,130,246,0.15)' }} />}
            <span style={{ fontSize: '16px', position: 'relative', zIndex: 1 }}>👑</span>
            {!ultReady && <span style={{ fontSize: '7px', color: '#888', position: 'relative', zIndex: 1 }}>{Math.floor(ultPct)}%</span>}
          </button>

          {/* Ability */}
          <button onClick={() => { abilityPressedRef.current = true }} style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: abilityCd <= 0 ? `linear-gradient(135deg, ${roleCfg.color}, ${roleCfg.color}bb)` : 'rgba(255,255,255,0.04)',
            border: abilityCd <= 0 ? `3px solid ${roleCfg.color}` : '3px solid rgba(255,255,255,0.1)',
            cursor: abilityCd <= 0 ? 'pointer' : 'default',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            boxShadow: abilityCd <= 0 ? `0 0 16px ${roleCfg.color}44` : 'none',
          }}>
            {abilityCd > 0 && <div style={{ position: 'absolute', inset: 0, background: `conic-gradient(transparent ${(1 - abilityCd) * 360}deg, rgba(0,0,0,0.6) ${(1 - abilityCd) * 360}deg)`, borderRadius: '50%' }} />}
            <span style={{ fontSize: '24px', position: 'relative', zIndex: 1 }}>{roleCfg.icon}</span>
            {abilityCd > 0 && <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', position: 'relative', zIndex: 1 }}>{Math.ceil(pe?.abilityCooldown / 1000)}s</span>}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes rageFlash { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
      `}</style>
    </div>
  )
}
