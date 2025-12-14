import React, { useState, useRef, useEffect } from 'react';
import { Persona, SessionLog } from '../types';
import { useLiveSession } from '../hooks/useLiveSession';
import Visualizer from './Visualizer';
import TypingIndicator from './TypingIndicator';
import Dropdown from './Dropdown';
import { extractTextFromPdf } from '../utils/pdf';
import { VOICES, LANGUAGES } from '../constants';
import { saveSession, getPersonaPreference, savePersonaPreference, generateId } from '../utils/storage';

interface SessionViewProps {
  persona: Persona;
  onBack: () => void;
}

const SessionView: React.FC<SessionViewProps> = ({ persona, onBack }) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [customSystemInstruction, setCustomSystemInstruction] = useState<string>(persona.systemInstruction);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [setupComplete, setSetupComplete] = useState<boolean>(false);
  
  // Configuration State
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  // Controls State
  const [micVolume, setMicVolume] = useState<number>(1.0);
  const [speakerVolume, setSpeakerVolume] = useState<number>(1.0);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(persona.requiresCamera || false);

  // UI State for Thinking Indicator
  const [isThinking, setIsThinking] = useState(false);
  const lastVoiceActivityTime = useRef<number>(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sessionStartTimeRef = useRef<number>(0);

  // Update instruction when persona changes
  useEffect(() => {
    setCustomSystemInstruction(persona.systemInstruction);
  }, [persona]);

  // Load Preferences on Mount
  useEffect(() => {
    const prefs = getPersonaPreference(persona.id);
    if (prefs) {
        if (prefs.voiceName) setSelectedVoice(prefs.voiceName);
        if (prefs.language) setSelectedLanguage(prefs.language);
    }
  }, [persona.id]);

  const { isConnected, status, volume, connect, disconnect, isError, messages } = useLiveSession({
    systemInstruction: customSystemInstruction,
    initialContext: fileContent,
    additionalContext: textInput,
    voiceName: selectedVoice,
    language: selectedLanguage,
    videoRef: videoRef, // Always pass ref, hook handles enabling/disabling
    inputVolume: micVolume,
    outputVolume: speakerVolume,
    isVideoEnabled: isCameraOn,
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
            id: generateId(),
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
      setFileContent('');

      try {
        if (file.type === 'application/pdf') {
          const text = await extractTextFromPdf(file);
          setFileContent(text);
        } else {
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
    // ... (Setup screen code remains the same as before) ...
    const voiceOptions = VOICES.map(v => ({ value: v.name, label: v.label }));
    const languageOptions = LANGUAGES.map(l => ({ value: l, label: l }));

    const isCustomPromptEmpty = persona.allowCustomPrompt && !customSystemInstruction.trim();
    const isFileMissing = persona.requiresFile && !fileContent;
    const isStartDisabled = isFileMissing || isCustomPromptEmpty || isProcessing;

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
                <div className="space-y-4">
                    {persona.allowCustomPrompt && (
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                System Instruction
                            </label>
                            <textarea
                                value={customSystemInstruction}
                                onChange={(e) => setCustomSystemInstruction(e.target.value)}
                                placeholder="E.g., You are a futuristic tour guide leading a tour of Mars. Be enthusiastic and describe the scenery vividly."
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 h-32 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 resize-none"
                            />
                        </div>
                    )}

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
                                 This persona works best with visual input. Camera will be enabled by default.
                             </p>
                        </div>
                    )}
                    
                    {!persona.requiresFile && !persona.textInputLabel && !persona.requiresCamera && !persona.allowCustomPrompt && (
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 flex items-center justify-center text-gray-500 italic h-full">
                            No additional context required for this persona.
                        </div>
                    )}
                </div>

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
            disabled={isStartDisabled}
            onClick={handleStart}
            className={`mt-8 py-3 px-8 rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105 ${
                !isStartDisabled
                ? `bg-gradient-to-r ${persona.color} text-white` 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
        >
            {isProcessing ? 'Processing File...' : 'Start Session'}
        </button>
      </div>
    );
  }

  // Active Session Layout
  return (
    <div className="flex flex-col h-full relative bg-gray-900">
       
       {/* Main Stage Area */}
       <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
           
           {/* Visualizer / Video Area */}
           <div className={`flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-all duration-500 ${isCameraOn ? 'bg-black' : 'bg-gray-900'}`}>
              
              {/* Persona Info Overlay (Top Left) */}
              <div className="absolute top-4 left-4 z-20 flex items-center space-x-3 bg-gray-900/60 backdrop-blur-md p-2 rounded-full border border-gray-700/50">
                   <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${persona.color} flex items-center justify-center text-lg`}>
                       {persona.icon}
                   </div>
                   <div className="pr-3">
                       <h2 className="text-sm font-bold text-white leading-none">{persona.title}</h2>
                       <div className="flex items-center space-x-2 mt-0.5">
                           <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                           <span className="text-[10px] text-gray-400 font-mono uppercase">{status}</span>
                       </div>
                   </div>
              </div>
              
              {/* Central Visual Layout */}
              {isCameraOn ? (
                   // Video Call Layout
                   <div className="w-full h-full relative flex items-center justify-center">
                        <video 
                            ref={videoRef} 
                            className="w-full h-full object-cover transform scale-x-[-1]"
                            autoPlay 
                            playsInline 
                            muted 
                        />
                        {/* AI Vision Indicator */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-gray-600 flex items-center space-x-2 animate-fade-in">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-white font-medium tracking-wide">AI IS WATCHING</span>
                        </div>

                        {/* AI Overlay on Video */}
                        <div className="absolute top-4 right-4 md:bottom-8 md:right-8 bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 border border-gray-700/50 shadow-2xl flex flex-col items-center z-10 w-32 md:w-48 transition-all">
                             <Visualizer volume={volume.output} isActive={isConnected} color={persona.color} />
                             {isThinking && (
                                <div className="mt-2 scale-75">
                                    <TypingIndicator />
                                </div>
                             )}
                        </div>
                   </div>
              ) : (
                   // Standard Audio Layout
                   <div className="flex flex-col items-center justify-center space-y-12 w-full max-w-4xl px-4 z-10">
                        {/* AI Avatar */}
                        <div className="relative group">
                             <div className={`absolute -inset-4 bg-gradient-to-r ${persona.color} opacity-20 rounded-full blur-2xl group-hover:opacity-30 transition-opacity duration-500`}></div>
                             <div className="flex flex-col items-center space-y-6 relative">
                                <div className="transform scale-150">
                                    <Visualizer volume={volume.output} isActive={isConnected} color={persona.color} />
                                </div>
                                
                                <div className={`h-6 transition-all duration-300 ${isThinking ? 'opacity-100' : 'opacity-0'}`}>
                                    <TypingIndicator />
                                </div>
                             </div>
                        </div>

                        {/* User Mic Visualizer */}
                        <div className="flex flex-col items-center space-y-2 opacity-60">
                            <Visualizer volume={volume.input} isActive={isConnected} color="from-gray-500 to-gray-600" />
                            <span className="text-sm font-medium text-gray-400 tracking-widest uppercase text-xs">Listening</span>
                        </div>
                   </div>
              )}
              
              {isError && (
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-900/90 border border-red-500 text-white px-6 py-4 rounded-xl max-w-md text-center z-50 backdrop-blur-sm shadow-2xl">
                    <p className="font-bold mb-2">Connection Error</p>
                    <p className="text-sm text-red-200">Please check your internet connection and permissions.</p>
                    <button onClick={connect} className="mt-4 bg-white text-red-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100">Retry</button>
                 </div>
              )}
           </div>

           {/* Transcript Sidebar (Hidden on mobile unless toggled, handled via simple responsive width for now) */}
           <div className="hidden lg:flex w-80 bg-gray-950 border-l border-gray-800 flex-col z-20">
               <div className="p-4 border-b border-gray-800 font-semibold text-gray-400 text-xs uppercase tracking-wider flex justify-between items-center">
                   <span>Transcript</span>
                   {fileName && <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-blue-300 truncate max-w-[100px]">{fileName}</span>}
               </div>
               <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4">
                   {messages.map((msg, idx) => (
                       <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                           <div 
                               className={`px-4 py-2 rounded-2xl max-w-[90%] text-sm ${
                                   msg.role === 'user' 
                                   ? 'bg-blue-600 text-white rounded-br-none' 
                                   : 'bg-gray-800 text-gray-300 rounded-bl-none border border-gray-700'
                               }`}
                           >
                               {msg.text}
                           </div>
                           <span className="text-[10px] text-gray-500 mt-1">
                               {msg.role === 'user' ? 'You' : persona.title}
                           </span>
                       </div>
                   ))}
               </div>
           </div>
       </div>

       {/* Control Bar (Bottom) */}
       <div className="bg-gray-900 border-t border-gray-800 p-4 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
              
              {/* Volume Sliders (Hidden on small mobile) */}
              <div className="hidden md:flex items-center space-x-6 w-1/3">
                  <div className="flex items-center space-x-2 w-full">
                       <span className="text-gray-500 text-xs">Mic</span>
                       <input 
                            type="range" min="0" max="2" step="0.1" 
                            value={micVolume}
                            onChange={(e) => setMicVolume(parseFloat(e.target.value))}
                            className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                       />
                  </div>
                  <div className="flex items-center space-x-2 w-full">
                       <span className="text-gray-500 text-xs">Vol</span>
                       <input 
                            type="range" min="0" max="2" step="0.1" 
                            value={speakerVolume}
                            onChange={(e) => setSpeakerVolume(parseFloat(e.target.value))}
                            className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                       />
                  </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center space-x-4 flex-grow md:flex-grow-0">
                   <button 
                        onClick={() => setIsCameraOn(!isCameraOn)}
                        className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isCameraOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                        title="Toggle Camera"
                   >
                       {isCameraOn ? (
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                       ) : (
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                       )}
                   </button>
                   
                   <button 
                        onClick={handleDisconnect}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all flex items-center"
                   >
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" /></svg>
                        End Call
                   </button>
              </div>

               {/* Spacer for layout balance */}
              <div className="hidden md:block w-1/3"></div>
          </div>
       </div>
    </div>
  );
};

export default SessionView;