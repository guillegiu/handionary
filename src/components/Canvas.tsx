import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentColor, hands, canDraw, saveFinalDrawing } = useGameStore();
  const drawingStatesRef = useRef<Map<number, { isDrawing: boolean; lastPoint: { x: number; y: number } | null }>>(new Map());
  const drawingHistoryRef = useRef<Array<{x: number, y: number, color: string, handId: number}>>([]);

  const clearCanvas = useCallback(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawingHistoryRef.current = [];
        drawingStatesRef.current.clear();
      }
    }
  }, []);

  // Función para guardar el canvas como imagen
  const saveCanvasAsImage = useCallback(() => {
    console.log('Intentando guardar dibujo - historial:', drawingHistoryRef.current.length);
    
    if (canvasRef.current && drawingHistoryRef.current.length > 0) {
      // Usar el canvas actual directamente
      const imageData = canvasRef.current.toDataURL('image/png');
      console.log('Canvas convertido a imagen, tamaño:', imageData.length);
      
      if (imageData.length > 1000) {
        console.log('Llamando a saveFinalDrawing...');
        saveFinalDrawing(imageData);
        console.log('saveFinalDrawing llamado exitosamente');
        console.log('Primeros 100 caracteres de la imagen:', imageData.substring(0, 100));
        
        // Verificar que se guardó en el store
        setTimeout(() => {
          console.log('Verificando store después de guardar...');
          // Esto se ejecutará después de que el store se actualice
        }, 100);
      } else {
        console.log('Canvas parece estar vacío, no se guarda');
      }
    } else {
      console.log('No se puede guardar: canvas no disponible o historial vacío');
    }
  }, [saveFinalDrawing]);

  const draw = useCallback((x: number, y: number, handId: number) => {
    if (!canvasRef.current || !canDraw) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    // Obtener el estado de dibujo para esta mano específica
    const handState = drawingStatesRef.current.get(handId);
    
    if (handState && handState.isDrawing && handState.lastPoint) {
      ctx.beginPath();
      ctx.moveTo(handState.lastPoint.x, handState.lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Guardar en el historial solo el punto actual
      drawingHistoryRef.current.push({
        x: x,
        y: y,
        color: currentColor,
        handId: handId
      });
      
      // Debug: mostrar cada pocos puntos
      if (drawingHistoryRef.current.length % 10 === 0) {
        console.log(`📝 Punto ${drawingHistoryRef.current.length} guardado: (${x}, ${y})`);
      }
    }

    // Actualizar el estado de esta mano
    drawingStatesRef.current.set(handId, {
      isDrawing: true,
      lastPoint: { x, y }
    });
  }, [currentColor, canDraw]);

  // Función para dibujar desde la cámara (será llamada por el componente Camera)
  const drawFromCamera = useCallback((x: number, y: number, handId: number) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      
      // Solo invertir horizontalmente (X), mantener Y normal
      const canvasX = (1 - x) * rect.width; // Invertir solo X
      const canvasY = y * rect.height; // Y normal (no invertir)
      
      // Simular click para activar el dibujo
      const handState = drawingStatesRef.current.get(handId);
      if (!handState || !handState.isDrawing) {
        drawingStatesRef.current.set(handId, {
          isDrawing: true,
          lastPoint: { x: canvasX, y: canvasY }
        });
      }
      
      draw(canvasX, canvasY, handId);
    }
  }, [draw]);

  // Función para resetear el dibujo cuando no hay pinza
  const resetDrawing = useCallback((handId: number) => {
    drawingStatesRef.current.set(handId, {
      isDrawing: false,
      lastPoint: null
    });
  }, []);

  // Exponer la función para que la cámara pueda usarla
  useEffect(() => {
    (window as any).drawFromCamera = drawFromCamera;
    (window as any).resetDrawing = resetDrawing;
    
    return () => {
      delete (window as any).drawFromCamera;
      delete (window as any).resetDrawing;
    };
  }, [drawFromCamera, resetDrawing]);


  // Redibujar todo el canvas (dibujo + puntitos de manos)
  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Redibujar todo el historial de dibujo
    drawingHistoryRef.current.forEach((point, index) => {
      if (index > 0) {
        const prevPoint = drawingHistoryRef.current[index - 1];
        if (prevPoint.handId === point.handId) {
          ctx.beginPath();
          ctx.moveTo(prevPoint.x, prevPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.strokeStyle = prevPoint.color;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }
    });

    // Dibujar puntos de tracking si hay manos detectadas
    console.log('Redibujando canvas - canDraw:', canDraw, 'hands:', hands.length);
    if (hands && hands.length > 0) {
      hands.forEach((hand, handIndex) => {
        if (hand.landmarks && hand.landmarks.length > 0) {
          console.log(`Dibujando mano ${handIndex} con ${hand.landmarks.length} landmarks`);
          const handColor = handIndex === 0 ? '#00FF00' : '#FF8800';
          
          // Solo dibujar puntos clave (puntitos) - solo invertir X
          hand.landmarks.forEach((point: any, index: number) => {
            // Solo invertir X, mantener Y normal
            const x = (1 - point.x) * canvasRef.current!.width;
            const y = point.y * canvasRef.current!.height;
            
            let color = handColor;
            let radius = 2;
            
            if ([4, 8, 12, 16, 20].includes(index)) { // Puntas de dedos
              color = '#FFFF00';
              radius = 3;
            } else if ([3, 6, 10, 14, 18].includes(index)) { // Articulaciones
              color = '#00FFFF';
              radius = 2;
            } else if (index === 0) { // Muñeca
              color = '#FF00FF';
              radius = 4;
            }
            
            // Dibujar solo el punto (puntito)
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            
            // Borde negro para mejor visibilidad
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();
          });
        }
      });
    }
  }, [hands, canDraw]);

  // Actualizar el canvas cuando cambien las manos o el estado de dibujo
  useEffect(() => {
    console.log('Canvas useEffect - canDraw:', canDraw, 'hands:', hands.length);
    redrawCanvas();
  }, [hands, canDraw, redrawCanvas]);

  // Redibujar solo el dibujo cuando termine el juego
  useEffect(() => {
    console.log('🔄 Canvas useEffect ejecutado - canDraw:', canDraw, 'historial:', drawingHistoryRef.current.length);
    
    if (!canDraw && drawingHistoryRef.current.length > 0) {
      console.log('🎯 CONDICIÓN CUMPLIDA: Juego terminado, guardando dibujo...');
      console.log('Historial actual:', drawingHistoryRef.current.length, 'puntos');
      
      // Guardar inmediatamente sin redibujar primero
      console.log('Guardando imagen inmediatamente...');
      saveCanvasAsImage();
    } else if (!canDraw) {
      console.log('⚠️ Juego terminado pero NO HAY HISTORIAL de dibujo');
      console.log('Esto puede indicar que el dibujo no se está guardando en el historial');
    } else {
      console.log('ℹ️ Juego en progreso o sin historial');
    }
  }, [canDraw, saveCanvasAsImage]);

  // Simular dibujo con el mouse para testing
  const handleMouseDown = useCallback(() => {
    // Mouse drawing disabled - only hand tracking
  }, []);

  const handleMouseMove = useCallback(() => {
    // Mouse drawing disabled - only hand tracking
  }, []);

  const handleMouseUp = useCallback(() => {
    // Mouse drawing disabled - only hand tracking
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-700">Pizarra</h3>
        {canDraw && (
          <button
            onClick={clearCanvas}
            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
          >
            Borrar
          </button>
        )}
      </div>
      
      {/* Canvas principal - ocupa todo el espacio disponible */}
      <div className="flex-1 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-2 border-gray-300 rounded-lg shadow-lg bg-white cursor-crosshair max-w-full max-h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      
      {/* Estado compacto */}
      <div className="mt-3 text-center">
        {canDraw ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 font-medium">Dibujo habilitado</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-600 font-medium">Dibujo deshabilitado</span>
          </div>
        )}
        
            {/* Debug temporal - siempre visible cuando no se puede dibujar */}
            {!canDraw && (
              <div className="mt-2 space-y-2 p-2 bg-yellow-100 rounded border">
                <div className="text-xs font-bold text-gray-700">
                  🔧 DEBUG - Historial: {drawingHistoryRef.current.length} puntos
                </div>
                {drawingHistoryRef.current.length > 0 ? (
                  <button
                    onClick={saveCanvasAsImage}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 font-bold"
                  >
                    💾 FORZAR GUARDADO
                  </button>
                ) : (
                  <div className="text-xs text-red-600 font-bold">
                    ❌ NO HAY PUNTOS EN EL HISTORIAL
                  </div>
                )}
              </div>
            )}
      </div>
    </div>
  );
};

export default Canvas;
