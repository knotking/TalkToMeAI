<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TalktoMeAI

**TalktoMeAI** is a real-time voice conversation application that enables natural, spoken interactions with specialized AI personas. Powered by Google's Gemini 2.5 Live API, the app provides immersive voice conversations with AI personalities tailored for specific use cases like legal consultation, job interview practice, psychological support, and more.

View your app in AI Studio: https://ai.studio/apps/drive/1P37Nwdn7KKOqupoE81JANsCe4vYK5g-H

## Features

- 🎙️ **Real-time Voice Conversations** - Natural, low-latency voice interactions powered by Gemini 2.5 Live API
- 👥 **Specialized AI Personas** - Choose from 7 different AI personalities, each optimized for specific scenarios
- 📄 **Document Support** - Upload PDFs, text files, and other documents for context-aware conversations
- 📷 **Video Support** - Visual assistance for the Handyman persona using camera feed
- 🌍 **Multi-language Support** - Conversations in 8 languages including English, Spanish, French, German, Portuguese, Hindi, Japanese, and Mandarin Chinese
- 🎵 **Voice Selection** - Choose from 5 different AI voices (Puck, Charon, Kore, Fenrir, Zephyr)
- 📊 **Audio Visualization** - Real-time audio level visualization for both input and output
- 🎨 **Modern UI** - Beautiful, responsive interface with dark theme

## Available Personas

### ⚖️ AI Lawyer
Discuss legal documents and get preliminary legal perspectives. Upload contracts or legal documents (PDF/Text) for analysis.

**Features:**
- Document analysis and legal perspective
- Professional and precise responses
- Always includes AI disclaimer

### 💼 AI Interviewer
Practice for your next job interview with a tough but fair AI interviewer. Upload your resume/CV for personalized interview questions.

**Features:**
- Mock interview based on your resume
- Probing questions about skills and experience
- Professional feedback

### 🧠 AI Psychologist
A safe space to discuss your feelings and get empathetic support.

**Features:**
- Empathetic, Rogerian-style counseling
- Active listening techniques
- Non-judgmental support

### 🧘 Spiritual Master
Seek guidance on life's big questions and find inner peace.

**Features:**
- Wisdom from various spiritual traditions
- Calm, metaphorical guidance
- Encourages reflection and mindfulness

### 🏡 Real Estate Agent
Expert advice on properties, market trends, and buying tips.

**Features:**
- Property address analysis (optional)
- Market trends and investment advice
- Professional real estate guidance

### 🎓 AI Teacher
Learn any topic with a patient, knowledgeable tutor.

**Features:**
- Personalized learning sessions
- Clear explanations with analogies
- Understanding verification through questions

### 🛠️ AI Handyman
Show the problem! Get expert DIY advice with visual assistance.

**Features:**
- Camera feed analysis
- Step-by-step repair instructions
- Safety-first approach with hazard warnings

## Prerequisites

- **Node.js** (v16 or higher recommended)
- **Google Gemini API Key** - Get your API key from [Google AI Studio](https://ai.google.dev/)
- **Microphone** - Required for voice conversations
- **Camera** - Optional, required only for the Handyman persona
- **Modern Browser** - Chrome, Firefox, Safari, or Edge with WebRTC support

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd TalkToMeAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```bash
   API_KEY=your_gemini_api_key_here
   ```
   
   Replace `your_gemini_api_key_here` with your actual Gemini API key.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## Usage

1. **Select a Persona**
   - Browse the available personas on the home screen
   - Click on a persona card to start a session

2. **Configure Your Session**
   - **File Upload** (if required): Upload PDFs, text files, or other supported formats
   - **Text Input** (if available): Enter additional context like property addresses
   - **Language**: Select your preferred language
   - **Voice**: Choose an AI voice that suits your preference
   - Click "Continue to Session" when ready

3. **Start Conversing**
   - Click "Start Conversation" to begin
   - Allow microphone (and camera if needed) permissions when prompted
   - Speak naturally - the AI will respond in real-time
   - Use "End Call" to finish the session

## Technical Details

### Technology Stack

- **Frontend Framework:** React 19.2.1
- **Language:** TypeScript 5.8.2
- **Build Tool:** Vite 6.2.0
- **AI API:** Google Gemini 2.5 Live API (`@google/genai`)
- **PDF Processing:** pdfjs-dist 4.0.379

### Architecture

- **Real-time Audio Processing:** Uses Web Audio API for audio capture and playback
- **Video Streaming:** Camera feed captured at 2 FPS for visual analysis
- **Document Processing:** PDF text extraction using pdfjs-dist
- **State Management:** React hooks for component state
- **Audio Visualization:** Real-time frequency analysis using AnalyserNode

### Supported File Formats

- **PDF:** `.pdf` files (text extraction)
- **Text:** `.txt`, `.md`, `.json`, `.csv` files

### Browser Permissions

The app requires:
- **Microphone** - For voice input
- **Camera** - Only for the Handyman persona

## Project Structure

```
TalkToMeAI/
├── components/          # React components
│   ├── PersonaCard.tsx      # Persona selection cards
│   ├── SessionView.tsx      # Main conversation interface
│   └── Visualizer.tsx       # Audio visualization component
├── hooks/              # Custom React hooks
│   └── useLiveSession.ts    # Gemini Live API integration
├── utils/              # Utility functions
│   ├── audio.ts            # Audio processing utilities
│   ├── image.ts            # Image/video frame capture
│   └── pdf.ts              # PDF text extraction
├── constants.ts        # App constants (personas, voices, languages)
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

## Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Tips for Best Experience

- **Use a wired connection or headphones** for the best audio experience and to avoid echo
- **Quiet environment** recommended for better speech recognition
- **Clear microphone** - Ensure your microphone is working and not muted
- **Stable internet connection** - Required for real-time streaming
- **Allow browser permissions** - Microphone (and camera if needed) permissions are required

## Limitations & Disclaimers

- **AI Lawyer:** This is not professional legal advice. Always consult a licensed attorney for legal matters.
- **AI Psychologist:** For serious mental health concerns or crisis situations, please seek immediate professional human help.
- **Internet Connection:** Requires stable internet connection for real-time streaming
- **Browser Compatibility:** Best experience on modern browsers with WebRTC support

## License

[Add your license information here]

## Contributing

[Add contribution guidelines if applicable]

## Support

For issues, questions, or feature requests, please [open an issue](link-to-issues) on GitHub.
