import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { 
    startGame, 
    selectedTime, 
    setSelectedTime, 
    players, 
    addPlayer, 
    removePlayer, 
    assignTeams, 
    setTotalRounds: setStoreTotalRounds,
    setGamePhase 
  } = useGameStore();
  const navigate = useNavigate();

  const timeOptions = [15, 30, 60];
  const [customTime, setCustomTime] = useState(60);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [totalRounds, setTotalRounds] = useState(1);

  const handleAddPlayer = () => {
    if (playerName.trim() && players.length < 12) {
      addPlayer(playerName);
      setPlayerName('');
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    removePlayer(playerId);
  };

  const handleStart = () => {
    if (players.length < 2) {
      alert('Necesitas al menos 2 jugadores para empezar');
      return;
    }
    
    // Asignar equipos aleatoriamente
    assignTeams();
    
    // Configurar rondas
    setStoreTotalRounds(totalRounds);
    
    // Cambiar a fase de setup
    setGamePhase('setup');
    
    // Iniciar el juego
    startGame();
    navigate('/game');
  };

  const handleTimeSelect = (time: number) => {
    setSelectedTime(time);
    setIsCustomMode(false);
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 120) {
      setCustomTime(value);
      setSelectedTime(value);
      setIsCustomMode(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-6">
        <h1 className="text-6xl font-bold text-gray-800 mb-8">
          🎨 pincelHand
        </h1>
        <div className="bg-blue-500 text-white p-4 rounded-lg mb-4">
          🧪 Prueba de Tailwind CSS - Si ves esto con fondo azul, Tailwind funciona
        </div>
        <p className="text-xl text-gray-600 mb-8">
          ¡Juego de equipos! Dibuja algo para que tu equipo adivine.
        </p>
        
        {/* Gestión de jugadores */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            👥 Agregar Jugadores
          </h2>
          
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nombre del jugador"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
            />
            <button
              onClick={handleAddPlayer}
              disabled={!playerName.trim() || players.length >= 12}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Agregar
            </button>
          </div>
          
          {/* Lista de jugadores */}
          {players.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Jugadores ({players.length}/12)
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <span className="text-gray-700 font-medium">{player.name}</span>
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Configuración de rondas */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              🔄 Número de Rondas
            </h3>
            <div className="flex items-center justify-center space-x-4">
              <label htmlFor="rounds" className="text-gray-600 font-medium">
                Rondas:
              </label>
              <input
                id="rounds"
                type="number"
                min="1"
                max="5"
                value={totalRounds}
                onChange={(e) => setTotalRounds(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-600 font-medium">
                (cada jugador dibuja {totalRounds} vez{totalRounds > 1 ? 'es' : ''})
              </span>
            </div>
          </div>
        </div>
        
        {/* Selector de tiempo */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            ⏱️ Selecciona el tiempo
          </h2>
          
          {/* Botones de tiempo predefinidos */}
          <div className="flex justify-center space-x-4 mb-6">
            {timeOptions.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`px-6 py-3 rounded-xl text-lg font-bold transition-all duration-200 transform hover:scale-105 ${
                  selectedTime === time && !isCustomMode
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {time}s
              </button>
            ))}
          </div>

          {/* Selector personalizado */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              🎯 Tiempo personalizado
            </h3>
            <div className="flex items-center justify-center space-x-4">
              <label htmlFor="customTime" className="text-gray-600 font-medium">
                Tiempo:
              </label>
              <input
                id="customTime"
                type="number"
                min="1"
                max="120"
                value={customTime}
                onChange={handleCustomTimeChange}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-600 font-medium">segundos</span>
            </div>
            <div className="mt-2">
              <input
                type="range"
                min="1"
                max="120"
                value={customTime}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setCustomTime(value);
                  setSelectedTime(value);
                  setIsCustomMode(true);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(customTime / 120) * 100}%, #e5e7eb ${(customTime / 120) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1s</span>
                <span>60s</span>
                <span>120s</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-700">
              Tiempo seleccionado: <span className="font-bold text-blue-600 text-xl">{selectedTime} segundos</span>
            </p>
            {isCustomMode && (
              <p className="text-sm text-blue-600 mt-1">
                ✨ Modo personalizado activado
              </p>
            )}
          </div>
        </div>

        <p className="text-lg text-gray-500 mb-8">
          Haz pinza con el índice y pulgar para empezar a dibujar.
        </p>
        
            <button
              onClick={handleStart}
              disabled={players.length < 2}
              className={`px-12 py-6 text-white text-2xl font-bold rounded-full shadow-lg transform transition-all duration-200 ${
                players.length >= 2
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {players.length >= 2 ? '🚀 START' : '👥 Necesitas al menos 2 jugadores'}
            </button>
      </div>
    </div>
  );
};

export default Home;
