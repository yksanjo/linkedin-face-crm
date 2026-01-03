# LinkedIn Face Recognition CRM

A modern web-based facial recognition CRM system that helps you remember professional contacts at networking events. Built with Next.js, TypeScript, and face-api.js.

## Features

- **Real-time Face Recognition**: Instantly recognize contacts using your webcam
- **Contact Enrollment**: Capture faces with LinkedIn profile details
- **Contact Management**: Browse, search, and manage your professional network
- **Cross-Platform**: Works on Mac, Windows, mobile - any device with a browser
- **Privacy-First**: All data stored locally in your browser (LocalStorage)
- **Modern ML**: Uses TensorFlow.js-powered face recognition models

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Face Recognition**: @vladmandic/face-api (TensorFlow.js)
- **Storage**: LocalStorage (upgradeable to Supabase)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Webcam access
- Modern browser (Chrome, Firefox, Safari)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Download face-api models (if not already present):
```bash
node scripts/download-models.js
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Enroll Contacts

1. Click "Enroll Contact" on the homepage
2. Allow camera access
3. Capture photo and fill in LinkedIn profile details
4. Click "Save Contact"

### 2. Recognize Faces

1. Click "Recognize Faces" on the homepage
2. Start recognition and point camera at enrolled contacts
3. View their information in real-time!

### 3. Manage Contacts

1. Click "Manage Contacts" to browse and search your database
2. Click on any contact to view full details

## Deployment

Deploy to Vercel with one click or push to GitHub and import in Vercel:

```bash
vercel --prod
```

## License

MIT License
