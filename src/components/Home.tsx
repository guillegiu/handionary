import { useGameStore } from '../store/gameStore';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { startGame, selectedTime, setSelectedTime } = useGameStore();
  const navigate = useNavigate();

  const timeOptions = [15, 30, 60];

  const handleStart = () => {
    startGame();
    navigate('/game');
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
          <div className="flex justify-center space-x-4 mb-6">
            {timeOptions.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`px-8 py-4 rounded-xl text-xl font-bold transition-all duration-200 transform hover:scale-105 ${
                  selectedTime === time
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {time}s
              </button>
            ))}
          </div>
          <p className="text-gray-600">
            Tiempo seleccionado: <span className="font-bold text-blue-600">{selectedTime} segundos</span>
          </p>
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
