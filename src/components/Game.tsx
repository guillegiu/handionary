import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import Camera from './Camera';
import Canvas from './Canvas';

const Game = () => {
  const { 
    gamePhase, 
    timeLeft, 
    countdownNumber, 
    canDraw,
    selectedTime,
    setGamePhase, 
    setTimeLeft, 
    setCountdownNumber, 
    setCanDraw,
    resetGame 
  } = useGameStore();

  const [localCountdown, setLocalCountdown] = useState(3);
  const [localTimeLeft, setLocalTimeLeft] = useState(selectedTime);

  // Efecto para manejar el countdown de 3-2-1
  useEffect(() => {
    if (gamePhase === 'countdown') {
      console.log('Iniciando countdown');
      setLocalCountdown(3);
      
      const interval = setInterval(() => {
        setLocalCountdown(prev => {
          console.log('Countdown actual:', prev);
          if (prev <= 1) {
            console.log('Terminando countdown, pasando a drawing');
            setGamePhase('drawing');
            setCanDraw(true);
            setLocalTimeLeft(selectedTime);
            return 3;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gamePhase, setGamePhase, setCanDraw, selectedTime]);

  // Efecto para manejar el timer de 60 segundos
  useEffect(() => {
    if (gamePhase === 'drawing') {
      console.log('Iniciando timer de dibujo');
      
      const interval = setInterval(() => {
        setLocalTimeLeft(prev => {
          console.log('Timer actual:', prev);
          if (prev <= 1) {
            console.log('Terminando juego, pasando a finished');
            setGamePhase('finished');
            setCanDraw(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gamePhase, setGamePhase, setCanDraw]);

  const handleReset = () => {
    resetGame();
  };

  const renderCountdown = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-800 mb-8 animate-pulse">
          {localCountdown}
        </div>
        <p className="text-2xl text-gray-600">
          {localCountdown === 3 ? '¡Prepárate!' : 
           localCountdown === 2 ? '¡Casi listo!' : 
           '¡A dibujar!'}
        </p>
      </div>
    </div>
  );

  const renderDrawing = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header con timer */}
      <div className="text-center mb-6">
        <div className="inline-block bg-white rounded-full px-8 py-4 shadow-lg border border-gray-200">
          <div className="text-4xl font-bold text-red-600 mb-2">
            {localTimeLeft}s
          </div>
          <div className="text-sm text-gray-600">
            Tiempo restante
          </div>
        </div>
      </div>

      {/* Layout principal */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cámara */}
          <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">📹 Vista de Cámara</h2>
            <Camera />
          </div>
          
          {/* Canvas */}
          <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
            <Canvas />
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Instrucciones</h3>
          <p className="text-gray-600">
            Haz pinza con el índice y pulgar para dibujar. ¡Tienes {localTimeLeft} segundos!
          </p>
        </div>
      </div>
    </div>
  );

  const renderFinished = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto p-6">
        <h1 className="text-5xl font-bold text-gray-800 mb-8">
          🎉 ¡Tiempo terminado!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Aquí está tu dibujo final. ¿Qué dibujaste?
        </p>
        
        {/* Mostrar el canvas final */}
        <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200 mb-8 inline-block">
          <Canvas />
        </div>
        
        <div className="space-x-4">
          <button
            onClick={handleReset}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
          >
            🔄 Jugar de nuevo
          </button>
        </div>
      </div>
    </div>
  );

  // Debug: mostrar el estado actual
  console.log('Game state:', { gamePhase, timeLeft, countdownNumber, canDraw });

  // Renderizar según la fase del juego
  switch (gamePhase) {
    case 'countdown':
      return renderCountdown();
    case 'drawing':
      return renderDrawing();
    case 'finished':
      return renderFinished();
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Estado: {gamePhase}
            </h1>
            <p className="text-xl text-gray-600">
              Esperando...
            </p>
          </div>
        </div>
      );
  }
};

export default Game;
