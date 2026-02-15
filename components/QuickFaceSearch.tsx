'use client';

import { useState, useRef } from 'react';
import { Camera, Search, X, Check } from 'lucide-react';

/**
 * QuickFaceSearch - Instant "snap and identify" component
 * 
 * Usage: Add this to any page where you want instant face search
 * 
 * Features:
 * - One-tap camera access
 * - Instant face detection
 * - Auto-search on capture
 * - Mobile-optimized UI
 */

interface QuickSearchProps {
  contacts: Array<{
    id: string;
    name: string;
    title?: string;
    company?: string;
    photoUrl?: string;
    faceDescriptor?: string;
    linkedinUrl?: string;
  }>;
  modelsLoaded: boolean;
  onMatch?: (contact: any, confidence: number) => void;
  onNoMatch?: () => void;
}

export default function QuickFaceSearch({ 
  contacts, 
  modelsLoaded,
  onMatch,
  onNoMatch 
}: QuickSearchProps) {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [result, setResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      alert('Could not access camera. Please check permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsActive(false);
    setResult(null);
  };

  // Capture and search
  const captureAndSearch = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setSearching(true);
    
    // Capture frame
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');

    try {
      // Dynamic import to avoid SSR issues
      const faceapi = await import('@vladmandic/face-api');
      
      // Create image element
      const img = document.createElement('img');
      img.src = imageData;
      await new Promise(resolve => { img.onload = resolve; });

      // Detect face
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        alert('No face detected. Try again with better lighting.');
        setSearching(false);
        return;
      }

      // Search contacts
      const queryDescriptor = detection.descriptor;
      let bestMatch: { contact: any; distance: number } | null = null;
      const THRESHOLD = 0.6;

      for (const contact of contacts) {
        if (!contact.faceDescriptor) continue;

        const storedDescriptor = new Float32Array(
          JSON.parse(contact.faceDescriptor)
        );

        const distance = faceapi.euclideanDistance(
          queryDescriptor,
          storedDescriptor
        );

        if (distance < THRESHOLD) {
          if (!bestMatch || distance < bestMatch.distance) {
            bestMatch = { contact, distance };
          }
        }
      }

      if (bestMatch) {
        const confidence = Math.max(0, Math.min(100, (1 - bestMatch.distance) * 100));
        setResult({
          contact: bestMatch.contact,
          confidence,
          image: imageData
        });
        onMatch?.(bestMatch.contact, confidence);
      } else {
        setResult({ found: false, image: imageData });
        onNoMatch?.();
      }
    } catch (err) {
      console.error('Search error:', err);
      alert('Error processing image. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Floating action button (when not active)
  if (!isActive) {
    return (
      <button
        onClick={startCamera}
        disabled={!modelsLoaded || contacts.length === 0}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed z-50 transition-all hover:scale-110"
        title="Quick Face Search"
      >
        <Camera size={28} />
      </button>
    );
  }

  // Full-screen camera overlay
  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top bar */}
        <div className="bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-lg font-semibold">Quick Search</h2>
            <button
              onClick={stopCamera}
              className="text-white bg-white/20 p-2 rounded-full hover:bg-white/30"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Center guidance */}
        {!result && !searching && (
          <div className="flex-1 flex items-center justify-center">
            <div className="border-4 border-white/50 rounded-lg w-64 h-80 relative">
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-blue-400"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-blue-400"></div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-blue-400"></div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-blue-400"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-center px-4">
                  Position face<br/>within frame
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Searching indicator */}
        {searching && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-black/70 p-6 rounded-lg text-center">
              <Search className="animate-spin mx-auto mb-3 text-blue-400" size={48} />
              <p className="text-white text-lg">Searching...</p>
            </div>
          </div>
        )}

        {/* Result display */}
        {result && !searching && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-black/90 rounded-lg p-6 max-w-md w-full">
              {result.found === false ? (
                <div className="text-center">
                  <X className="mx-auto mb-3 text-red-400" size={48} />
                  <p className="text-white text-lg mb-4">No match found</p>
                  <button
                    onClick={() => setResult(null)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Check className="mx-auto mb-3 text-green-400" size={48} />
                  <p className="text-green-400 mb-3">
                    {result.confidence.toFixed(0)}% Match
                  </p>
                  <h3 className="text-white text-2xl font-bold mb-2">
                    {result.contact.name}
                  </h3>
                  {result.contact.title && (
                    <p className="text-gray-300">{result.contact.title}</p>
                  )}
                  {result.contact.company && (
                    <p className="text-gray-300">{result.contact.company}</p>
                  )}
                  
                  <div className="mt-4 flex gap-2">
                    {result.contact.linkedinUrl && (
                      <a
                        href={result.contact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        View Profile
                      </a>
                    )}
                    <button
                      onClick={() => setResult(null)}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Search Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom capture button */}
        {!result && !searching && (
          <div className="bg-gradient-to-t from-black/70 to-transparent p-6">
            <button
              onClick={captureAndSearch}
              className="w-full bg-blue-600 text-white py-4 rounded-full font-semibold text-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Camera size={24} />
              Capture & Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
