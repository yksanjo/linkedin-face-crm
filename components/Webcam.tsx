'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface WebcamProps {
  onCapture?: (canvas: HTMLCanvasElement) => void;
  showCaptureButton?: boolean;
  width?: number;
  height?: number;
  mirrored?: boolean;
}

export default function Webcam({
  onCapture,
  showCaptureButton = true,
  width = 640,
  height = 480,
  mirrored = true,
}: WebcamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    startWebcam();
    return () => stopWebcam();
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width, height },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError('');
      }
    } catch (err) {
      setError('Unable to access camera. Please grant camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsStreaming(false);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (mirrored) {
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      context.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    if (onCapture) {
      onCapture(canvas);
    }
  };

  return (
    <div className="relative">
      <div className="relative bg-black rounded-lg overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-[480px] bg-gray-900 text-white p-8 text-center">
            <div>
              <CameraOff className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-auto ${mirrored ? 'scale-x-[-1]' : ''}`}
          />
        )}
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading camera...</div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {showCaptureButton && isStreaming && (
        <button
          onClick={captureFrame}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Camera className="w-5 h-5" />
          Capture Photo
        </button>
      )}
    </div>
  );
}
