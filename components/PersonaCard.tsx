import React from 'react';
import { Persona } from '../types';

interface PersonaCardProps {
  persona: Persona;
  onClick: (persona: Persona) => void;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona, onClick }) => {
  return (
    <button
      onClick={() => onClick(persona)}
      className="group relative overflow-hidden rounded-2xl bg-gray-800 p-6 text-left hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-gray-500 shadow-lg hover:shadow-2xl flex flex-col h-full"
    >
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <span className="text-8xl">{persona.icon}</span>
      </div>
      
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${persona.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        {persona.icon}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{persona.title}</h3>
      <p className="text-gray-400 text-sm mb-4 flex-grow">{persona.description}</p>
      
      <div className="mt-auto flex items-center text-sm font-medium text-gray-300 group-hover:text-white">
        <span>Start Session</span>
        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </button>
  );
};

export default PersonaCard;
