declare module '@mediapipe/hands' {
  export class Hands {
    constructor(options?: any);
    setOptions(options: any): void;
    onResults(callback: (results: any) => void): void;
    send(options: any): Promise<void>;
    close(): void;
    static HAND_CONNECTIONS: any[];
  }
}

declare module '@mediapipe/camera_utils' {
  export class Camera {
    constructor(video: HTMLVideoElement, options: any);
    start(): void;
    stop(): void;
  }
}

declare module '@mediapipe/drawing_utils' {
  export function drawConnectors(
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    connections: any[],
    options?: any
  ): void;
  
  export function drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    options?: any
  ): void;
}
