# TalktoMeAI

![TalktoMeAI Overview](banner.jpg)

**TalktoMeAI** is a cutting-edge web application that transforms standard AI interactions into immersive, real-time voice and video conversations. Powered by Google's **Gemini 2.5 Live API**, it enables users to speak naturally with specialized AI personas that listen, think, see, and respond with human-like intonation and sub-second latency.

Whether you need legal perspective on a contract, a fitness coach to check your form via camera, or a chef to help you cook dinner, TalktoMeAI provides a multimodal experience (Audio, Video, Text, and Images) tailored to your needs.

## 📹 Presentation

Watch our deep dive overview (powered by NotebookLM) to see how TalktoMeAI is changing the conversation.

[![TalktoMeAI Presentation](https://img.youtube.com/vi/YOUR_VIDEO_ID_HERE/maxresdefault.jpg)](https://youtu.be/YOUR_VIDEO_ID_HERE)

**Deep Dive Chapters:**
*   **00:00** - **Beyond the Textbox**: Moving from clunky turn-based chat to fluid, real-time conversation.
*   **00:59** - **Meet Your AI Experts**: specialized personas including Lawyers, Interviewers, and Chefs.
*   **02:25** - **A Truly Live Conversation**: How full-duplex audio makes it feel like a real phone call.
*   **03:23** - **The Tech Behind the Magic**: Powered by Gemini 2.5 Live API and React 19.
*   **04:02** - **Making It Your Own**: Customization, voice selection, and creating custom agents.

## 🚀 Key Features

### ⚡ Real-Time Interaction & Multimodal Intelligence
*   **Bidirectional Audio**: True full-duplex communication allowing for natural interruptions and pacing.
*   **Video Conferencing & Vision**:
    *   **AI Vision**: The AI can "see" you and your surroundings in real-time via your camera, providing feedback on posture, expressions, or objects.
    *   **Dynamic Camera Toggle**: Enable/disable video at any time during the call.
*   **Multimodal Chat**:
    *   **Text & Image Injection**: Send text messages or upload images directly into the live conversation for the AI to analyze instantly.
*   **Real-Time Knowledge (Grounding)**:
    *   **Google Search Integration**: The AI can fetch up-to-date information from the web.
    *   **Google Maps Integration**: The AI can find and locate places, providing clickable map links in the transcript.

### 🎭 Specialized Personas
Choose from a diverse range of expert agents, each pre-configured with unique system instructions and capabilities:

*   **Professional & Educational**:
    *   **⚖️ AI Lawyer**: Upload legal documents (PDF/Text) for preliminary analysis and discussion.
    *   **💼 AI Interviewer**: Upload your resume to practice for job interviews with a tough but fair recruiter.
    *   **🎓 AI Teacher**: A patient tutor ready to explain complex topics in simple terms.
    *   **🏡 Real Estate Agent**: Expert advice on property trends, buying, and selling (uses Maps grounding).

*   **Lifestyle & Hobbyist**:
    *   **👨‍🍳 AI Sous Chef**: Uses your **camera** to see ingredients and guide your cooking in real-time.
    *   **💪 Fitness Coach**: High-energy motivation and workout planning.
    *   **🛠️ AI Handyman**: Uses your **camera** to inspect household repairs and offer DIY solutions.
    *   **🌍 Travel Guide**: Plan dream vacations and explore local cultures (uses Search & Maps grounding).

*   **Personal & Wellness**:
    *   **🧠 AI Psychologist**: Empathetic, non-judgmental support for exploring your thoughts and feelings.
    *   **🧘 Spiritual Master**: Wisdom from various traditions to guide you toward inner peace.
    *   **💘 Dating Coach**: Advice on profiles, texting, and relationships.
    *   **✨ Custom Agent**: Create your own persona by writing a custom prompt.

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
*   **Tools & Grounding**: Integrated Google Search and Google Maps tools for real-time information retrieval.
*   **Audio Pipeline**: Custom Web Audio API implementation:
    *   `ScriptProcessorNode` for capturing raw PCM input (16kHz).
    *   `AudioBufferSourceNode` for scheduling gapless playback of received audio chunks (24kHz).
    *   `GainNode` for real-time volume adjustment.
    *   `AnalyserNode` for driving the visualizers.
*   **Video Processing**: HTML5 Canvas for capturing video frames and converting them to base64 for the model.
*   **Document Processing**: `pdfjs-dist` for client-side text extraction from PDFs.

## 📂 Project Structure

*   **`App.tsx`**: Main entry point, navigation, and persona selection.
*   **`hooks/useLiveSession.ts`**: Core logic hook managing the WebSocket connection, audio/video streaming, tools (Search/Maps), and state.
*   **`components/SessionView.tsx`**: The active call interface with visualizers, controls, chat logs, and media inputs.
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