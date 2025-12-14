# TalkToMeAI

TalkToMeAI is a real-time multimodal conversation application that allows you to talk to specialized AI personalities. Powered by the **Google Gemini Live API**, it supports low-latency voice interactions, real-time video context, and document analysis.

Whether you need legal perspective, interview practice, culinary advice, or spiritual guidance, TalkToMeAI provides an immersive, voice-first experience with "eyes and ears."

## ✨ Key Features

- **🗣️ Real-time Voice Conversations:** Talk naturally with the AI with ultra-low latency. The AI listens, interrupts when needed, and responds instantly.
- **🎭 Specialized Personas:** Choose from over 10 expert agents with distinct personalities and system instructions:
  - **Lawyer:** Discuss legal documents and contracts.
  - **Interviewer:** Practice for job interviews with a tough recruiter.
  - **Chef:** Get cooking advice by showing your ingredients via camera.
  - **Handyman:** Fix household issues by pointing your camera at the problem.
  - **Psychologist:** A safe space for empathetic support.
  - **Spiritual Master:** Wisdom from philosophical traditions.
  - **And more:** Fitness Coach, Travel Guide, Teacher, Real Estate Agent, Dating Coach.
- **👁️ Vision & Camera Support:** "Eyes on your world." Personas like the Chef and Handyman can see your environment through your camera to provide specific, visual feedback.
- **📄 Document Context:** Upload PDFs or text files to give the AI context (e.g., upload a resume for the Interviewer or a contract for the Lawyer).
- **🎨 Visualizations:** Real-time audio waveform visualizations for both your voice and the AI's response.
- **🛠️ Custom Agents:** Create your own persona by writing a custom system prompt.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Google Cloud Project** with Gemini API access
- **Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/TalkToMeAI.git
   cd TalkToMeAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env.local` file in the root directory and add your API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   Navigate to `http://localhost:5173` to start using the app.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **AI/ML:** Google GenAI SDK (`@google/genai`) - Gemini 2.5 Live API
- **Audio/Video:** Web Audio API, MediaStream API (Camera/Microphone)

## 📖 How It Works

1. **Select a Persona:** Choose an expert agent from the dropdown.
2. **Provide Context (Optional):**
   - Upload a relevant document (e.g., PDF contract).
   - Enter specific text details (e.g., property address).
   - Enable your camera if the persona requires visual input.
3. **Connect:** Click "Start Session" to establish a WebSocket connection with the Gemini Live API.
4. **Interact:** Speak naturally. The application captures your audio (and video frames if enabled), sends them to the model, and plays back the generated audio response in real-time.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
