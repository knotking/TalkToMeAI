# TalktoMeAI

**TalktoMeAI** is a cutting-edge web application that enables real-time, low-latency voice conversations with specialized AI personas. Powered by Google's **Gemini 2.5 Live API**, it transforms standard text-based AI interactions into immersive, bidirectional audio (and video) experiences.

## 🚀 Key Features

### 🎭 Specialized Personas
Users can choose from a variety of pre-configured agents, each designed for specific use cases:
*   **AI Lawyer**: Analyzes uploaded contracts/legal docs and provides preliminary perspectives.
*   **AI Interviewer**: Conducts mock job interviews based on uploaded Resumes/CVs.
*   **AI Handyman**: Uses the device camera to visually inspect household issues and offer DIY advice.
*   **Psychologist & Spiritual Master**: Provides empathetic support and philosophical guidance.
*   **Custom Agent**: Allows users to define their own system prompts for unique roleplay scenarios.

### ⚡ Real-Time Interaction
*   **Live Audio Streaming**: Utilizes the Web Audio API to stream 16kHz audio input and play back 24kHz audio output with minimal latency.
*   **Multimodal Input**: Supports text, audio, and video (frame-by-frame streaming) inputs simultaneously.
*   **Reactive Visualizers**: Displays dynamic audio visualizations for both user input and AI output to indicate activity and connection status.

### 📂 Context Management
*   **File Injection**: Integrates `pdfjs-dist` to parse PDF and text files, injecting content directly into the model's context window.
*   **Session History**: Automatically saves conversation transcripts to local storage. Users can search, filter, and download transcripts as `.txt` files.

### ⚙️ Customization
*   **Voice Selection**: Choose from 5 distinct Google TTS voices (Puck, Charon, Kore, Fenrir, Zephyr).
*   **Language Support**: Multilingual support including English, Spanish, French, German, and more.

## 🛠 Technical Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS (Dark mode, responsive design, custom animations)
*   **AI Engine**: `@google/genai` SDK (targeting `gemini-2.5-flash-native-audio-preview`)
*   **Audio**: Custom `AudioContext` implementation for raw PCM encoding/decoding and buffer management.
*   **PDF Processing**: `pdfjs-dist` for client-side text extraction.

## 📂 Project Structure

*   **`App.tsx`**: Main entry point handling navigation and persona selection.
*   **`hooks/useLiveSession.ts`**: The core logic hook managing WebSocket connections, audio processing, video capture, and message handling.
*   **`components/SessionView.tsx`**: The active call interface, handling file uploads and media permissions.
*   **`utils/audio.ts`**: Utilities for `base64` conversion and PCM audio blob creation.
*   **`utils/storage.ts`**: LocalStorage wrappers for session persistence.

## 🔑 Setup & Requirements

The application requires a valid Google GenAI API Key with access to the Gemini 2.5 Live API.

1.  The API Key is injected via `process.env.API_KEY`.
2.  Microphone permissions are required for all personas.
3.  Camera permissions are specifically required for the **Handyman** persona.
