'use client';

import { useState, useEffect, useRef } from 'react';
import { getAllContacts } from '@/lib/supabase';
import { Contact } from '@/types';
import { ArrowLeft, Camera, Upload, Search, X } from 'lucide-react';
import Link from 'next/link';
import * as faceapi from '@vladmandic/face-api';

export default function InstantSearchPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [searchImage, setSearchImage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [matchedContact, setMatchedContact] = useState<Contact | null>(null);
  const [matchConfidence, setMatchConfidence] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Error loading models:', err);
        setError('Failed to load face recognition models');
      }
    };
    loadModels();
  }, []);

  // Load contacts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await getAllContacts();
        setContacts(data);
      } catch (err) {
        console.error('Error loading contacts:', err);
        setError('Failed to load contacts');
      }
    };
    loadContacts();
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setCameraMode(true);
      setError('');
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraMode(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setSearchImage(imageData);
      stopCamera();
      searchFace(imageData);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setSearchImage(imageData);
      searchFace(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Search for face in database
  const searchFace = async (imageData: string) => {
    if (!modelsLoaded || contacts.length === 0) {
      setError('System not ready. Please wait...');
      return;
    }

    setSearching(true);
    setError('');
    setMatchedContact(null);

    try {
      // Create image element from data
      const img = document.createElement('img');
      img.src = imageData;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Detect face in uploaded image
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError('No face detected in the image. Please try another photo.');
        setSearching(false);
        return;
      }

      const queryDescriptor = detection.descriptor;

      // Compare with all contacts
      let bestMatch: { contact: Contact; distance: number } | null = null;
      const MATCH_THRESHOLD = 0.6; // Lower is better, typical range 0.4-0.6

      for (const contact of contacts) {
        if (!contact.faceDescriptor) continue;

        const storedDescriptor = new Float32Array(
          JSON.parse(contact.faceDescriptor)
        );

        const distance = faceapi.euclideanDistance(
          queryDescriptor,
          storedDescriptor
        );

        if (distance < MATCH_THRESHOLD) {
          if (!bestMatch || distance < bestMatch.distance) {
            bestMatch = { contact, distance };
          }
        }
      }

      if (bestMatch) {
        setMatchedContact(bestMatch.contact);
        // Convert distance to confidence percentage (inverse relationship)
        const confidence = Math.max(0, Math.min(100, (1 - bestMatch.distance) * 100));
        setMatchConfidence(confidence);
      } else {
        setError('No matching contact found in your database.');
      }
    } catch (err) {
      console.error('Error searching face:', err);
      setError('Error processing image. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Reset search
  const resetSearch = () => {
    setSearchImage(null);
    setMatchedContact(null);
    setMatchConfidence(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            Instant Face Search
          </h1>
          <p className="text-gray-600 mt-2">
            Take a photo or upload an image to find who they are
          </p>
        </div>

        {/* System Status */}
        {!modelsLoaded && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="text-yellow-700">Loading face recognition models...</p>
          </div>
        )}

        {contacts.length === 0 && modelsLoaded && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-blue-700">
              No contacts enrolled yet.{' '}
              <Link href="/enroll" className="underline font-semibold">
                Enroll your first contact
              </Link>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Main Content */}
        {!searchImage && !cameraMode && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-4">
              {/* Camera Button */}
              <button
                onClick={startCamera}
                disabled={!modelsLoaded || contacts.length === 0}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg font-semibold transition-colors"
              >
                <Camera size={24} />
                Take Photo
              </button>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!modelsLoaded || contacts.length === 0}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg font-semibold transition-colors"
              >
                <Upload size={24} />
                Upload Photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Tips for best results:</strong>
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                <li>Ensure good lighting</li>
                <li>Face should be clearly visible</li>
                <li>No sunglasses or masks</li>
                <li>Front-facing angle works best</li>
              </ul>
            </div>
          </div>
        )}

        {/* Camera Mode */}
        {cameraMode && (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex gap-4 mt-4">
              <button
                onClick={capturePhoto}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold"
              >
                <Camera size={20} />
                Capture
              </button>
              <button
                onClick={stopCamera}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 font-semibold"
              >
                <X size={20} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchImage && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Uploaded Image */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Searching for this person:</h2>
              <img
                src={searchImage}
                alt="Search query"
                className="w-full max-w-md mx-auto rounded-lg shadow-md"
              />
            </div>

            {/* Searching State */}
            {searching && (
              <div className="text-center py-8">
                <Search className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                <p className="text-gray-600 text-lg">Searching database...</p>
              </div>
            )}

            {/* Match Found */}
            {!searching && matchedContact && (
              <div className="border-t pt-6">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <p className="text-green-700 font-semibold flex items-center gap-2">
                    <Search size={20} />
                    Match Found! ({matchConfidence.toFixed(1)}% confidence)
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {matchedContact.name}
                    </h3>
                    {matchedContact.title && (
                      <p className="text-gray-600">{matchedContact.title}</p>
                    )}
                    {matchedContact.company && (
                      <p className="text-gray-600">{matchedContact.company}</p>
                    )}
                  </div>

                  {matchedContact.linkedinUrl && (
                    <a
                      href={matchedContact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      View LinkedIn Profile →
                    </a>
                  )}

                  {matchedContact.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Notes:</h4>
                      <p className="text-gray-600">{matchedContact.notes}</p>
                    </div>
                  )}

                  {matchedContact.photoUrl && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Enrolled Photo:</h4>
                      <img
                        src={matchedContact.photoUrl}
                        alt={matchedContact.name}
                        className="w-32 h-32 rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No Match */}
            {!searching && !matchedContact && !error && (
              <div className="text-center py-8">
                <p className="text-gray-600 text-lg mb-4">
                  This person is not in your database yet.
                </p>
                <Link
                  href="/enroll"
                  className="inline-flex items-center bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
                >
                  Enroll New Contact
                </Link>
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={resetSearch}
              className="w-full mt-6 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-semibold"
            >
              Search Another Person
            </button>
          </div>
        )}

        {/* Stats */}
        {modelsLoaded && (
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              {contacts.length} contacts in database • {modelsLoaded ? 'Ready' : 'Loading...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
