import React, { useState, useRef, useEffect } from 'react';
import { Persona, SessionLog } from '../types';
import { useLiveSession } from '../hooks/useLiveSession';
import Visualizer from './Visualizer';
import TypingIndicator from './TypingIndicator';
import Dropdown from './Dropdown'; // Import the new Dropdown component
import { extractTextFromPdf } from '../utils/pdf';
import { VOICES, LANGUAGES } from '../constants';
import { saveSession, getPersonaPreference, savePersonaPreference } from '../utils/storage';

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

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sessionStartTimeRef = useRef<number>(0);

  // Load Preferences on Mount
  useEffect(() => {
    const prefs = getPersonaPreference(persona.id);
    if (prefs) {
        if (prefs.voiceName) setSelectedVoice(prefs.voiceName);
        if (prefs.language) setSelectedLanguage(prefs.language);
    }
  }, [persona.id]);

  const { isConnected, status, volume, connect, disconnect, isError, messages } = useLiveSession({
    systemInstruction: persona.systemInstruction,
    initialContext: fileContent,
    additionalContext: textInput,
    voiceName: selectedVoice,
    language: selectedLanguage,
    videoRef: persona.requiresCamera ? videoRef : undefined,
  });

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Heuristic for "Thinking" state
  useEffect(() => {
    const INPUT_THRESHOLD = 25; 
    const OUTPUT_THRESHOLD = 15; 
    
    const now = Date.now();
    
    if (volume.input > INPUT_THRESHOLD) {
        lastVoiceActivityTime.current = now;
        if (isThinking) setIsThinking(false);
    } else if (volume.output > OUTPUT_THRESHOLD) {
        if (isThinking) setIsThinking(false);
    } else {
        const timeSinceSpeech = now - lastVoiceActivityTime.current;
        if (timeSinceSpeech > 500 && timeSinceSpeech < 3000 && isConnected) {
             if (!isThinking) setIsThinking(true);
        } else {
             if (isThinking) setIsThinking(false);
        }
    }
  }, [volume, isConnected, isThinking]);

  // Handle Start
  const handleStart = () => {
    // Save preferences
    savePersonaPreference(persona.id, {
        voiceName: selectedVoice,
        language: selectedLanguage
    });

    setSetupComplete(true);
    sessionStartTimeRef.current = Date.now();
    connect();
  };

  // Handle End/Disconnect
  const handleDisconnect = async () => {
    if (messages.length > 0) {
        const sessionLog: SessionLog = {
            id: crypto.randomUUID(),
            personaId: persona.id,
            startTime: sessionStartTimeRef.current,
            endTime: Date.now(),
            messages: messages
        };
        saveSession(sessionLog);
    }
    await disconnect();
    onBack();
  };

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


  if (!setupComplete) {
    // Prepare options for Dropdowns
    const voiceOptions = VOICES.map(v => ({ value: v.name, label: v.label }));
    const languageOptions = LANGUAGES.map(l => ({ value: l, label: l }));

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 md:p-8 max-w-4xl mx-auto animate-float">
        <button onClick={onBack} className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back
        </button>
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${persona.color} flex items-center justify-center text-4xl mb-6 shadow-xl`}>
          {persona.icon}
        </div>
        <h2 className="text-3xl font-bold mb-4">Setup your Session</h2>
        <p className="text-gray-400 text-center mb-8 max-w-lg">
            Customize the voice and language for your conversation with the <strong>{persona.title}</strong>.
        </p>
        
        <div className="w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Context Inputs */}
                <div className="space-y-4">
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

                    {persona.requiresCamera && (
                        <div className="bg-orange-900/30 border border-orange-700 rounded-xl p-4 flex items-start">
                             <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                             <p className="text-sm text-orange-200">
                                 This persona requires access to your camera to see what you are showing. Please allow camera permissions when prompted.
                             </p>
                        </div>
                    )}
                    
                    {/* Placeholder for left column if no inputs needed, or just let grid handle it */}
                    {!persona.requiresFile && !persona.textInputLabel && !persona.requiresCamera && (
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 flex items-center justify-center text-gray-500 italic h-full">
                            No additional context required for this persona.
                        </div>
                    )}
                </div>

                {/* Right Column: Configuration (Voice & Language) */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        Conversation Settings
                    </h3>
                    
                    <Dropdown 
                        label="Voice Selection"
                        options={voiceOptions}
                        selectedValue={selectedVoice}
                        onChange={setSelectedVoice}
                    />

                    <Dropdown 
                        label="Language"
                        options={languageOptions}
                        selectedValue={selectedLanguage}
                        onChange={setSelectedLanguage}
                    />
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
            {isProcessing ? 'Processing File...' : 'Start Session'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
       {/* Header */}
       <div className="flex-shrink-0 w-full p-4 md:p-6 flex justify-between items-center bg-gray-900 border-b border-gray-800 z-10">
         <button onClick={handleDisconnect} className="text-gray-400 hover:text-white flex items-center transition-colors bg-gray-800 rounded-full px-4 py-2 hover:bg-gray-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            End & Save
         </button>
         <div className="flex items-center space-x-2 bg-gray-800 rounded-full px-4 py-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-300">{status}</span>
         </div>
       </div>

       <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
           
           {/* Visualizer Area */}
           <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8 bg-gray-900 overflow-y-auto">
              <div className="text-center space-y-4">
                 <div className={`inline-block p-4 rounded-full bg-gray-800/50 backdrop-blur border border-gray-700 mb-4`}>
                    <span className="text-5xl md:text-6xl">{persona.icon}</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{persona.title}</h2>
                 <div className="flex flex-wrap gap-2 justify-center">
                     {fileName && (
                         <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-400">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            {fileName}
                         </div>
                     )}
                     <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-400">
                        <span className="mr-1">🗣️</span> {selectedVoice}
                     </div>
                 </div>
              </div>

              <div className="flex items-center justify-center space-x-8 md:space-x-12 w-full max-w-4xl px-4">
                 {/* User Visualizer / Camera */}
                 <div className="flex flex-col items-center space-y-4 relative">
                    {persona.requiresCamera ? (
                        <div className="relative w-48 h-36 md:w-64 md:h-48 bg-black rounded-lg overflow-hidden border-2 border-gray-700 shadow-2xl">
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
                 <div className="hidden md:block h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>

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

           {/* Chat Log Area */}
           <div className="w-full md:w-80 lg:w-96 bg-gray-800 border-l border-gray-700 flex flex-col h-1/2 md:h-auto">
               <div className="p-4 border-b border-gray-700 font-semibold text-gray-300">
                   Transcript
               </div>
               <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4">
                   {messages.length === 0 && (
                       <p className="text-center text-gray-500 text-sm mt-10 italic">Conversation will appear here...</p>
                   )}
                   {messages.map((msg, idx) => (
                       <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                           <div 
                               className={`px-4 py-2 rounded-2xl max-w-[90%] text-sm ${
                                   msg.role === 'user' 
                                   ? 'bg-blue-600 text-white rounded-br-none' 
                                   : 'bg-gray-700 text-gray-200 rounded-bl-none'
                               }`}
                           >
                               {msg.text}
                           </div>
                           <span className="text-[10px] text-gray-500 mt-1">
                               {msg.role === 'user' ? 'You' : persona.title}
                           </span>
                       </div>
                   ))}
                   {isThinking && (
                       <div className="flex flex-col items-start">
                           <div className="bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-none text-gray-400 text-sm italic">
                               Thinking...
                           </div>
                       </div>
                   )}
               </div>
           </div>
       </div>
    </div>
  );
};

export default SessionView;