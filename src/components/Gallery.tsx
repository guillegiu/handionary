import { useGameStore } from '../store/gameStore';
import { useNavigate } from 'react-router-dom';

const Gallery = () => {
  const { drawings, players, teams, totalRounds, resetGame } = useGameStore();
  const navigate = useNavigate();

  const handleNewGame = () => {
    resetGame();
    navigate('/home');
  };

  // Agrupar dibujos por equipo
  const drawingsByTeam = {
    A: drawings.filter(d => d.team === 'A'),
    B: drawings.filter(d => d.team === 'B')
  };

  // Agrupar dibujos por ronda
  const drawingsByRound = Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => ({
    round,
    drawings: drawings.filter(d => d.round === round)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🎨 Galería de Dibujos
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Todos los dibujos creados por los jugadores
          </p>
          
          {/* Estadísticas */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {drawings.length}
                </div>
                <div className="text-gray-600">Dibujos totales</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {players.length}
                </div>
                <div className="text-gray-600">Jugadores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {totalRounds}
                </div>
                <div className="text-gray-600">Rondas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vista por equipos */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🏆 Por Equipos
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Equipo A */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-600 mb-2">
                  🔵 Equipo A
                </h3>
                <p className="text-gray-600">
                  {teams.A.map(p => p.name).join(', ')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {drawingsByTeam.A.length} dibujos
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {drawingsByTeam.A.map((drawing) => (
                  <div key={drawing.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">
                        {drawing.playerName}
                      </h4>
                      <span className="text-sm text-gray-500">
                        Ronda {drawing.round}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <img 
                        src={drawing.imageData} 
                        alt={`Dibujo de ${drawing.playerName}`}
                        className="max-w-full max-h-48 rounded-lg shadow-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipo B */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-red-600 mb-2">
                  🔴 Equipo B
                </h3>
                <p className="text-gray-600">
                  {teams.B.map(p => p.name).join(', ')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {drawingsByTeam.B.length} dibujos
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {drawingsByTeam.B.map((drawing) => (
                  <div key={drawing.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">
                        {drawing.playerName}
                      </h4>
                      <span className="text-sm text-gray-500">
                        Ronda {drawing.round}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <img 
                        src={drawing.imageData} 
                        alt={`Dibujo de ${drawing.playerName}`}
                        className="max-w-full max-h-48 rounded-lg shadow-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vista por rondas */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🔄 Por Rondas
          </h2>
          
          <div className="space-y-8">
            {drawingsByRound.map(({ round, drawings: roundDrawings }) => (
              <div key={round} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  Ronda {round}
                </h3>
                
                {roundDrawings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roundDrawings.map((drawing) => (
                      <div key={drawing.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-800">
                            {drawing.playerName}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            drawing.team === 'A' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Equipo {drawing.team}
                          </span>
                        </div>
                        <div className="flex justify-center">
                          <img 
                            src={drawing.imageData} 
                            alt={`Dibujo de ${drawing.playerName}`}
                            className="max-w-full max-h-48 rounded-lg shadow-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No hay dibujos en esta ronda
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="text-center">
          <button
            onClick={handleNewGame}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-semibold rounded-full shadow-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200"
          >
            🎮 Nuevo Juego
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
