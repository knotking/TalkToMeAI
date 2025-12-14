import React, { useState } from 'react';
import { PERSONAS } from './constants';
import SessionView from './components/SessionView';
import HistoryModal from './components/HistoryModal';
import AboutModal from './components/AboutModal';
import Dropdown from './components/Dropdown';
import { Persona } from './types';

const App: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [previewPersonaId, setPreviewPersonaId] = useState<string>(PERSONAS[0].id);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const previewPersona = PERSONAS.find(p => p.id === previewPersonaId) || PERSONAS[0];
  const personaOptions = PERSONAS.map(p => ({ value: p.id, label: p.title }));

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-purple-500 selection:text-white">
      {selectedPersona ? (
        <SessionView 
          persona={selectedPersona} 
          onBack={() => setSelectedPersona(null)} 
        />
      ) : (
        <div className="container mx-auto px-4 py-12 max-w-4xl relative min-h-screen flex flex-col justify-center">
          
          {/* Top Right Action Buttons */}
          <div className="absolute top-4 right-4 md:top-8 md:right-8 flex space-x-3 z-10">
            <button 
                onClick={() => setShowAbout(true)}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-700"
            >
                <span className="text-xl">ℹ️</span>
                <span className="hidden md:inline font-medium">About</span>
            </button>
            <button 
                onClick={() => setShowHistory(true)}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-700"
            >
                <span className="text-xl">📜</span>
                <span className="hidden md:inline font-medium">History</span>
            </button>
          </div>

          <header className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg mb-4 animate-float">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
              TalktoMeAI
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Experience real-time voice conversations with specialized AI personalities.
            </p>
          </header>

          <div className="w-full max-w-lg mx-auto bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700 shadow-2xl relative">
             <div className="mb-8">
                 <Dropdown 
                    label="Select a Persona"
                    options={personaOptions}
                    selectedValue={previewPersonaId}
                    onChange={setPreviewPersonaId}
                 />
             </div>

             {/* Preview Card */}
             <div className="flex flex-col items-center text-center animate-fade-in transition-all duration-300">
                <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${previewPersona.color} flex items-center justify-center text-6xl shadow-xl mb-6 ring-4 ring-gray-800 ring-offset-2 ring-offset-${previewPersona.color.split('-')[1]}-500`}>
                    {previewPersona.icon}
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">{previewPersona.title}</h2>
                <p className="text-gray-400 mb-6 leading-relaxed">{previewPersona.description}</p>
                
                <div className="flex justify-center gap-4 text-xs text-gray-500 font-mono bg-gray-900/50 rounded-lg p-3 w-full mb-6">
                    {previewPersona.requiresFile && (
                        <span className="flex items-center text-blue-400">
                             <span className="mr-1">📄</span> Requires File
                        </span>
                    )}
                    {previewPersona.requiresCamera && (
                        <span className="flex items-center text-orange-400">
                             <span className="mr-1">📷</span> Requires Camera
                        </span>
                    )}
                    {!previewPersona.requiresFile && !previewPersona.requiresCamera && (
                         <span className="flex items-center text-green-400">
                             <span className="mr-1">⚡</span> Instant Start
                        </span>
                    )}
                </div>

                <button 
                    onClick={() => setSelectedPersona(previewPersona)}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center bg-gradient-to-r ${previewPersona.color} text-white`}
                >
                    Start Session
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </button>
             </div>
          </div>
          
          <footer className="mt-12 text-center text-gray-600 text-sm">
             <p>Powered by Gemini 2.5 Live API</p>
          </footer>

          {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
          {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
        </div>
      )}
    </div>
  );
};

export default App;