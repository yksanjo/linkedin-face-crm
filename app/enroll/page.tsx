'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from '@/components/Webcam';
import { saveContact } from '@/lib/storage';
import { Contact } from '@/types';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

// Prevent SSR for this page
export const dynamic = 'force-dynamic';

export default function EnrollPage() {
  const router = useRouter();
  const [modelsReady, setModelsReady] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    title: '',
    linkedinUrl: '',
    email: '',
    phone: '',
    notes: '',
    tags: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initModels = async () => {
      const { loadModels } = await import('@/lib/faceapi');
      await loadModels();
      setModelsReady(true);
    };
    initModels();
  }, []);

  const handleCapture = async (canvas: HTMLCanvasElement) => {
    setIsProcessing(true);
    setError('');

    try {
      const { detectFaceAndGetDescriptor } = await import('@/lib/faceapi');
      const descriptor = await detectFaceAndGetDescriptor(canvas);

      if (!descriptor) {
        setError('No face detected. Please ensure your face is clearly visible.');
        setIsProcessing(false);
        return;
      }

      setFaceDescriptor(Array.from(descriptor));
      setCapturedImage(canvas.toDataURL('image/jpeg', 0.8));
      setIsProcessing(false);
    } catch (err) {
      setError('Error detecting face. Please try again.');
      setIsProcessing(false);
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!faceDescriptor || !capturedImage) {
      setError('Please capture a photo first.');
      return;
    }

    if (!formData.name || !formData.company) {
      setError('Name and Company are required.');
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      name: formData.name,
      company: formData.company,
      title: formData.title,
      linkedinUrl: formData.linkedinUrl,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      faceDescriptor,
      imageUrl: capturedImage,
      createdAt: new Date().toISOString(),
    };

    saveContact(contact);
    router.push('/contacts');
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
          Enroll New Contact
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Camera Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Capture Face Photo
            </h2>

            {!modelsReady ? (
              <div className="bg-gray-900 rounded-lg h-[480px] flex items-center justify-center text-white">
                Loading face detection models...
              </div>
            ) : faceDescriptor ? (
              <div className="space-y-4">
                <img
                  src={capturedImage}
                  alt="Captured face"
                  className="w-full rounded-lg"
                />
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Face captured successfully!</span>
                </div>
                <button
                  onClick={() => {
                    setFaceDescriptor(null);
                    setCapturedImage('');
                  }}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Retake Photo
                </button>
              </div>
            ) : (
              <Webcam onCapture={handleCapture} />
            )}

            {isProcessing && (
              <div className="mt-4 text-center text-gray-600">
                Processing face...
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Contact Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedinUrl: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="colleague, conference, investor"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={!faceDescriptor}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Save Contact
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
