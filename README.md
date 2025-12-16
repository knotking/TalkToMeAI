# TalkToMeAI

TalkToMeAI is a real-time multimodal conversation application that allows you to talk to specialized AI personalities. Powered by the **Google Gemini Live API**, it supports low-latency voice interactions, real-time video context, and document analysis.

Whether you need legal perspective, interview practice, culinary advice, or spiritual guidance, TalkToMeAI provides an immersive, voice-first experience with "eyes and ears."

<img width="2752" height="1536" alt="unnamed (1)" src="https://github.com/user-attachments/assets/8e6d35d8-661a-4ca3-a037-774cf327391c" />


https://github.com/user-attachments/assets/8904bc5e-107a-4b6d-a3ae-76be61406f2d



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

You can run TalkToMeAI as either a mobile app or a web application.

### 📱 Mobile App (Expo / React Native)

The mobile version is located in the `app/` directory.

#### Prerequisites
- Node.js (v18+)
- Expo Go app on your phone (iOS/Android) or a Simulator/Emulator.

#### Setup

1. **Navigate to the app directory:**
   ```bash
   cd app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file (or use `app.json` config if preferred for Expo Go, but `react-native-dotenv` is configured) or ensure your `EXPO_PUBLIC_GEMINI_API_KEY` is set.
   
   *For Expo Go, the safest way to test quickly is to add it to your `.env` file:*
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the app:**
   ```bash
   npx expo start
   ```
   - Scan the QR code with your phone (Android) or Camera (iOS).
   - Or press `i` for iOS Simulator, `a` for Android Emulator.

### 🌐 Web Application

The web version is located in the root directory.

#### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:5173`.

## 🛠️ Tech Stack

- **Mobile:** React Native, Expo, NativeWind, Expo AV, Expo Camera.
- **Web:** React 19, TypeScript, Vite, Tailwind CSS.
- **AI/ML:** Google GenAI SDK (`@google/genai`) - Gemini 2.5 Live API.
- **Audio/Video:** Web Audio API (Web), Expo AV (Mobile).

## 📖 How It Works

1. **Select a Persona:** Choose an expert agent from the dropdown.
2. **Provide Context (Optional):**
   - Upload a relevant document (Web only currently).
   - Enable your camera if the persona requires visual input.
3. **Connect:** Click "Start Session" to establish a WebSocket connection with the Gemini Live API.
4. **Interact:** Speak naturally. The application captures your audio (and video frames if enabled), sends them to the model, and plays back the generated audio response in real-time.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
