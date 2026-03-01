import { createContext, useContext, useReducer, useCallback } from 'react'

const GameContext = createContext()

const ROLE_CONFIGS = {
  attacker: {
    name: 'Attacker', color: '#e63946', icon: '⚔️',
    maxHP: 100, baseDamage: 25, ability: 'Dash', abilityCooldown: 8,
    desc: 'Deals massive damage to enemies',
    tiers: ['Slash', 'Cross Slash', 'Blade Storm'],
    tierDamageBonus: [0, 0.25, 0.5],
    tierCooldownReduction: [0, 2, 3],
  },
  tank: {
    name: 'Tank', color: '#3b82f6', icon: '🛡️',
    maxHP: 200, baseDamage: 10, ability: 'Shield', abilityCooldown: 10,
    desc: 'Protects allies and absorbs damage',
    tiers: ['Shield', 'Fortress', 'Unbreakable Wall'],
    tierDamageBonus: [0, 0.25, 0.5],
    tierCooldownReduction: [0, 2, 3],
  },
  support: {
    name: 'Support', color: '#10b981', icon: '💚',
    maxHP: 80, baseDamage: 8, ability: 'Heal', abilityCooldown: 12,
    desc: 'Heals team and boosts abilities',
    tiers: ['Heal', 'Rejuvenate', 'Divine Light'],
    tierDamageBonus: [0, 0.25, 0.5],
    tierCooldownReduction: [0, 2, 3],
  },
}

const RANK_TIERS = [
  { name: 'Bronze', min: 0, max: 999, color: '#cd7f32' },
  { name: 'Silver', min: 1000, max: 2499, color: '#c0c0c0' },
  { name: 'Gold', min: 2500, max: 4999, color: '#ffd700' },
  { name: 'Diamond', min: 5000, max: Infinity, color: '#b9f2ff' },
]

const TIER_COSTS = [0, 300, 500]

// ======================== BOSS CONFIGS (20 Floors - SAO Aincrad Style) ========================

