import { create } from 'zustand';

export interface HandData {
  id: number;
  position: { x: number; y: number };
  landmarks: any[];
  isRightHand: boolean;
  isPinching: boolean;
}

export type GamePhase = 'waiting' | 'countdown' | 'drawing' | 'finished';

export interface GameState {
  // Estados del juego
  gamePhase: GamePhase;
  timeLeft: number;
  countdownNumber: number;
  canDraw: boolean;
  selectedTime: number; // Tiempo seleccionado para dibujar
  
  // Datos de manos (mantenemos la lógica existente)
  hands: HandData[];
  activeHands: number;
  
  // Color fijo para el juego
  currentColor: string;
}

export interface GameActions {
  // Acciones del juego
  startGame: () => void;
  setGamePhase: (phase: GamePhase) => void;
  setTimeLeft: (time: number) => void;
  setCountdownNumber: (number: number) => void;
  setCanDraw: (canDraw: boolean) => void;
  setSelectedTime: (time: number) => void;
  
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
  hands: [],
  activeHands: 0,
  currentColor: '#000000', // Negro fijo para el juego
  
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
    hands: [],
    activeHands: 0
  }),
}));
