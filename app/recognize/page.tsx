'use client';

import { useState, useEffect, useRef } from 'react';
import { getAllContacts, updateContact } from '@/lib/storage';
import { Contact } from '@/types';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Prevent SSR for this page
export const dynamic = 'force-dynamic';

export default function RecognizePage() {
  const [faceapi, setFaceapi] = useState<any>(null);
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [recognizedContact, setRecognizedContact] = useState<Contact | null>(
    null
  );
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const loadFaceApi = async () => {
      const faceApiModule = await import('@vladmandic/face-api');
      setFaceapi(faceApiModule);
      setFaceApiLoaded(true);
    };
    loadFaceApi();
  }, []);

  useEffect(() => {
    if (!faceApiLoaded) return;

    const initializeAsync = async () => {
      const { loadModels } = await import('@/lib/faceapi');
      await loadModels();
      setModelsReady(true);
      setContacts(getAllContacts());
    };
    initializeAsync();
  }, [faceApiLoaded]);

  useEffect(() => {
    if (modelsReady && isScanning) {
      startWebcam();
    }
    return () => stopWebcam();
  }, [modelsReady, isScanning]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
          detectFaces();
        });
      }
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning || !faceapi) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.paused || video.ended) {
      setTimeout(detectFaces, 100);
      return;
    }

    const { detectAllFaces, findBestMatch } = await import('@/lib/faceapi');
    const detections = await detectAllFaces(video);

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      if (resizedDetections.length > 0) {
        const labeledDescriptors = contacts.map(
          (contact) =>
            new faceapi.LabeledFaceDescriptors(contact.name, [
              new Float32Array(contact.faceDescriptor),
            ])
        );

        resizedDetections.forEach((detection: any) => {
          const match = findBestMatch(detection.descriptor, labeledDescriptors);

          if (match.label !== 'unknown') {
            const matchedContact = contacts.find((c) => c.name === match.label);
            if (matchedContact) {
              setRecognizedContact(matchedContact);
              updateContact(matchedContact.id, {
                lastSeen: new Date().toISOString(),
              });
            }
          }

          const box = detection.detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, {
            label: match.toString(),
          });
          drawBox.draw(canvas);
        });
      } else {
        setRecognizedContact(null);
      }
    }

    setTimeout(detectFaces, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Recognize Contacts
        </h1>

        {contacts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">
              No contacts enrolled yet!
            </p>
            <Link
              href="/enroll"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Enroll Your First Contact
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Camera Section */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  {!modelsReady ? (
                    <div className="flex items-center justify-center h-[480px] text-white">
                      Loading face detection models...
                    </div>
                  ) : !isScanning ? (
                    <div className="flex items-center justify-center h-[480px] text-white flex-col gap-4">
                      <p>Ready to scan</p>
                      <button
                        onClick={() => setIsScanning(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        Start Recognition
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-auto scale-x-[-1]"
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 scale-x-[-1]"
                      />
                    </div>
                  )}
                </div>

                {isScanning && (
                  <button
                    onClick={() => {
                      setIsScanning(false);
                      stopWebcam();
                    }}
                    className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Stop Recognition
                  </button>
                )}
              </div>
            </div>

            {/* Contact Info Section */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  {recognizedContact ? 'Contact Recognized' : 'Waiting...'}
                </h2>

                {recognizedContact ? (
                  <div className="space-y-4">
                    <img
                      src={recognizedContact.imageUrl}
                      alt={recognizedContact.name}
                      className="w-full rounded-lg"
                    />

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {recognizedContact.name}
                      </h3>
                      <p className="text-lg text-gray-600">
                        {recognizedContact.title}
                      </p>
                      <p className="text-gray-600">{recognizedContact.company}</p>
                    </div>

                    {recognizedContact.linkedinUrl && (
                      <a
                        href={recognizedContact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View LinkedIn Profile
                      </a>
                    )}

                    {recognizedContact.email && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Email:</span>{' '}
                        {recognizedContact.email}
                      </p>
                    )}

                    {recognizedContact.phone && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Phone:</span>{' '}
                        {recognizedContact.phone}
                      </p>
                    )}

                    {recognizedContact.notes && (
                      <div>
                        <p className="font-semibold text-sm text-gray-700 mb-1">
                          Notes:
                        </p>
                        <p className="text-sm text-gray-600">
                          {recognizedContact.notes}
                        </p>
                      </div>
                    )}

                    {recognizedContact.tags && recognizedContact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recognizedContact.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">
                    {isScanning
                      ? 'Point camera at a contact to recognize them'
                      : 'Start recognition to begin'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Make sure you have good lighting and face the camera
            directly for best recognition results.
          </p>
        </div>
      </div>
    </div>
  );
}
