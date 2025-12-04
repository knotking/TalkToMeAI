import React, { useState, useRef, useEffect } from 'react';
import { Persona } from '../types';
import { useLiveSession } from '../hooks/useLiveSession';
import Visualizer from './Visualizer';
import TypingIndicator from './TypingIndicator';
import { extractTextFromPdf } from '../utils/pdf';
import { VOICES, LANGUAGES } from '../constants';

interface SessionViewProps {
  persona: Persona;
  onBack: () => void;
}

const SessionView: React.FC<SessionViewProps> = ({ persona, onBack }) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [setupComplete, setSetupComplete] = useState<boolean>(false);
  
  // Configuration State
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  // UI State for Thinking Indicator
  const [isThinking, setIsThinking] = useState(false);
  const lastVoiceActivityTime = useRef<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  const { isConnected, status, volume, connect, disconnect, isError } = useLiveSession({
    systemInstruction: persona.systemInstruction,
    initialContext: fileContent,
    additionalContext: textInput,
    voiceName: selectedVoice,
    language: selectedLanguage,
    videoRef: persona.requiresCamera ? videoRef : undefined,
  });

  // Heuristic for "Thinking" state
  useEffect(() => {
    const INPUT_THRESHOLD = 25; // User speech threshold
    const OUTPUT_THRESHOLD = 15; // AI speech threshold
    
    const now = Date.now();
    
    // Check if user is speaking
    if (volume.input > INPUT_THRESHOLD) {
        lastVoiceActivityTime.current = now;
        if (isThinking) setIsThinking(false);
    } 
    // Check if AI is speaking
    else if (volume.output > OUTPUT_THRESHOLD) {
        if (isThinking) setIsThinking(false);
    } 
    // Silence / Processing Gap
    else {
        // If we had recent voice activity (within 3s) and silence has persisted for >500ms
        // we assume the AI is processing the response.
        const timeSinceSpeech = now - lastVoiceActivityTime.current;
        if (timeSinceSpeech > 500 && timeSinceSpeech < 3000 && isConnected) {
             if (!isThinking) setIsThinking(true);
        } else {
             if (isThinking) setIsThinking(false);
        }
    }
  }, [volume, isConnected, isThinking]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsProcessing(true);
      setFileContent(''); // Clear previous content while processing

      try {
        if (file.type === 'application/pdf') {
          const text = await extractTextFromPdf(file);
          setFileContent(text);
        } else {
          // Default text handling
          const text = await file.text();
          setFileContent(text);
        }
      } catch (err) {
        console.error("Failed to process file:", err);
        setFileName("Error processing file");
        setFileContent('');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleStart = () => {
    setSetupComplete(true);
  };

  if (!setupComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 max-w-2xl mx-auto animate-float">
        <button onClick={onBack} className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back
        </button>
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${persona.color} flex items-center justify-center text-4xl mb-6 shadow-xl`}>
          {persona.icon}
        </div>
        <h2 className="text-3xl font-bold mb-4">Setup your Session</h2>
        <p className="text-gray-400 text-center mb-8">
            Configure your conversation with the <strong>{persona.title}</strong>.
        </p>
        
        <div className="w-full space-y-4">
            {/* File Upload Section */}
            {persona.requiresFile && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {persona.fileLabel}
                    </label>
                    <div className="flex items-center space-x-4">
                        <label className={`cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors border border-gray-600 ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}>
                            <span>{isProcessing ? 'Processing...' : 'Choose File'}</span>
                            <input 
                            type="file" 
                            className="hidden" 
                            accept=".txt,.md,.json,.csv,.pdf" 
                            onChange={handleFileUpload} 
                            disabled={isProcessing}
                            />
                        </label>
                        <span className="text-gray-400 text-sm truncate">{fileName || "No file selected"}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Supported formats: .pdf, .txt, .md, .json</p>
                </div>
            )}

            {/* Text Input Section (e.g. Address) */}
            {persona.textInputLabel && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {persona.textInputLabel}
                    </label>
                    <input 
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type here..."
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                    />
                </div>
            )}
            
            {/* Camera Warning */}
            {persona.requiresCamera && (
                <div className="bg-orange-900/30 border border-orange-700 rounded-xl p-4 flex items-start">
                     <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                     <p className="text-sm text-orange-200">
                         This persona requires access to your camera to see what you are showing. Please allow camera permissions when prompted.
                     </p>
                </div>
            )}

            {/* Voice and Language Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                    <select 
                        value={selectedLanguage} 
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Voice</label>
                    <select 
                        value={selectedVoice} 
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {VOICES.map(voice => (
                            <option key={voice.name} value={voice.name}>{voice.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <button 
            disabled={(persona.requiresFile && !fileContent) || isProcessing}
            onClick={handleStart}
            className={`mt-8 py-3 px-8 rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105 ${
                (!persona.requiresFile || fileContent) && !isProcessing
                ? `bg-gradient-to-r ${persona.color} text-white` 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
        >
            {isProcessing ? 'Processing File...' : 'Continue to Session'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
       {/* Header */}
       <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
         <button onClick={() => { disconnect(); onBack(); }} className="text-gray-400 hover:text-white flex items-center transition-colors bg-gray-900/50 rounded-full px-4 py-2 backdrop-blur-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            End Session
         </button>
         <div className="flex items-center space-x-2 bg-gray-900/50 rounded-full px-4 py-2 backdrop-blur-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-300">{status}</span>
         </div>
       </div>

       {/* Main Content */}
       <div className="flex-grow flex flex-col items-center justify-center p-8 space-y-8">
          
          <div className="text-center space-y-4">
             <div className={`inline-block p-4 rounded-full bg-gray-800/50 backdrop-blur border border-gray-700 mb-4`}>
                <span className="text-6xl">{persona.icon}</span>
             </div>
             <h2 className="text-4xl font-bold text-white tracking-tight">{persona.title}</h2>
             <div className="flex items-center justify-center space-x-2">
                 {fileName && (
                     <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-400">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        {fileName}
                     </div>
                 )}
                 {textInput && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-400">
                        <span className="mr-1">📍</span> {textInput.length > 20 ? textInput.substring(0, 20) + '...' : textInput}
                     </div>
                 )}
                 <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-400">
                    <span className="mr-1">🗣️</span> {selectedVoice}
                 </div>
                 <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-400">
                    <span className="mr-1">🌐</span> {selectedLanguage}
                 </div>
             </div>
          </div>

          <div className="flex items-center justify-center space-x-12 w-full max-w-4xl">
             {/* User Visualizer / Camera */}
             <div className="flex flex-col items-center space-y-4 relative">
                {persona.requiresCamera ? (
                    <div className="relative w-64 h-48 bg-black rounded-lg overflow-hidden border-2 border-gray-700 shadow-2xl">
                        <video 
                            ref={videoRef} 
                            className={`w-full h-full object-cover transform scale-x-[-1] ${!isConnected ? 'opacity-50' : ''}`}
                            autoPlay 
                            playsInline 
                            muted 
                        />
                         {!isConnected && (
                             <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                 <span className="text-3xl">📷</span>
                             </div>
                         )}
                         <div className="absolute bottom-2 right-2 flex space-x-1">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                             <span className="text-[10px] text-white font-mono">LIVE</span>
                         </div>
                    </div>
                ) : (
                    <Visualizer volume={volume.input} isActive={isConnected} color="from-gray-500 to-gray-600" />
                )}
                <span className="text-sm font-medium text-gray-400">You</span>
             </div>

             {/* Connection Status / Divider */}
             <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>

             {/* AI Visualizer */}
             <div className="flex flex-col items-center space-y-4 relative">
                <Visualizer volume={volume.output} isActive={isConnected} color={persona.color} />
                <span className="text-sm font-medium text-gray-400">TalktoMeAI</span>
                
                {/* Typing Indicator Overlay */}
                <div className={`absolute -bottom-14 transition-all duration-500 transform ${isThinking ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                    <TypingIndicator />
                </div>
             </div>
          </div>

          {isError && (
             <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-xl max-w-md text-center">
                <p>Connection failed. Please ensure your microphone {persona.requiresCamera ? 'and camera' : ''} are enabled and try again.</p>
                <button onClick={connect} className="mt-2 text-sm underline hover:text-white">Retry Connection</button>
             </div>
          )}
       </div>

       {/* Controls */}
       <div className="p-8 flex justify-center pb-12">
          {!isConnected ? (
             <button 
                onClick={connect}
                className={`flex items-center space-x-3 px-8 py-4 rounded-full font-bold text-xl shadow-lg shadow-${persona.color.split('-')[1]}-500/20 bg-gradient-to-r ${persona.color} text-white transform transition-all hover:scale-105 active:scale-95`}
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                <span>Start Conversation</span>
             </button>
          ) : (
             <button 
                onClick={disconnect}
                className="flex items-center space-x-3 px-8 py-4 rounded-full font-bold text-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transform transition-all hover:scale-105 active:scale-95"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                <span>End Call</span>
             </button>
          )}
       </div>
    </div>
  );
};

export default SessionView;