const BOSS_CONFIGS = [
  {
    floor: 1, name: 'Kobold Sentinel', title: 'Guardian of the First Floor', emoji: '🐗',
    colors: { body: '#8b6914', bodyEnraged: '#6b4f10', accent: '#d4a24e', eyes: '#ff6600', horn: '#a07828', arena: '#1a1508' },
    hpBars: 2, hpPerBar: 1500, damageMultiplier: 0.5, speedMultiplier: 0.6, attackSpeedMultiplier: 0.6,
    phases: [
      { attacks: { slam: 3, charge: 1, aoe: 0 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 2, charge: 2, aoe: 1 }, speedBoost: 1.2, damageBoost: 1.2 },
    ],
    timeLimit: 180, xpReward: 200, rankReward: 15, tokenBonus: 50,
  },
  {
    floor: 2, name: 'Frostfang', title: 'The Ice Howler', emoji: '🐺',
    colors: { body: '#1e6091', bodyEnraged: '#14405e', accent: '#7dd3fc', eyes: '#38bdf8', horn: '#0ea5e9', arena: '#0c1a2e' },
    hpBars: 2, hpPerBar: 1800, damageMultiplier: 0.55, speedMultiplier: 0.75, attackSpeedMultiplier: 0.65,
    phases: [
      { attacks: { slam: 1, charge: 3, aoe: 1 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 1, charge: 2, aoe: 2 }, speedBoost: 1.3, damageBoost: 1.15 },
    ],
    timeLimit: 180, xpReward: 225, rankReward: 17, tokenBonus: 60,
  },
  {
    floor: 3, name: 'Cindermaw', title: 'Flame of the Third Floor', emoji: '🔥',
    colors: { body: '#9a3412', bodyEnraged: '#7c2d12', accent: '#fb923c', eyes: '#fbbf24', horn: '#ea580c', arena: '#1a0f08' },
    hpBars: 2, hpPerBar: 2000, damageMultiplier: 0.6, speedMultiplier: 0.65, attackSpeedMultiplier: 0.7,
    phases: [
      { attacks: { slam: 1, charge: 1, aoe: 3 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 1, charge: 1, aoe: 3 }, speedBoost: 1.1, damageBoost: 1.3 },
    ],
    timeLimit: 180, xpReward: 250, rankReward: 19, tokenBonus: 70,
  },
  {
    floor: 4, name: 'Stonehide Golem', title: 'The Unbreaking', emoji: '🗿',
    colors: { body: '#57534e', bodyEnraged: '#44403c', accent: '#a8a29e', eyes: '#fbbf24', horn: '#78716c', arena: '#141311' },
    hpBars: 2, hpPerBar: 2800, damageMultiplier: 0.65, speedMultiplier: 0.45, attackSpeedMultiplier: 0.5,
    phases: [
      { attacks: { slam: 3, charge: 1, aoe: 1 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 2, charge: 2, aoe: 2 }, speedBoost: 1.1, damageBoost: 1.25 },
    ],
    timeLimit: 200, xpReward: 275, rankReward: 21, tokenBonus: 80,
  },
  {
    floor: 5, name: 'Nepenthes', title: 'The Devouring Bloom', emoji: '🌿',
    colors: { body: '#166534', bodyEnraged: '#14532d', accent: '#4ade80', eyes: '#a3e635', horn: '#22c55e', arena: '#0a1a0d' },
    hpBars: 3, hpPerBar: 2000, damageMultiplier: 0.7, speedMultiplier: 0.7, attackSpeedMultiplier: 0.75,
    phases: [
      { attacks: { slam: 1, charge: 2, aoe: 2 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 1, charge: 1, aoe: 3 }, speedBoost: 1.15, damageBoost: 1.15 },
      { attacks: { slam: 2, charge: 2, aoe: 3 }, speedBoost: 1.3, damageBoost: 1.3 },
    ],
    timeLimit: 200, xpReward: 300, rankReward: 24, tokenBonus: 100,
  },
  {
    floor: 6, name: 'Wraithclaw', title: 'Shadow of the Sixth', emoji: '👻',
    colors: { body: '#581c87', bodyEnraged: '#3b0764', accent: '#c084fc', eyes: '#e879f9', horn: '#a855f7', arena: '#0f0520' },
    hpBars: 3, hpPerBar: 2200, damageMultiplier: 0.75, speedMultiplier: 0.85, attackSpeedMultiplier: 0.9,
    phases: [
      { attacks: { slam: 2, charge: 2, aoe: 1 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 1, charge: 3, aoe: 2 }, speedBoost: 1.2, damageBoost: 1.1 },
      { attacks: { slam: 2, charge: 2, aoe: 3 }, speedBoost: 1.4, damageBoost: 1.3 },
    ],
    timeLimit: 200, xpReward: 325, rankReward: 26, tokenBonus: 110,
  },
  {
    floor: 7, name: 'Asterios', title: 'The Taurus King', emoji: '🐂',
    colors: { body: '#7f1d1d', bodyEnraged: '#650a0a', accent: '#dc2626', eyes: '#fbbf24', horn: '#b91c1c', arena: '#1a0a0a' },
    hpBars: 3, hpPerBar: 2500, damageMultiplier: 0.85, speedMultiplier: 0.7, attackSpeedMultiplier: 0.75,
    phases: [
      { attacks: { slam: 3, charge: 3, aoe: 1 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 2, charge: 3, aoe: 2 }, speedBoost: 1.15, damageBoost: 1.2 },
      { attacks: { slam: 3, charge: 2, aoe: 3 }, speedBoost: 1.3, damageBoost: 1.4 },
    ],
    timeLimit: 210, xpReward: 350, rankReward: 28, tokenBonus: 120,
  },
  {
    floor: 8, name: 'Crystalweaver', title: 'The Gleaming Arachnid', emoji: '🕷️',
    colors: { body: '#155e75', bodyEnraged: '#0e4a5e', accent: '#67e8f9', eyes: '#22d3ee', horn: '#06b6d4', arena: '#081a20' },
    hpBars: 3, hpPerBar: 2600, damageMultiplier: 0.8, speedMultiplier: 0.8, attackSpeedMultiplier: 0.85,
    phases: [
      { attacks: { slam: 1, charge: 1, aoe: 3 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 2, charge: 2, aoe: 3 }, speedBoost: 1.2, damageBoost: 1.2 },
      { attacks: { slam: 1, charge: 2, aoe: 4 }, speedBoost: 1.35, damageBoost: 1.35 },
    ],
    timeLimit: 210, xpReward: 375, rankReward: 30, tokenBonus: 130,
  },
  {
    floor: 9, name: 'Kagachi', title: 'The Serpent Lord', emoji: '🐉',
    colors: { body: '#14532d', bodyEnraged: '#052e16', accent: '#86efac', eyes: '#fbbf24', horn: '#16a34a', arena: '#081208' },
    hpBars: 3, hpPerBar: 2800, damageMultiplier: 0.9, speedMultiplier: 0.9, attackSpeedMultiplier: 0.9,
    phases: [
      { attacks: { slam: 1, charge: 3, aoe: 2 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 2, charge: 3, aoe: 2 }, speedBoost: 1.25, damageBoost: 1.2 },
      { attacks: { slam: 2, charge: 2, aoe: 3 }, speedBoost: 1.4, damageBoost: 1.4 },
    ],
    timeLimit: 220, xpReward: 400, rankReward: 33, tokenBonus: 150,
  },
  {
    floor: 10, name: 'Illfang', title: 'The Kobold Lord', emoji: '👹',
    colors: { body: '#991b1b', bodyEnraged: '#7f1d1d', accent: '#fca5a5', eyes: '#fbbf24', horn: '#ef4444', arena: '#1a0808' },
    hpBars: 4, hpPerBar: 2500, damageMultiplier: 1.0, speedMultiplier: 0.85, attackSpeedMultiplier: 0.9,
    phases: [
      { attacks: { slam: 2, charge: 2, aoe: 2 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 3, charge: 2, aoe: 2 }, speedBoost: 1.1, damageBoost: 1.1 },
      { attacks: { slam: 2, charge: 3, aoe: 3 }, speedBoost: 1.25, damageBoost: 1.25 },
      { attacks: { slam: 3, charge: 3, aoe: 3 }, speedBoost: 1.4, damageBoost: 1.5 },
    ],
    timeLimit: 240, xpReward: 450, rankReward: 36, tokenBonus: 200,
  },
  {
    floor: 11, name: 'Thundermaw', title: 'Warden of Storms', emoji: '⚡',
    colors: { body: '#854d0e', bodyEnraged: '#713f12', accent: '#fde047', eyes: '#facc15', horn: '#eab308', arena: '#1a1505' },
    hpBars: 4, hpPerBar: 2700, damageMultiplier: 1.05, speedMultiplier: 0.95, attackSpeedMultiplier: 1.05,
    phases: [
      { attacks: { slam: 2, charge: 3, aoe: 1 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 2, charge: 2, aoe: 3 }, speedBoost: 1.15, damageBoost: 1.15 },
      { attacks: { slam: 3, charge: 3, aoe: 2 }, speedBoost: 1.3, damageBoost: 1.3 },
      { attacks: { slam: 2, charge: 3, aoe: 3 }, speedBoost: 1.5, damageBoost: 1.45 },
    ],
    timeLimit: 240, xpReward: 475, rankReward: 38, tokenBonus: 220,
  },
  {
    floor: 12, name: 'Nosferatu', title: 'The Blood Sovereign', emoji: '🧛',
    colors: { body: '#450a0a', bodyEnraged: '#300808', accent: '#f87171', eyes: '#dc2626', horn: '#b91c1c', arena: '#150505' },
    hpBars: 4, hpPerBar: 2900, damageMultiplier: 1.1, speedMultiplier: 0.9, attackSpeedMultiplier: 1.0,
    phases: [
      { attacks: { slam: 2, charge: 2, aoe: 2 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 3, charge: 2, aoe: 2 }, speedBoost: 1.15, damageBoost: 1.2 },
      { attacks: { slam: 2, charge: 3, aoe: 3 }, speedBoost: 1.3, damageBoost: 1.35 },
      { attacks: { slam: 3, charge: 3, aoe: 3 }, speedBoost: 1.45, damageBoost: 1.5 },
    ],
    timeLimit: 250, xpReward: 500, rankReward: 40, tokenBonus: 240,
  },
  {
    floor: 13, name: 'Hydra Rex', title: 'The Many-Headed', emoji: '🐍',
    colors: { body: '#115e59', bodyEnraged: '#0d4f4a', accent: '#5eead4', eyes: '#2dd4bf', horn: '#14b8a6', arena: '#081515' },
    hpBars: 4, hpPerBar: 3000, damageMultiplier: 1.15, speedMultiplier: 0.85, attackSpeedMultiplier: 1.1,
    phases: [
      { attacks: { slam: 1, charge: 1, aoe: 4 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 1, charge: 2, aoe: 4 }, speedBoost: 1.1, damageBoost: 1.2 },
      { attacks: { slam: 2, charge: 2, aoe: 4 }, speedBoost: 1.25, damageBoost: 1.35 },
      { attacks: { slam: 2, charge: 3, aoe: 4 }, speedBoost: 1.4, damageBoost: 1.5 },
    ],
    timeLimit: 250, xpReward: 525, rankReward: 42, tokenBonus: 260,
  },
  {
    floor: 14, name: 'Grimcleaver', title: 'The Bone Tyrant', emoji: '💀',
    colors: { body: '#1c1917', bodyEnraged: '#0c0a09', accent: '#d6d3d1', eyes: '#fbbf24', horn: '#a8a29e', arena: '#0f0e0d' },
    hpBars: 4, hpPerBar: 3200, damageMultiplier: 1.25, speedMultiplier: 0.8, attackSpeedMultiplier: 0.95,
    phases: [
      { attacks: { slam: 4, charge: 1, aoe: 1 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 3, charge: 2, aoe: 2 }, speedBoost: 1.1, damageBoost: 1.2 },
      { attacks: { slam: 3, charge: 3, aoe: 2 }, speedBoost: 1.25, damageBoost: 1.4 },
      { attacks: { slam: 4, charge: 2, aoe: 3 }, speedBoost: 1.35, damageBoost: 1.55 },
    ],
    timeLimit: 260, xpReward: 550, rankReward: 44, tokenBonus: 280,
  },
  {
    floor: 15, name: 'Magmacore', title: 'Heart of the Volcano', emoji: '🌋',
    colors: { body: '#7c2d12', bodyEnraged: '#601f0e', accent: '#fdba74', eyes: '#f97316', horn: '#ea580c', arena: '#1a0e05' },
    hpBars: 4, hpPerBar: 3400, damageMultiplier: 1.3, speedMultiplier: 0.85, attackSpeedMultiplier: 1.1,
    phases: [
      { attacks: { slam: 2, charge: 1, aoe: 3 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 2, charge: 2, aoe: 3 }, speedBoost: 1.15, damageBoost: 1.25 },
      { attacks: { slam: 3, charge: 2, aoe: 4 }, speedBoost: 1.3, damageBoost: 1.4 },
      { attacks: { slam: 3, charge: 3, aoe: 4 }, speedBoost: 1.45, damageBoost: 1.6 },
    ],
    timeLimit: 260, xpReward: 575, rankReward: 46, tokenBonus: 300,
  },
  {
    floor: 16, name: 'Frostlich', title: 'The Frozen Throne', emoji: '❄️',
    colors: { body: '#e0f2fe', bodyEnraged: '#bae6fd', accent: '#38bdf8', eyes: '#0ea5e9', horn: '#7dd3fc', arena: '#0a1520' },
    hpBars: 4, hpPerBar: 3600, damageMultiplier: 1.35, speedMultiplier: 0.95, attackSpeedMultiplier: 1.2,
    phases: [
      { attacks: { slam: 2, charge: 2, aoe: 2 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 2, charge: 3, aoe: 3 }, speedBoost: 1.2, damageBoost: 1.2 },
      { attacks: { slam: 3, charge: 3, aoe: 3 }, speedBoost: 1.35, damageBoost: 1.4 },
      { attacks: { slam: 3, charge: 3, aoe: 4 }, speedBoost: 1.5, damageBoost: 1.6 },
    ],
    timeLimit: 270, xpReward: 600, rankReward: 48, tokenBonus: 320,
  },
  {
    floor: 17, name: 'Voidreaver', title: 'The Abyss Knight', emoji: '🌑',
    colors: { body: '#312e81', bodyEnraged: '#1e1b4b', accent: '#a78bfa', eyes: '#c084fc', horn: '#7c3aed', arena: '#08061a' },
    hpBars: 5, hpPerBar: 3200, damageMultiplier: 1.4, speedMultiplier: 1.0, attackSpeedMultiplier: 1.2,
    phases: [
      { attacks: { slam: 2, charge: 2, aoe: 2 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 2, charge: 3, aoe: 2 }, speedBoost: 1.1, damageBoost: 1.15 },
      { attacks: { slam: 3, charge: 2, aoe: 3 }, speedBoost: 1.25, damageBoost: 1.3 },
      { attacks: { slam: 3, charge: 3, aoe: 3 }, speedBoost: 1.4, damageBoost: 1.5 },
      { attacks: { slam: 3, charge: 3, aoe: 4 }, speedBoost: 1.55, damageBoost: 1.7 },
    ],
    timeLimit: 280, xpReward: 650, rankReward: 50, tokenBonus: 350,
  },
  {
    floor: 18, name: 'Chaosknight', title: 'Herald of Ruin', emoji: '🔮',
    colors: { body: '#831843', bodyEnraged: '#6b1235', accent: '#f472b6', eyes: '#ec4899', horn: '#db2777', arena: '#1a0510' },
    hpBars: 5, hpPerBar: 3400, damageMultiplier: 1.5, speedMultiplier: 1.05, attackSpeedMultiplier: 1.3,
    phases: [
      { attacks: { slam: 3, charge: 1, aoe: 1 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 1, charge: 3, aoe: 1 }, speedBoost: 1.15, damageBoost: 1.2 },
      { attacks: { slam: 1, charge: 1, aoe: 3 }, speedBoost: 1.3, damageBoost: 1.35 },
      { attacks: { slam: 3, charge: 3, aoe: 1 }, speedBoost: 1.45, damageBoost: 1.55 },
      { attacks: { slam: 2, charge: 2, aoe: 4 }, speedBoost: 1.6, damageBoost: 1.75 },
    ],
    timeLimit: 280, xpReward: 700, rankReward: 53, tokenBonus: 380,
  },
  {
    floor: 19, name: 'Shadowdrake', title: 'The Ancient Wyrm', emoji: '🐲',
    colors: { body: '#1a1a1a', bodyEnraged: '#111111', accent: '#fbbf24', eyes: '#f59e0b', horn: '#d97706', arena: '#0a0a05' },
    hpBars: 5, hpPerBar: 3600, damageMultiplier: 1.6, speedMultiplier: 1.1, attackSpeedMultiplier: 1.35,
    phases: [
      { attacks: { slam: 2, charge: 3, aoe: 2 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 2, charge: 3, aoe: 3 }, speedBoost: 1.15, damageBoost: 1.2 },
      { attacks: { slam: 3, charge: 3, aoe: 3 }, speedBoost: 1.3, damageBoost: 1.4 },
      { attacks: { slam: 3, charge: 3, aoe: 4 }, speedBoost: 1.5, damageBoost: 1.6 },
      { attacks: { slam: 4, charge: 3, aoe: 4 }, speedBoost: 1.65, damageBoost: 1.8 },
    ],
    timeLimit: 290, xpReward: 750, rankReward: 56, tokenBonus: 420,
  },
  {
    floor: 20, name: 'Heathcliff', title: 'The Final Guardian', emoji: '⚜️',
    colors: { body: '#fefce8', bodyEnraged: '#fef08a', accent: '#fbbf24', eyes: '#dc2626', horn: '#ffd700', arena: '#1a1810' },
    hpBars: 5, hpPerBar: 4000, damageMultiplier: 1.8, speedMultiplier: 1.2, attackSpeedMultiplier: 1.5,
    phases: [
      { attacks: { slam: 2, charge: 2, aoe: 2 }, speedBoost: 1.0, damageBoost: 1.0 },
      { attacks: { slam: 3, charge: 3, aoe: 2 }, speedBoost: 1.15, damageBoost: 1.2 },
      { attacks: { slam: 3, charge: 3, aoe: 3 }, speedBoost: 1.3, damageBoost: 1.4 },
      { attacks: { slam: 3, charge: 3, aoe: 4 }, speedBoost: 1.5, damageBoost: 1.65 },
      { attacks: { slam: 4, charge: 4, aoe: 4 }, speedBoost: 1.7, damageBoost: 2.0 },
    ],
    timeLimit: 300, xpReward: 800, rankReward: 60, tokenBonus: 500,
  },
]

