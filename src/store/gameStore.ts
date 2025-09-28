import { create } from 'zustand';

export interface HandData {
  id: number;
  position: { x: number; y: number };
  landmarks: any[];
  isRightHand: boolean;
  isPinching: boolean;
}

export interface Player {
  id: string;
  name: string;
  team: 'A' | 'B';
}

export interface Drawing {
  id: string;
  playerId: string;
  playerName: string;
  team: 'A' | 'B';
  round: number;
  imageData: string;
  timestamp: number;
}

export type GamePhase = 'waiting' | 'setup' | 'countdown' | 'drawing' | 'guessing' | 'finished' | 'roundFinished' | 'gameFinished';

export interface GameState {
  // Estados del juego
  gamePhase: GamePhase;
  timeLeft: number;
  countdownNumber: number;
  canDraw: boolean;
  selectedTime: number; // Tiempo seleccionado para dibujar
  
  // Sistema de jugadores y equipos
  players: Player[];
  teams: { A: Player[]; B: Player[] };
  currentPlayer: Player | null;
  currentRound: number;
  totalRounds: number;
  drawings: Drawing[];
  
  // Datos de manos (mantenemos la lógica existente)
  hands: HandData[];
  activeHands: number;
  
  // Color fijo para el juego
  currentColor: string;
  
  // Dibujo final guardado
  finalDrawing: string | null; // Data URL de la imagen
}

export interface GameActions {
  // Acciones del juego
  startGame: () => void;
  setGamePhase: (phase: GamePhase) => void;
  setTimeLeft: (time: number) => void;
  setCountdownNumber: (number: number) => void;
  setCanDraw: (canDraw: boolean) => void;
  setSelectedTime: (time: number) => void;
  saveFinalDrawing: (imageData: string) => void;
  
  // Acciones de jugadores y equipos
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  assignTeams: () => void;
  setCurrentPlayer: (player: Player | null) => void;
  nextPlayer: () => void;
  saveDrawing: (imageData: string) => void;
  setTotalRounds: (rounds: number) => void;
  
  // Acciones de manos (mantenemos las existentes)
  updateHands: (hands: HandData[]) => void;
  setActiveHands: (count: number) => void;
  
  // Reset del juego
  resetGame: () => void;
}

export const useGameStore = create<GameState & GameActions>((set) => ({
  // Estados iniciales
  gamePhase: 'waiting',
  timeLeft: 60,
  countdownNumber: 3,
  canDraw: false,
  selectedTime: 60, // Tiempo por defecto
  
  // Sistema de jugadores y equipos
  players: [],
  teams: { A: [], B: [] },
  currentPlayer: null,
  currentRound: 1,
  totalRounds: 1,
  drawings: [],
  
  hands: [],
  activeHands: 0,
  currentColor: '#000000', // Negro fijo para el juego
  finalDrawing: null, // Sin dibujo inicial
  
  // Acciones del juego
  startGame: () => set((state) => ({ 
    gamePhase: 'countdown', 
    countdownNumber: 3,
    timeLeft: state.selectedTime, // Usar el tiempo seleccionado
    canDraw: false 
  })),
  
  setGamePhase: (phase) => set({ gamePhase: phase }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setCountdownNumber: (number) => set({ countdownNumber: number }),
  setCanDraw: (canDraw) => set({ canDraw }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  saveFinalDrawing: (imageData) => set({ finalDrawing: imageData }),
  
  // Acciones de jugadores y equipos
  addPlayer: (name) => set((state) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: name.trim(),
      team: 'A' // Se asignará después
    };
    return { players: [...state.players, newPlayer] };
  }),
  
  removePlayer: (playerId) => set((state) => ({
    players: state.players.filter(p => p.id !== playerId)
  })),
  
  assignTeams: () => set((state) => {
    const shuffled = [...state.players].sort(() => Math.random() - 0.5);
    const midPoint = Math.ceil(shuffled.length / 2);
    
    const teamA = shuffled.slice(0, midPoint).map(p => ({ ...p, team: 'A' as const }));
    const teamB = shuffled.slice(midPoint).map(p => ({ ...p, team: 'B' as const }));
    
    return {
      players: [...teamA, ...teamB],
      teams: { A: teamA, B: teamB }
    };
  }),
  
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  
  nextPlayer: () => set((state) => {
    const allPlayers = [...state.teams.A, ...state.teams.B];
    const currentIndex = state.currentPlayer 
      ? allPlayers.findIndex(p => p.id === state.currentPlayer!.id)
      : -1;
    
    const nextIndex = (currentIndex + 1) % allPlayers.length;
    const nextPlayer = allPlayers[nextIndex];
    
    return { 
      currentPlayer: nextPlayer
    };
  }),
  
  saveDrawing: (imageData) => set((state) => {
    if (!state.currentPlayer) return state;
    
    const newDrawing: Drawing = {
      id: Date.now().toString(),
      playerId: state.currentPlayer.id,
      playerName: state.currentPlayer.name,
      team: state.currentPlayer.team,
      round: state.currentRound,
      imageData,
      timestamp: Date.now()
    };
    
    const updatedDrawings = [...state.drawings, newDrawing];
    
    // Verificar si hemos completado todas las rondas
    const allPlayers = [...state.teams.A, ...state.teams.B];
    const totalDrawingsExpected = allPlayers.length * state.totalRounds;
    const isGameComplete = updatedDrawings.length >= totalDrawingsExpected;
    
    return { 
      drawings: updatedDrawings,
      gamePhase: isGameComplete ? 'gameFinished' : state.gamePhase
    };
  }),
  
  setTotalRounds: (rounds) => set({ totalRounds: rounds }),
  
  // Acciones de manos
  updateHands: (hands) => set({ hands }),
  setActiveHands: (count) => set({ activeHands: count }),
  
  // Reset
  resetGame: () => set({ 
    gamePhase: 'waiting',
    timeLeft: 60,
    countdownNumber: 3,
    canDraw: false,
    selectedTime: 60,
    players: [],
    teams: { A: [], B: [] },
    currentPlayer: null,
    currentRound: 1,
    totalRounds: 1,
    drawings: [],
    hands: [],
    activeHands: 0,
    finalDrawing: null
  }),
}));
