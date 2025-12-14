# TalktoMeAI

**TalktoMeAI** is a cutting-edge web application that transforms standard AI interactions into immersive, real-time voice and video conversations. Powered by Google's **Gemini 2.5 Live API**, it enables users to speak naturally with specialized AI personas that listen, think, see, and respond with human-like intonation and sub-second latency.

Whether you need legal perspective on a contract, a fitness coach to check your form via camera, or a chef to help you cook dinner, TalktoMeAI provides a multimodal experience (Audio, Video, and Text) tailored to your needs.

## 🚀 Key Features

### 🎭 Specialized Personas
Choose from a diverse range of expert agents, each pre-configured with unique system instructions and capabilities:

*   **Professional & Educational**:
    *   **⚖️ AI Lawyer**: Upload legal documents (PDF/Text) for preliminary analysis and discussion.
    *   **💼 AI Interviewer**: Upload your resume to practice for job interviews with a tough but fair recruiter.
    *   **🎓 AI Teacher**: A patient tutor ready to explain complex topics in simple terms.
    *   **🏡 Real Estate Agent**: Expert advice on property trends, buying, and selling.

*   **Lifestyle & Hobbyist**:
    *   **👨‍🍳 AI Sous Chef**: Uses your **camera** to see ingredients and guide your cooking in real-time.
    *   **💪 Fitness Coach**: High-energy motivation and workout planning.
    *   **🛠️ AI Handyman**: Uses your **camera** to inspect household repairs and offer DIY solutions.
    *   **🌍 Travel Guide**: Plan dream vacations and explore local cultures.

*   **Personal & Wellness**:
    *   **🧠 AI Psychologist**: Empathetic, non-judgmental support for exploring your thoughts and feelings.
    *   **🧘 Spiritual Master**: Wisdom from various traditions to guide you toward inner peace.
    *   **💘 Dating Coach**: Advice on profiles, texting, and relationships.
    *   **✨ Custom Agent**: Create your own persona by writing a custom prompt.

### ⚡ Real-Time Interaction
*   **Bidirectional Audio**: True full-duplex communication allowing for natural interruptions and pacing.
*   **Video Conferencing & Vision**:
    *   **Dynamic Camera Toggle**: Enable your camera at any time during a session to switch to a video call interface.
    *   **AI Vision**: The AI can "see" you and your surroundings in real-time, allowing for visual feedback on posture, expressions, or objects you show it.
    *   **Specialized Vision Personas**: Pre-configured personas like the Chef and Handyman utilize this by default to provide visual guidance.
*   **Volume Control**: Integrated input (Microphone) and output (Speaker) gain controls to adjust audio levels on the fly.
*   **Reactive Visualizers**: Dynamic audio visualizations that respond to voice activity for both the user and the AI.

### 📂 Context & History
*   **File Injection**: Drag-and-drop support for PDF and text files (`.txt`, `.md`, `.json`, `.csv`) to give the AI specific context.
*   **Session History**: Automatically saves conversation transcripts locally.
*   **Export**: Download transcripts as `.txt` files for your records.

### ⚙️ Customization
*   **Voice Selection**: Toggle between 5 distinct Google TTS voices (Puck, Charon, Kore, Fenrir, Zephyr).
*   **Language Support**: Converse in multiple languages including English, Spanish, French, German, Japanese, and more.

## 🛠 Technical Stack

This project is built as a showcase of the Gemini 2.5 Live API capabilities.

*   **Frontend Framework**: React 19 + TypeScript
*   **Styling**: Tailwind CSS with custom animations (fade-ins, floating effects).
*   **AI Engine**: `@google/genai` SDK targeting the `gemini-2.5-flash-native-audio-preview` model.
*   **Audio Pipeline**: Custom Web Audio API implementation:
    *   `ScriptProcessorNode` for capturing raw PCM input (16kHz).
    *   `AudioBufferSourceNode` for scheduling gapless playback of received audio chunks (24kHz).
    *   `GainNode` for real-time volume adjustment.
    *   `AnalyserNode` for driving the visualizers.
*   **Video Processing**: HTML5 Canvas for capturing video frames and converting them to base64 for the model.
*   **Document Processing**: `pdfjs-dist` for client-side text extraction from PDFs.

## 📂 Project Structure

*   **`App.tsx`**: Main entry point, navigation, and persona selection.
*   **`hooks/useLiveSession.ts`**: Core logic hook managing the WebSocket connection, audio/video streaming, volume gain, and state.
*   **`components/SessionView.tsx`**: The active call interface with visualizers, controls, and chat logs.
*   **`components/Visualizer.tsx`**: Canvas-free, CSS-based reactive audio visualizers.
*   **`utils/audio.ts`**: Low-level audio encoding/decoding utilities.
*   **`constants.ts`**: Configuration for personas, voices, and languages.

## 🔑 Setup & Requirements

1.  **API Key**: This application requires a valid Google GenAI API Key with access to the Gemini 2.5 Live API. The key is injected via `process.env.API_KEY`.
2.  **Hardware Permissions**:
    *   **Microphone**: Required for all personas.
    *   **Camera**: Required for video conferencing features and vision-enabled personas (Chef, Handyman, etc.).

---
*Powered by Gemini 2.5 Flash Native Audio*