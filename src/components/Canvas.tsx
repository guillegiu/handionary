import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentColor, hands, canDraw } = useGameStore();
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
      
      // Guardar en el historial
      drawingHistoryRef.current.push({
        x: handState.lastPoint.x,
        y: handState.lastPoint.y,
        color: currentColor,
        handId: handId
      });
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

    // Dibujar puntitos de las manos en el lienzo para tracking
    hands.forEach((hand, handIndex) => {
      if (hand.landmarks && hand.landmarks.length > 0) {
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
  }, [hands]);

  // Actualizar el canvas cuando cambien las manos o el historial
  useEffect(() => {
    redrawCanvas();
  }, [hands, redrawCanvas]);

  // Simular dibujo con el mouse para testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Mouse drawing disabled - only hand tracking
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Mouse drawing disabled - only hand tracking
  }, []);

  const handleMouseUp = useCallback(() => {
    // Mouse drawing disabled - only hand tracking
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Pizarra</h3>
        {canDraw && (
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Borrar Todo
          </button>
        )}
      </div>
      
      <canvas
        ref={canvasRef}
        width={700}
        height={500}
        className="border-2 border-gray-300 rounded-lg shadow-lg bg-white cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      <div className="text-sm text-gray-600 text-center space-y-1">
        {canDraw ? (
          <>
            <p className="text-green-600 font-medium">🟢 Dibujo habilitado</p>
            <p className="text-xs text-gray-500">Haz pinza con el índice y pulgar para dibujar</p>
          </>
        ) : (
          <p className="text-red-600 font-medium">🔴 Dibujo deshabilitado</p>
        )}
      </div>
    </div>
  );
};

export default Canvas;
