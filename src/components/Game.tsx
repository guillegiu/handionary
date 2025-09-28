import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useNavigate } from 'react-router-dom';
import Camera from './Camera';
import Canvas from './Canvas';

const Game = () => {
  const { 
    gamePhase, 
    canDraw,
    selectedTime,
    finalDrawing,
    currentPlayer,
    players,
    currentRound,
    totalRounds,
    setGamePhase, 
    setCanDraw,
    setCurrentPlayer,
    nextPlayer,
    saveDrawing
  } = useGameStore();
  const navigate = useNavigate();

  const [localCountdown, setLocalCountdown] = useState(3);
  const [localTimeLeft, setLocalTimeLeft] = useState(selectedTime);
  const countdownIntervalRef = useRef<number | null>(null);
  const gameIntervalRef = useRef<number | null>(null);

  // Actualizar localTimeLeft cuando cambie selectedTime
  useEffect(() => {
    console.log('selectedTime cambió a:', selectedTime);
    setLocalTimeLeft(selectedTime);
  }, [selectedTime]);

  // Inicializar el primer jugador cuando comience el juego
  useEffect(() => {
    if (gamePhase === 'countdown' && players.length > 0 && !currentPlayer) {
      console.log('Inicializando primer jugador:', players[0]);
      setCurrentPlayer(players[0]);
    }
  }, [gamePhase, players, currentPlayer, setCurrentPlayer]);

  // Navegar a la galería cuando el juego termine
  useEffect(() => {
    if (gamePhase === 'gameFinished') {
      console.log('Juego terminado, navegando a la galería...');
      // Pequeño delay para que se vea el último dibujo
      setTimeout(() => {
        navigate('/gallery');
      }, 2000);
    }
  }, [gamePhase, navigate]);

  // Efecto para manejar el countdown de 3-2-1
  useEffect(() => {
    if (gamePhase === 'countdown') {
      console.log('Iniciando countdown');
      setLocalCountdown(3);
      
      // Limpiar interval anterior si existe
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      
      countdownIntervalRef.current = setInterval(() => {
        setLocalCountdown(prev => {
          console.log('Countdown actual:', prev);
          if (prev <= 1) {
            console.log('Terminando countdown, pasando a drawing');
            // Usar setTimeout para evitar setState durante render
            setTimeout(() => {
              setGamePhase('drawing');
              setCanDraw(true);
              setLocalTimeLeft(selectedTime);
            }, 0);
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Limpiar interval si no estamos en countdown
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [gamePhase, selectedTime]);

  // Efecto para manejar el timer de dibujo
  useEffect(() => {
    if (gamePhase === 'drawing') {
      console.log('Iniciando timer de dibujo');
      
      // Limpiar interval anterior si existe
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
      
      gameIntervalRef.current = setInterval(() => {
        setLocalTimeLeft(prev => {
          console.log('Timer actual:', prev, 'de', selectedTime, 'segundos totales');
          if (prev <= 1) {
            console.log('Terminando juego, pasando a finished');
            // Primero deshabilitar el dibujo inmediatamente
            setCanDraw(false);
            // Luego cambiar la fase del juego
            setTimeout(() => {
              setGamePhase('finished');
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Limpiar interval si no estamos en drawing
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = null;
      }
    }

    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = null;
      }
    };
  }, [gamePhase]);

  const handleNextPlayer = () => {
    console.log('Avanzando al siguiente jugador...');
    
    // Guardar el dibujo actual si existe
    if (finalDrawing) {
      saveDrawing(finalDrawing);
    }
    
    // Avanzar al siguiente jugador
    nextPlayer();
    
    // Reiniciar el juego para el siguiente jugador
    setGamePhase('countdown');
    setLocalCountdown(3);
    setLocalTimeLeft(selectedTime);
    setCanDraw(false);
  };

  const renderCountdown = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {currentPlayer && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🎨 {currentPlayer.name}
            </h2>
            <p className="text-lg text-gray-600">
              Equipo {currentPlayer.team} - Ronda {currentRound} de {totalRounds}
            </p>
          </div>
        )}
        
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header con timer y jugador actual */}
      <div className="text-center mb-4">
        <div className="inline-block bg-white rounded-full px-8 py-4 shadow-lg border border-gray-200 mb-4">
          <div className="text-4xl font-bold text-red-600 mb-2">
            {localTimeLeft}s
          </div>
          <div className="text-sm text-gray-600">
            Tiempo restante
          </div>
        </div>
        
        {currentPlayer && (
          <div className="inline-block bg-white rounded-2xl px-6 py-4 shadow-lg border border-gray-200">
            <div className="text-xl font-bold text-gray-800 mb-1">
              🎨 Está dibujando: {currentPlayer.name}
            </div>
            <div className="text-sm text-gray-600">
              Equipo {currentPlayer.team} - Ronda {currentRound} de {totalRounds}
            </div>
          </div>
        )}
      </div>

      {/* Layout principal */}
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-4">
          {/* Columna izquierda: Cámara y estado */}
          <div className="w-80 flex-shrink-0 space-y-4">
            {/* Cámara pequeña */}
            <div className="bg-white rounded-lg p-3 shadow-lg border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800 mb-2 text-center">📹 Cámara</h2>
              <Camera />
            </div>
          </div>
          
          {/* Columna derecha: Canvas principal */}
          <div className="flex-1 bg-white rounded-lg p-4 shadow-lg border border-gray-200">
            <Canvas />
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Instrucciones</h3>
          <p className="text-gray-600">
            Haz pinza con el índice y pulgar para dibujar. ¡Tienes {localTimeLeft} segundos!
          </p>
        </div>
      </div>
    </div>
  );

  const renderFinished = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-6xl mx-auto p-6">
        <h1 className="text-5xl font-bold text-gray-800 mb-8">
          🎉 ¡Tiempo terminado!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Aquí está tu dibujo final. ¿Qué dibujaste?
        </p>
        
        {/* Mostrar el dibujo final guardado */}
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 mb-8">
          {currentPlayer && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                🎨 Dibujo de {currentPlayer.name}
              </h3>
              <p className="text-sm text-blue-600">
                Equipo {currentPlayer.team} - Ronda {currentRound} de {totalRounds}
              </p>
            </div>
          )}
          
          {finalDrawing ? (
            <div className="flex justify-center">
              <img 
                src={finalDrawing} 
                alt="Dibujo final" 
                className="max-w-full max-h-96 rounded-lg shadow-md"
                style={{ maxWidth: '800px', maxHeight: '600px' }}
                onLoad={() => console.log('Imagen cargada correctamente')}
                onError={(e) => console.error('Error cargando imagen:', e)}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center h-96 bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-gray-600 text-lg">No se detectó ningún dibujo</p>
                <p className="text-gray-500 text-sm">Intenta dibujar algo la próxima vez</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Botón para avanzar al siguiente jugador */}
        <div className="text-center">
          <button
            onClick={handleNextPlayer}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-semibold rounded-full shadow-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200"
          >
            ➡️ Siguiente Jugador
          </button>
        </div>
      </div>
    </div>
  );

  // Debug: mostrar el estado actual
  console.log('Game state:', { 
    gamePhase, 
    canDraw, 
    finalDrawing: finalDrawing ? `Presente (${finalDrawing.length} chars)` : 'Ausente',
    finalDrawingType: typeof finalDrawing
  });

  // Renderizar según la fase del juego
  switch (gamePhase) {
    case 'countdown':
      return renderCountdown();
    case 'drawing':
      return renderDrawing();
    case 'finished':
      return renderFinished();
    case 'gameFinished':
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              🎉 ¡Juego Terminado!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Redirigiendo a la galería de dibujos...
            </p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        </div>
      );
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
