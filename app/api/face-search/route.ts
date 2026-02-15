/**
 * API Route: /api/face-search
 * 
 * POST endpoint that accepts an image and returns matching contact
 * 
 * Request:
 * {
 *   "image": "base64_encoded_image_data",
 *   "threshold": 0.6 (optional, default 0.6)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "match": {
 *     "contact": { ...contact data },
 *     "confidence": 95.5,
 *     "distance": 0.045
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllContacts } from '@/lib/supabase';
import * as faceapi from '@vladmandic/face-api';
import { createCanvas, loadImage } from 'canvas';

// Load models once at module level
let modelsLoaded = false;

async function ensureModelsLoaded() {
  if (modelsLoaded) return;
  
  const MODEL_URL = './public/models';
  
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  
  modelsLoaded = true;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { image, threshold = 0.6, userId } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    // Ensure models are loaded
    await ensureModelsLoaded();

    // Get all contacts for the user
    const contacts = await getAllContacts();

    if (contacts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No contacts in database' },
        { status: 404 }
      );
    }

    // Process image
    const imageData = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(imageData, 'base64');
    
    // Load image for face detection
    const img = await loadImage(buffer);
    
    // Detect face in uploaded image
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return NextResponse.json(
        { success: false, error: 'No face detected in image' },
        { status: 400 }
      );
    }

    const queryDescriptor = detection.descriptor;

    // Search for matches
    let bestMatch: { 
      contact: any; 
      distance: number;
      confidence: number;
    } | null = null;

    for (const contact of contacts) {
      if (!contact.faceDescriptor) continue;

      const storedDescriptor = new Float32Array(
        JSON.parse(contact.faceDescriptor)
      );

      const distance = faceapi.euclideanDistance(
        queryDescriptor,
        storedDescriptor
      );

      if (distance < threshold) {
        if (!bestMatch || distance < bestMatch.distance) {
          const confidence = Math.max(0, Math.min(100, (1 - distance) * 100));
          bestMatch = { contact, distance, confidence };
        }
      }
    }

    if (bestMatch) {
      return NextResponse.json({
        success: true,
        match: {
          contact: {
            id: bestMatch.contact.id,
            name: bestMatch.contact.name,
            title: bestMatch.contact.title,
            company: bestMatch.contact.company,
            linkedinUrl: bestMatch.contact.linkedinUrl,
            photoUrl: bestMatch.contact.photoUrl,
          },
          confidence: bestMatch.confidence,
          distance: bestMatch.distance,
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No matching contact found',
        searched: contacts.length,
      });
    }

  } catch (error) {
    console.error('Face search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/face-search',
    method: 'POST',
    description: 'Upload an image to search for matching contacts',
    usage: {
      body: {
        image: 'base64 encoded image string',
        threshold: 'optional, default 0.6 (lower = stricter)',
      }
    }
  });
}
