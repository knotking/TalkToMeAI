import React, { useState } from 'react';
import { PERSONAS } from './constants';
import PersonaCard from './components/PersonaCard';
import SessionView from './components/SessionView';
import { Persona } from './types';

const App: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-purple-500 selection:text-white">
      {selectedPersona ? (
        <SessionView 
          persona={selectedPersona} 
          onBack={() => setSelectedPersona(null)} 
        />
      ) : (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <header className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg mb-4 animate-float">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
            </div>
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
              TalktoMeAI
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Experience real-time voice conversations with specialized AI personalities. 
              Powered by Gemini 2.5 Live API.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 px-4">
            {PERSONAS.map((persona) => (
              <PersonaCard 
                key={persona.id} 
                persona={persona} 
                onClick={setSelectedPersona} 
              />
            ))}
          </div>
          
          <footer className="mt-20 text-center text-gray-600 text-sm">
             <p>Use a wired connection or headphones for the best audio experience.</p>
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;