function getBossConfig(floor) {
  const clamped = Math.max(1, Math.min(20, floor))
  return BOSS_CONFIGS[clamped - 1]
}

function getRankTier(points) {
  return RANK_TIERS.find(t => points >= t.min && points <= t.max) || RANK_TIERS[0]
}

function getLevel(xp) {
  return Math.floor(xp / 1000) + 1
}

const initialState = {
  screen: 'home',
  player: {
    name: 'PlayerName',
    xp: 4500,
    rankPoints: 4250,
    bossFloor: 1,
    selectedRole: null,
    tokenBalance: 1500,
    upgradeCores: 3,
    upgrades: { attacker: 0, tank: 0, support: 0 },
    lifetimeStats: {
      attacker: { damage: 0, crit: 0, score: 0, gamesPlayed: 0 },
      tank: { heal: 0, block: 0, aggro: 0, score: 0, gamesPlayed: 0 },
      support: { heal: 0, buff: 0, score: 0, gamesPlayed: 0 },
    },
  },
  boss: {
    name: BOSS_CONFIGS[0].name,
    title: BOSS_CONFIGS[0].title,
    emoji: BOSS_CONFIGS[0].emoji,
    isActive: true,
  },
  match: null,
  matchResult: null,
  chestReward: null,
  matchmaking: null,
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen }

    case 'SELECT_ROLE':
      return { ...state, player: { ...state.player, selectedRole: action.role } }

    case 'START_MATCHMAKING':
      return {
        ...state,
        screen: 'matchmaking',
        matchmaking: { slots: [{ role: state.player.selectedRole, isBot: false, ready: true }], timer: 25, searching: true },
      }

    case 'UPDATE_MATCHMAKING':
      return { ...state, matchmaking: { ...state.matchmaking, ...action.data } }

    case 'START_MATCH':
      return { ...state, screen: 'gameplay', match: action.match, matchResult: null }

    case 'END_MATCH':
      return { ...state, matchResult: action.result, screen: action.result.victory ? 'victory' : 'defeat' }

    case 'OPEN_CHEST': {
      const score = action.score || 5000
      const bossFloor = state.player.bossFloor
      const levelScale = 1 + (bossFloor - 1) * 0.12
      let rarity = 'common'
      if (score >= 8000) rarity = 'epic'
      else if (score >= 5000) rarity = 'rare'

      const ranges = {
        common: { tokens: [150, 200], xp: [300, 400] },
        rare: { tokens: [200, 300], xp: [400, 600] },
        epic: { tokens: [300, 500], xp: [600, 1000] },
      }
      const r = ranges[rarity]
      const tokens = Math.floor((Math.random() * (r.tokens[1] - r.tokens[0]) + r.tokens[0]) * levelScale)
      const xp = Math.floor((Math.random() * (r.xp[1] - r.xp[0]) + r.xp[0]) * levelScale)

      return { ...state, screen: 'chest', chestReward: { tokens, upgradeCores: 1, xp, rarity } }
    }

    case 'COLLECT_REWARDS': {
      if (!state.chestReward) return state
      const r = state.chestReward
      return {
        ...state,
        screen: 'home',
        player: {
          ...state.player,
          xp: state.player.xp + r.xp,
          tokenBalance: state.player.tokenBalance + r.tokens,
          upgradeCores: state.player.upgradeCores + r.upgradeCores,
        },
        chestReward: null,
      }
    }

    case 'ADVANCE_FLOOR': {
      const nextFloor = Math.min(20, state.player.bossFloor + 1)
      const nextBoss = getBossConfig(nextFloor)
      return {
        ...state,
        player: { ...state.player, bossFloor: nextFloor },
        boss: { ...state.boss, name: nextBoss.name, title: nextBoss.title, emoji: nextBoss.emoji },
      }
    }

    case 'UPGRADE_ROLE': {
      const role = action.role
      const currentTier = state.player.upgrades[role]
      if (currentTier >= 2) return state
      const cost = TIER_COSTS[currentTier + 1]
      if (state.player.tokenBalance < cost) return state
      return {
        ...state,
        player: {
          ...state.player,
          tokenBalance: state.player.tokenBalance - cost,
          upgrades: { ...state.player.upgrades, [role]: currentTier + 1 },
        },
      }
    }

    case 'ADD_XP':
      return { ...state, player: { ...state.player, xp: state.player.xp + action.amount } }

    case 'ADD_RANK_POINTS':
      return { ...state, player: { ...state.player, rankPoints: Math.max(0, state.player.rankPoints + action.amount) } }

    case 'UPDATE_LIFETIME_STATS': {
      const { role, stats } = action
      const current = state.player.lifetimeStats[role]
      const updated = {}
      for (const key of Object.keys(current)) {
        updated[key] = (current[key] || 0) + (stats[key] || 0)
      }
      return {
        ...state,
        player: {
          ...state.player,
          lifetimeStats: { ...state.player.lifetimeStats, [role]: updated },
        },
      }
    }

    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}

export { ROLE_CONFIGS, RANK_TIERS, TIER_COSTS, BOSS_CONFIGS, getRankTier, getLevel, getBossConfig }
