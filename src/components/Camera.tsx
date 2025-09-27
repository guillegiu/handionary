import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore } from '../store/gameStore';

const Camera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { updateHands, setActiveHands, canDraw } = useGameStore();
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [trackingQuality, setTrackingQuality] = useState(0);
  const [handCount, setHandCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState('Inicializando...');
  
  const processHands = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) {
      setIsHandDetected(false);
      setHandCount(0);
      setTrackingQuality(0);
      updateHands([]);
      setActiveHands(0);
      setDebugInfo('No se detectaron manos');
      return;
    }

    setIsHandDetected(true);
    setHandCount(landmarks.length);
    setActiveHands(landmarks.length);
    setDebugInfo(`Detectadas ${landmarks.length} manos`);
    
    const handsData: any[] = [];
    
    landmarks.forEach((handLandmarks: any[], handIndex: number) => {
      const hand = handLandmarks;
      const indexFinger = 8; // Dedo índice
      const thumb = 4; // Pulgar
      
      // Posición del dedo índice para pintar
      const indexPosition = {
        x: hand[indexFinger].x,
        y: hand[indexFinger].y
      };
      
      // Detectar si hay pinza (índice cerca del pulgar)
      const indexTip = hand[indexFinger];
      const thumbTip = hand[thumb];
      
      // Calcular distancia entre índice y pulgar
      const distance = Math.sqrt(
        Math.pow(indexTip.x - thumbTip.x, 2) + 
        Math.pow(indexTip.y - thumbTip.y, 2)
      );
      
      // Si la distancia es pequeña, hay pinza
      const isPinching = distance < 0.1; // Umbral ajustable
      
      // Crear datos de la mano
      const handData = {
        id: handIndex,
        position: indexPosition,
        landmarks: handLandmarks,
        isRightHand: handIndex === 1, // La segunda mano es la derecha
        isPinching: isPinching
      };
      
      handsData.push(handData);
      
      // Solo enviar al lienzo si hay pinza y el dibujo está habilitado
      if (isPinching && canDraw && window.drawFromCamera) {
        window.drawFromCamera(indexPosition.x, indexPosition.y, handIndex);
      } else if (!isPinching && window.resetDrawing) {
        // Resetear el dibujo cuando no hay pinza para evitar conexiones no deseadas
        window.resetDrawing(handIndex);
      }
    });
    
    // Actualizar el store con los datos de las manos
    updateHands(handsData);
    
  }, [updateHands, setActiveHands, canDraw]);

  useEffect(() => {
    let hands: any;
    let camera: any;

    const initMediaPipe = async () => {
      try {
        setDebugInfo('Importando MediaPipe...');
        
        // Importar MediaPipe dinámicamente
        const { Hands } = await import('@mediapipe/hands');
        const { Camera } = await import('@mediapipe/camera_utils');
        const { drawConnectors, drawLandmarks } = await import('@mediapipe/drawing_utils');

        setDebugInfo('Creando instancia de Hands...');
        
        hands = new Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        setDebugInfo('Configurando onResults...');

        hands.onResults((results: any) => {
          console.log('MediaPipe results:', results);
          if (videoRef.current && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              
              // Verificar si hay manos detectadas
              if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                console.log('Manos detectadas:', results.multiHandLandmarks.length);
                setDebugInfo(`${results.multiHandLandmarks.length} manos detectadas`);
                
                processHands(results.multiHandLandmarks);
                
                // Calcular calidad del tracking basada en la confianza
                const avgConfidence = results.multiHandLandmarks.reduce((acc: number, hand: any[]) => {
                  return acc + hand.reduce((sum: number, point: any) => sum + (point.visibility || 0), 0) / hand.length;
                }, 0) / results.multiHandLandmarks.length;
                setTrackingQuality(avgConfidence);
                
                // Solo dibujar esqueletos en la vista de cámara
                results.multiHandLandmarks.forEach((landmarks: any[], handIndex: number) => {
                  // Color diferente para cada mano
                  const handColor = handIndex === 0 ? '#00FF00' : '#FF8800';
                  
                  // Dibujar conexiones entre puntos (esqueleto)
                  drawConnectors(ctx, landmarks, Hands.HAND_CONNECTIONS, {
                    color: handColor,
                    lineWidth: 3
                  });
                  
                  // Dibujar puntos de landmarks con colores diferentes
                  landmarks.forEach((point: any, index: number) => {
                    const isFingerTip = [4, 8, 12, 16, 20].includes(index); // Pulgar y puntas de dedos
                    const isJoint = [3, 6, 10, 14, 18].includes(index); // Articulaciones medias
                    
                    let color = handColor; // Color base de la mano
                    let radius = 2;
                    
                    if (isFingerTip) {
                      color = '#FFFF00';
                      radius = 4;
                    } else if (isJoint) {
                      color = '#00FFFF';
                      radius = 3;
                    } else if (index === 0) {
                      color = '#FF00FF';
                      radius = 5;
                    }
                    
                    drawLandmarks(ctx, [point], {
                      color: color,
                      lineWidth: 1,
                      radius: radius
                    });
                  });
                });
              } else {
                console.log('No se detectaron manos');
                setDebugInfo('No se detectaron manos');
                setIsHandDetected(false);
                setHandCount(0);
                setTrackingQuality(0);
                updateHands([]);
                setActiveHands(0);
              }
            }
          }
        });

        setDebugInfo('Iniciando cámara...');

        if (videoRef.current) {
          camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current) {
                await hands.send({ image: videoRef.current });
              }
            },
            width: 320,
            height: 240
          });
          camera.start();
          setDebugInfo('Cámara iniciada - Esperando manos...');
          console.log('Cámara iniciada correctamente');
        } else {
          setDebugInfo('Error: videoRef.current es null');
          console.error('videoRef.current es null');
        }
      } catch (error) {
        console.error('Error initializing MediaPipe:', error);
        setDebugInfo(`Error: ${error.message}`);
      }
    };

    initMediaPipe();

    return () => {
      if (camera) {
        camera.stop();
      }
      if (hands) {
        hands.close();
      }
    };
  }, [processHands, updateHands, setActiveHands]);

  // Función para obtener el color del semáforo
  const getTrafficLightColor = () => {
    if (!isHandDetected) return 'bg-red-500';
    if (trackingQuality > 0.7) return 'bg-green-500';
    if (trackingQuality > 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Función para obtener el texto del estado
  const getStatusText = () => {
    if (!isHandDetected) return 'No se detecta mano';
    if (trackingQuality > 0.7) return 'Tracking excelente';
    if (trackingQuality > 0.4) return 'Tracking bueno';
    return 'Tracking débil';
  };

  return (
    <div className="space-y-4">
      {/* Vista de cámara */}
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-40 bg-gray-900 rounded-lg"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-40 pointer-events-none"
          width={280}
          height={200}
        />
      </div>

      {/* Indicador tipo semáforo */}
      <div className="bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">
          Estado del Tracking
        </h4>
        
        {/* Semáforo visual */}
        <div className="flex justify-center items-center space-x-2 mb-2">
          <div className={`w-4 h-4 rounded-full ${getTrafficLightColor()} transition-colors duration-300`}></div>
          <span className="text-xs text-gray-600">
            {getStatusText()}
          </span>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium text-gray-700">Manos</div>
            <div className={`font-bold ${isHandDetected ? 'text-green-600' : 'text-red-600'}`}>
              {handCount}/2
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-700">Calidad</div>
            <div className="font-bold text-blue-600">
              {Math.round(trackingQuality * 100)}%
            </div>
          </div>
        </div>

        {/* Barra de progreso de calidad */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                trackingQuality > 0.7 ? 'bg-green-500' : 
                trackingQuality > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${trackingQuality * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Camera;
