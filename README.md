# Video Summary & Quiz Generator

A full-stack web application that processes uploaded videos and YouTube links to automatically generate transcriptions, concise summaries, and interactive quizzes.

## 🚀 Features

- **User Authentication**: Secure signup and login using JWT and bcrypt.
- **Video Processing**: 
  - Upload local video files.
  - Process directly from YouTube links.
  - Automatic extraction of audio from video using FFmpeg.
- **AI Transcription**: High-quality automated transcription using AssemblyAI and Groq.
- **AI Summarization**: Generates logical, easy-to-read summaries of the video content.
- **Interactive Quizzes**: Generates quizzes based on video transcripts to test knowledge comprehension.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB (Mongoose)
- **Video/Audio Processing**: `fluent-ffmpeg`, `ffmpeg-static`, `@distube/ytdl-core`
- **AI & NLP Integrations**:
  - `openai`
  - `@google/generative-ai`
  - `assemblyai`
  - `groq-sdk`
- **Authentication**: `jsonwebtoken`, `bcryptjs`
- **File Uploads**: Multer (with Cloudinary optionally available)

## 📁 Project Structure

```
├── backend/            # Express Node.js server
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints (auth, transcript, sumary, quiz, upload, etc.)
│   ├── utils/          # Helper functions and AI integrations
│   ├── uploads/        # Temporary storage for uploaded videos
│   └── output/         # Processed audio files
│
└── frontend/           # React application
    ├── src/
    │   ├── components/ # Reusable UI components
    │   └── App.jsx     # Main React app entrypoint
    ├── public/         # Static assets
    └── package.json    # Frontend dependencies
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI
- API Keys for the AI services you plan to use (Groq, AssemblyAI, OpenAI, Gemini)

### 1. Clone the repository and install dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
Create a `.env` file in the `backend` directory based on `.env.example`. You may need:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# AI API Keys
GROQ_API_KEY=your_groq_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend (`frontend/.env`):**
Create a `.env` file inside the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Run the Application

Start both the frontend and backend servers.

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 📜 API Endpoints Overview

- **`POST /api/auth/*`** - Register, login, and authenticate users.
- **`POST /api/upload-convert`** - Upload a local video and convert it to audio.
- **`POST /api/youtube-convert`** - Process a YouTube URL and extract the audio.
- **`POST /api/assembly-transcript`** - Handle transcription with AssemblyAI.
- **`POST /api/groq-transcript`** - Handle transcription via Groq.
- **`POST /api/chunk-summary/*`** - Generate summaries from transcript chunks.
- **`POST /api/quiz/*`** - Generate interactive quizzes based on the transcripts.

---
*Built with React, Node.js, and Modern AI tools.*
