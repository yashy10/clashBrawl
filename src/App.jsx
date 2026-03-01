import { GameProvider, useGame } from './GameContext'
import HomeScreen from './screens/HomeScreen'
import RoleSelectScreen from './screens/RoleSelectScreen'
import MatchmakingScreen from './screens/MatchmakingScreen'
import GameplayScreen from './screens/GameplayScreen'
import VictoryScreen from './screens/VictoryScreen'
import DefeatScreen from './screens/DefeatScreen'
import UpgradeScreen from './screens/UpgradeScreen'
import ChestScreen from './screens/ChestScreen'

// Screen transition wrapper for smooth animations
function ScreenTransition({ children, screenKey }) {
  return (
    <div 
      key={screenKey}
      style={{
        width: '100%',
        height: '100%',
        animation: 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  )
}

function GameRouter() {
  const { state } = useGame()

  const screens = {
    home: HomeScreen,
    roleselect: RoleSelectScreen,
    matchmaking: MatchmakingScreen,
    gameplay: GameplayScreen,
    victory: VictoryScreen,
    defeat: DefeatScreen,
    upgrade: UpgradeScreen,
    chest: ChestScreen,
  }

  const Screen = screens[state.screen] || HomeScreen
  const isFullscreen = state.screen === 'gameplay'

  return (
    <div style={{
      width: '100%', 
      height: '100%',
      maxWidth: isFullscreen ? 'none' : '480px',
      margin: '0 auto',
      position: 'relative', 
      overflow: 'hidden',
      background: '#0a0c14',
      boxShadow: isFullscreen ? 'none' : '0 0 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
    }}>
      <ScreenTransition screenKey={state.screen}>
        <Screen />
      </ScreenTransition>
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  )
}
