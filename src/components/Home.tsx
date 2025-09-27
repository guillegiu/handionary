import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { startGame, selectedTime, setSelectedTime } = useGameStore();
  const navigate = useNavigate();

  const timeOptions = [15, 30, 60];
  const [customTime, setCustomTime] = useState(60);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleStart = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        <h1 className="text-6xl font-bold text-gray-800 mb-8">
          🎨 pincelHand
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          ¡Dibuja algo para que tus amigos adivinen!
        </p>
        
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
          className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-2xl font-bold rounded-full shadow-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200"
        >
          🚀 START
        </button>
      </div>
    </div>
  );
};

export default Home;
