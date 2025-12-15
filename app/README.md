# TalkToMeAI - Mobile App

This is the mobile version of TalkToMeAI, built with **React Native** and **Expo**.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Expo Go** app installed on your physical device (iOS/Android) OR an Android Emulator / iOS Simulator.

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file in this directory (`app/`) with your Gemini API Key:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run the App:**
   ```bash
   npx expo start
   ```

4. **Connect:**
   - **Physical Device:** Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android).
   - **Simulator:** Press `i` to open in iOS Simulator.
   - **Emulator:** Press `a` to open in Android Emulator.

## 📱 Features

- **Real-time Voice:** Talk to the AI personalities with low latency.
- **Visual Context:** Grant camera permissions to let the AI "see" your world (e.g., show ingredients to the Chef persona).
- **Personas:** Switch between Lawyer, Chef, Psychologist, and more.

## 🛠️ Tech Stack

- **Framework:** Expo (React Native)
- **Routing:** Expo Router
- **Styling:** NativeWind (Tailwind CSS)
- **AI:** Google GenAI SDK
- **Audio:** Expo AV
- **Camera:** Expo Camera

For full project details, see the [Root README](../README.md).
