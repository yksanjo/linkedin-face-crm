import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;

  const MODEL_URL = '/models';

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
}

export async function detectFaceAndGetDescriptor(
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  const detection = await faceapi
    .detectSingleFace(input)
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection?.descriptor || null;
}

export async function detectAllFaces(
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
) {
  return await faceapi
    .detectAllFaces(input)
    .withFaceLandmarks()
    .withFaceDescriptors();
}

export function findBestMatch(
  faceDescriptor: Float32Array,
  labeledDescriptors: faceapi.LabeledFaceDescriptors[]
): faceapi.FaceMatch {
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
  return faceMatcher.findBestMatch(faceDescriptor);
}
